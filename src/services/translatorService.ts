// Yapay zeka destekli tercüman servisi
// Bu servis, İngilizce metinleri Türkçe'ye çevirmek için kullanılır

import axios from 'axios';

// Çeviri sonucu tipi
export interface TranslationResult {
  originalText: string;
  translatedText: string;
  detectedLanguage?: string;
  confidence?: number;
}

// Çeviri geçmişi tipi
export interface TranslationHistory {
  id: string;
  originalText: string;
  translatedText: string;
  timestamp: Date;
  savedToWordList?: boolean;
}

// Basit UUID oluşturma fonksiyonu
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Tercüman servisi
const translatorService = {
  // Metni çevir
  translateText: async (text: string): Promise<TranslationResult> => {
    try {
      // Gerçek bir API kullanımı için:
      // const response = await axios.post('https://api.example.com/translate', {
      //   text,
      //   sourceLang: 'en',
      //   targetLang: 'tr'
      // });
      // return response.data;

      // Şimdilik basit bir simülasyon yapalım
      // Gerçek uygulamada, burada bir çeviri API'si kullanılacaktır (Google Translate, Microsoft Translator, vb.)

      // Bazı temel çeviriler
      const translations: Record<string, string> = {
        'hello': 'merhaba',
        'world': 'dünya',
        'book': 'kitap',
        'car': 'araba',
        'house': 'ev',
        'computer': 'bilgisayar',
        'phone': 'telefon',
        'table': 'masa',
        'chair': 'sandalye',
        'door': 'kapı',
        'window': 'pencere',
        'tree': 'ağaç',
        'flower': 'çiçek',
        'sun': 'güneş',
        'moon': 'ay',
        'star': 'yıldız',
        'water': 'su',
        'fire': 'ateş',
        'earth': 'dünya',
        'air': 'hava',
        'pencil': 'kalem',
        'pen': 'tükenmez kalem',
        'paper': 'kağıt',
        'notebook': 'defter',
        'school': 'okul',
        'student': 'öğrenci',
        'teacher': 'öğretmen',
        'class': 'sınıf',
        'lesson': 'ders',
        'homework': 'ev ödevi',
        'exam': 'sınav',
        'test': 'test',
        'question': 'soru',
        'answer': 'cevap',
        'language': 'dil',
        'english': 'ingilizce',
        'turkish': 'türkçe',
        'dictionary': 'sözlük',
        'translate': 'çevirmek',
        'translator': 'çevirmen',
        'word': 'kelime',
        'sentence': 'cümle',
        'paragraph': 'paragraf',
        'text': 'metin',
        'letter': 'mektup',
        'email': 'e-posta',
        'message': 'mesaj',
        'chat': 'sohbet',
        'talk': 'konuşmak',
        'speak': 'konuşmak',
        'listen': 'dinlemek',
        'read': 'okumak',
        'write': 'yazmak',
        'understand': 'anlamak',
        'learn': 'öğrenmek',
        'study': 'çalışmak',
        'practice': 'pratik yapmak',
        'remember': 'hatırlamak',
        'forget': 'unutmak',
        'know': 'bilmek',
        'think': 'düşünmek',
        'good morning': 'günaydın',
        'good evening': 'iyi akşamlar',
        'good night': 'iyi geceler',
        'how are you': 'nasılsın',
        'thank you': 'teşekkür ederim',
        'please': 'lütfen',
        'yes': 'evet',
        'no': 'hayır',
        'maybe': 'belki',
        'i love you': 'seni seviyorum',
        'what is your name': 'adın ne',
        'my name is': 'benim adım',
        'where are you from': 'nerelisin',
        'i am from': 'ben ... dan geliyorum',
        'how much is this': 'bu ne kadar',
        'i do not understand': 'anlamıyorum',
        'can you help me': 'bana yardım edebilir misin',
        'where is the bathroom': 'tuvalet nerede',
        'i am hungry': 'açım',
        'i am thirsty': 'susadım',
        'i am tired': 'yorgunum',
        'i am sick': 'hastayım',
        'i am happy': 'mutluyum',
        'i am sad': 'üzgünüm',
        'i am angry': 'kızgınım',
        'i am scared': 'korkuyorum',
        'i am cold': 'üşüyorum',
        'i am hot': 'sıcaklıyorum',
        'i am lost': 'kayboldum',
        'i need help': 'yardıma ihtiyacım var',
        'i need a doctor': 'doktora ihtiyacım var',
        'i need a taxi': 'taksiye ihtiyacım var',
        'i need a hotel': 'otele ihtiyacım var',
        'i need a restaurant': 'restorana ihtiyacım var',
        'i need a bathroom': 'tuvalete ihtiyacım var',
        'i need water': 'suya ihtiyacım var',
        'i need food': 'yemeğe ihtiyacım var',
        'i need money': 'paraya ihtiyacım var',
        'i need a phone': 'telefona ihtiyacım var',
        'i need a map': 'haritaya ihtiyacım var',
        'i need a ticket': 'bilete ihtiyacım var',
        'i need a reservation': 'rezervasyona ihtiyacım var',
        'i need a room': 'odaya ihtiyacım var',
        'i need a bed': 'yatağa ihtiyacım var',
        'i need a shower': 'duşa ihtiyacım var',
        'i need a towel': 'havluya ihtiyacım var',
        'i need a key': 'anahtara ihtiyacım var',
        'i need a charger': 'şarj aletine ihtiyacım var',
        'i need a adapter': 'adaptöre ihtiyacım var',
        'i need a wifi': 'wifi\'a ihtiyacım var',
        'i need a internet': 'internete ihtiyacım var',
        'i need a password': 'şifreye ihtiyacım var',
        'i need a translator': 'tercümana ihtiyacım var',
        'i need a guide': 'rehbere ihtiyacım var',
        'i need a map': 'haritaya ihtiyacım var',
        'i need a bus': 'otobüse ihtiyacım var',
        'i need a train': 'trene ihtiyacım var',
        'i need a plane': 'uçağa ihtiyacım var',
        'i need a boat': 'tekneye ihtiyacım var',
        'i need a car': 'arabaya ihtiyacım var',
        'i need a bike': 'bisiklete ihtiyacım var',
        'i need a motorcycle': 'motosiklete ihtiyacım var',
        'i need a helmet': 'kaska ihtiyacım var',
        'i need a jacket': 'cekete ihtiyacım var',
        'i need a umbrella': 'şemsiyeye ihtiyacım var',
        'i need a sunglasses': 'güneş gözlüğüne ihtiyacım var',
        'i need a hat': 'şapkaya ihtiyacım var',
        'i need a gloves': 'eldivene ihtiyacım var',
        'i need a scarf': 'atkıya ihtiyacım var',
        'i need a shoes': 'ayakkabıya ihtiyacım var',
        'i need a socks': 'çoraba ihtiyacım var',
        'i need a pants': 'pantolona ihtiyacım var',
        'i need a shirt': 'gömleğe ihtiyacım var',
        'i need a t-shirt': 'tişörte ihtiyacım var',
        'i need a sweater': 'kazağa ihtiyacım var',
        'i need a dress': 'elbiseye ihtiyacım var',
        'i need a skirt': 'eteğe ihtiyacım var',
        'i need a coat': 'montuma ihtiyacım var',
      };

      // Metni küçük harfe çevir ve boşlukları temizle
      const normalizedText = text.trim().toLowerCase();

      // Çeviriyi bul veya yapay zeka simülasyonu yap
      let translatedText = translations[normalizedText];

      if (!translatedText) {
        // Gerçek bir yapay zeka çeviri API'si burada kullanılacak
        // Şimdilik basit bir simülasyon yapalım

        // Kelime kelime çevirmeyi deneyelim
        const words = normalizedText.split(' ');
        const translatedWords = words.map(word => {
          // Her kelime için çeviri var mı kontrol et
          const wordTranslation = translations[word];
          if (wordTranslation) {
            return wordTranslation;
          }

          // Eğer kelime çevirisi yoksa, benzer kelimeleri kontrol et
          for (const key in translations) {
            if (key.includes(word) || word.includes(key)) {
              return translations[key];
            }
          }

          // Hiçbir eşleşme bulunamazsa, kelimeyi olduğu gibi bırak
          return word;
        });

        translatedText = translatedWords.join(' ');

        // Eğer hiçbir kelime çevrilemezse, örnek çeviriler sunalim
        if (translatedText === normalizedText) {
          // Rastgele örnek çeviriler
          const exampleTranslations = [
            { original: 'hello', translation: 'merhaba' },
            { original: 'book', translation: 'kitap' },
            { original: 'car', translation: 'araba' },
            { original: 'house', translation: 'ev' },
            { original: 'computer', translation: 'bilgisayar' },
            { original: 'phone', translation: 'telefon' },
          ];

          translatedText = `Çeviri bulunamadı. Bazı örnek çeviriler:\n\n` +
            exampleTranslations.map(item => `${item.original} = ${item.translation}`).join('\n');
        }
      }

      // Çeviri sonucunu döndür
      return {
        originalText: text,
        translatedText,
        detectedLanguage: 'en',
        confidence: 0.9
      };
    } catch (error) {
      console.error('Translation error:', error);
      throw new Error('Çeviri sırasında bir hata oluştu.');
    }
  },

  // Çeviri geçmişini kaydet
  saveToHistory: async (translation: TranslationResult): Promise<TranslationHistory> => {
    try {
      const historyItem: TranslationHistory = {
        id: generateUUID(),
        originalText: translation.originalText,
        translatedText: translation.translatedText,
        timestamp: new Date(),
        savedToWordList: false
      };

      // Gerçek uygulamada, burada AsyncStorage veya veritabanına kayıt yapılacaktır
      console.log('Translation saved to history:', historyItem);

      return historyItem;
    } catch (error) {
      console.error('Error saving translation to history:', error);
      throw error;
    }
  },

  // Çeviriyi kelime listesine ekle
  saveToWordList: async (translation: TranslationResult, listId: string): Promise<void> => {
    try {
      // Gerçek uygulamada, burada wordListService.addWord kullanılacaktır
      console.log(`Translation saved to word list ${listId}:`, translation);
    } catch (error) {
      console.error('Error saving translation to word list:', error);
      throw error;
    }
  }
};

export default translatorService;
