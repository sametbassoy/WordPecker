import { supabase } from './supabaseService';
import { WordList, Word } from '../types';

// Basit UUID oluşturma fonksiyonu
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Kelime listesi servisi
export const wordListService = {
  // Kullanıcının tüm kelime listelerini getir
  getWordLists: async (userId: string): Promise<WordList[]> => {
    try {
      const { data, error } = await supabase
        .from('word_lists')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching word lists:', error);
      throw error;
    }
  },

  // Belirli bir kelime listesini getir
  getWordList: async (listId: string): Promise<WordList> => {
    try {
      const { data, error } = await supabase
        .from('word_lists')
        .select('*')
        .eq('id', listId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error(`Error fetching word list ${listId}:`, error);
      throw error;
    }
  },

  // Yeni kelime listesi oluştur
  createWordList: async (list: Partial<WordList>): Promise<WordList> => {
    try {
      const newList = {
        ...list,
        id: generateUUID(),
        created_at: new Date().toISOString(),
        word_count: 0,
        progress: 0,
      };

      const { data, error } = await supabase
        .from('word_lists')
        .insert([newList])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating word list:', error);
      throw error;
    }
  },

  // Kelime listesini güncelle
  updateWordList: async (list: WordList): Promise<WordList> => {
    try {
      const { data, error } = await supabase
        .from('word_lists')
        .update(list)
        .eq('id', list.id)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error(`Error updating word list ${list.id}:`, error);
      throw error;
    }
  },

  // Kelime listesini sil
  deleteWordList: async (listId: string): Promise<void> => {
    try {
      // Önce listedeki kelimeleri sil
      const { error: wordsError } = await supabase
        .from('words')
        .delete()
        .eq('list_id', listId);

      if (wordsError) throw wordsError;

      // Sonra listeyi sil
      const { error } = await supabase
        .from('word_lists')
        .delete()
        .eq('id', listId);

      if (error) throw error;
    } catch (error) {
      console.error(`Error deleting word list ${listId}:`, error);
      throw error;
    }
  },

  // Listedeki kelimeleri getir
  getWords: async (listId: string): Promise<Word[]> => {
    try {
      const { data, error } = await supabase
        .from('words')
        .select('*')
        .eq('list_id', listId)
        .order('original');

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error(`Error fetching words for list ${listId}:`, error);
      throw error;
    }
  },

  // Kelime ekle
  addWord: async (word: Partial<Word>): Promise<Word> => {
    try {
      const newWord = {
        ...word,
        id: generateUUID(),
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('words')
        .insert([newWord])
        .select()
        .single();

      if (error) throw error;

      // Liste kelime sayısını güncelle
      await wordListService.updateListWordCount(word.list_id as string);

      return data;
    } catch (error) {
      console.error('Error adding word:', error);
      throw error;
    }
  },

  // Toplu kelime ekleme
  addMultipleWords: async (words: Partial<Word>[]): Promise<void> => {
    if (words.length === 0) return;

    try {
      const newWords = words.map(word => ({
        ...word,
        id: generateUUID(),
        created_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('words')
        .insert(newWords);

      if (error) throw error;

      // Liste kelime sayısını güncelle
      await wordListService.updateListWordCount(words[0].list_id as string);
    } catch (error) {
      console.error('Error adding multiple words:', error);
      throw error;
    }
  },

  // Kelimeyi güncelle
  updateWord: async (word: Word): Promise<Word> => {
    try {
      const { data, error } = await supabase
        .from('words')
        .update(word)
        .eq('id', word.id)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error(`Error updating word ${word.id}:`, error);
      throw error;
    }
  },

  // Kelimeyi sil
  deleteWord: async (wordId: string): Promise<void> => {
    try {
      // Önce kelimeyi al (liste ID'si için)
      const { data: word, error: fetchError } = await supabase
        .from('words')
        .select('list_id')
        .eq('id', wordId)
        .single();

      if (fetchError) throw fetchError;

      // Kelimeyi sil
      const { error } = await supabase
        .from('words')
        .delete()
        .eq('id', wordId);

      if (error) throw error;

      // Liste kelime sayısını güncelle
      if (word) {
        await wordListService.updateListWordCount(word.list_id);
      }
    } catch (error) {
      console.error(`Error deleting word ${wordId}:`, error);
      throw error;
    }
  },

  // Liste kelime sayısını güncelle
  updateListWordCount: async (listId: string): Promise<void> => {
    try {
      // Listedeki kelime sayısını al
      const { count, error: countError } = await supabase
        .from('words')
        .select('*', { count: 'exact', head: true })
        .eq('list_id', listId);

      if (countError) throw countError;

      // Listedeki ortalama hakimiyet seviyesini hesapla
      const { data: words, error: wordsError } = await supabase
        .from('words')
        .select('mastery_level')
        .eq('list_id', listId);

      if (wordsError) throw wordsError;

      let progress = 0;
      if (words && words.length > 0) {
        const totalMastery = words.reduce((sum, word) => sum + word.mastery_level, 0);
        progress = totalMastery / (words.length * 5); // 5 maksimum hakimiyet seviyesi
      }

      // Listeyi güncelle
      const { error: updateError } = await supabase
        .from('word_lists')
        .update({
          word_count: count || 0,
          progress,
        })
        .eq('id', listId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error(`Error updating word count for list ${listId}:`, error);
      throw error;
    }
  },

  // Kelime listelerinde arama
  searchWordLists: async (userId: string, query: string): Promise<WordList[]> => {
    try {
      const { data, error } = await supabase
        .from('word_lists')
        .select('*')
        .eq('user_id', userId)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error searching word lists:', error);
      throw error;
    }
  },

  // Kelimelerde arama
  searchWords: async (userId: string, query: string): Promise<Word[]> => {
    try {
      // Önce kullanıcının listelerini al
      const { data: lists, error: listsError } = await supabase
        .from('word_lists')
        .select('id')
        .eq('user_id', userId);

      if (listsError) throw listsError;

      if (!lists || lists.length === 0) {
        return [];
      }

      const listIds = lists.map(list => list.id);

      // Kelimelerde arama yap
      const { data, error } = await supabase
        .from('words')
        .select('*')
        .in('list_id', listIds)
        .or(`original.ilike.%${query}%,translation.ilike.%${query}%,context.ilike.%${query}%,notes.ilike.%${query}%`);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error searching words:', error);
      throw error;
    }
  },
};

// Simülasyon için mock veri oluşturma (gerçek uygulamada kaldırılacak)
export const createMockData = async (userId: string) => {
  try {
    // Örnek listeler
    const lists = [
      {
        name: 'İngilizce Temel Kelimeler',
        description: 'Günlük konuşmada en sık kullanılan İngilizce kelimeler',
        language: 'en',
        user_id: userId,
      },
      {
        name: 'Almanca Seyahat',
        description: 'Almanya seyahatinde işinize yarayacak temel kelimeler',
        language: 'de',
        user_id: userId,
      },
      {
        name: 'İspanyolca İş Terimleri',
        description: 'İş hayatında kullanılan İspanyolca terimler',
        language: 'es',
        user_id: userId,
      },
    ];

    // Listeleri oluştur
    for (const list of lists) {
      const createdList = await wordListService.createWordList(list);

      // Örnek kelimeler
      const words = [];

      if (list.language === 'en') {
        words.push(
          { original: 'hello', translation: 'merhaba', context: 'Hello, how are you?', mastery_level: 4 },
          { original: 'world', translation: 'dünya', context: 'Hello world!', mastery_level: 3 },
          { original: 'book', translation: 'kitap', context: 'I read a book yesterday.', mastery_level: 5 },
          { original: 'car', translation: 'araba', context: 'I drive a car to work.', mastery_level: 2 },
          { original: 'house', translation: 'ev', context: 'My house is big.', mastery_level: 4 },
        );
      } else if (list.language === 'de') {
        words.push(
          { original: 'hallo', translation: 'merhaba', context: 'Hallo, wie geht es dir?', mastery_level: 3 },
          { original: 'bitte', translation: 'lütfen', context: 'Bitte schön!', mastery_level: 2 },
          { original: 'danke', translation: 'teşekkürler', context: 'Vielen Danke!', mastery_level: 4 },
          { original: 'entschuldigung', translation: 'özür dilerim', context: 'Entschuldigung, wo ist der Bahnhof?', mastery_level: 1 },
        );
      } else if (list.language === 'es') {
        words.push(
          { original: 'hola', translation: 'merhaba', context: '¡Hola, cómo estás?', mastery_level: 2 },
          { original: 'trabajo', translation: 'iş', context: 'Me gusta mi trabajo.', mastery_level: 1 },
          { original: 'reunión', translation: 'toplantı', context: 'Tenemos una reunión mañana.', mastery_level: 0 },
        );
      }

      // Kelimeleri ekle
      for (const word of words) {
        await wordListService.addWord({
          ...word,
          list_id: createdList.id,
        });
      }
    }

    console.log('Mock data created successfully');
  } catch (error) {
    console.error('Error creating mock data:', error);
  }
};

export default wordListService;
