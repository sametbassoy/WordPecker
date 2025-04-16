import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Appbar, TextInput, Button, Text, Chip, HelperText, Snackbar, ActivityIndicator, IconButton, Divider } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, WordList, Word } from '../types';
import { wordListService } from '../services/wordListService';

type AddWordScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddWord'>;
type AddWordScreenRouteProp = RouteProp<RootStackParamList, 'AddWord'>;

const AddWordScreen = () => {
  const [wordList, setWordList] = useState<WordList | null>(null);
  const [loading, setLoading] = useState(true);
  const [words, setWords] = useState<Word[]>([]);
  const [original, setOriginal] = useState('');
  const [translation, setTranslation] = useState('');
  const [context, setContext] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ original?: string; translation?: string }>({});
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkSeparator, setBulkSeparator] = useState(':');
  const [bulkWords, setBulkWords] = useState<{ original: string; translation: string }[]>([]);
  const [addingWords, setAddingWords] = useState(false);

  const navigation = useNavigation<AddWordScreenNavigationProp>();
  const route = useRoute<AddWordScreenRouteProp>();
  const { listId } = route.params;

  // Liste bilgilerini yükle
  useEffect(() => {
    const loadListDetails = async () => {
      try {
        setLoading(true);
        const list = await wordListService.getWordList(listId);
        setWordList(list);
        
        // Listedeki mevcut kelimeleri yükle
        const listWords = await wordListService.getWords(listId);
        setWords(listWords);
      } catch (error) {
        console.error('Error loading list details:', error);
        setSnackbarMessage('Liste bilgileri yüklenirken bir hata oluştu');
        setSnackbarVisible(true);
      } finally {
        setLoading(false);
      }
    };

    loadListDetails();
  }, [listId]);

  // Form doğrulama
  const validateForm = () => {
    const newErrors: { original?: string; translation?: string } = {};
    
    if (!original.trim()) {
      newErrors.original = 'Kelime gereklidir';
    }
    
    if (!translation.trim()) {
      newErrors.translation = 'Çeviri gereklidir';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Kelime ekleme
  const addWord = async () => {
    if (!validateForm()) return;
    
    try {
      const newWord = {
        list_id: listId,
        original: original.trim(),
        translation: translation.trim(),
        context: context.trim() || undefined,
        notes: notes.trim() || undefined,
        mastery_level: 0,
      };
      
      const addedWord = await wordListService.addWord(newWord);
      
      // Kelimeyi listeye ekle
      setWords([...words, addedWord]);
      
      // Formu temizle
      setOriginal('');
      setTranslation('');
      setContext('');
      setNotes('');
      
      setSnackbarMessage('Kelime başarıyla eklendi');
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Error adding word:', error);
      setSnackbarMessage('Kelime eklenirken bir hata oluştu');
      setSnackbarVisible(true);
    }
  };

  // Otomatik çeviri (simülasyon)
  const translateWord = async () => {
    if (!original.trim()) {
      setErrors({ original: 'Çevrilecek kelime girin' });
      return;
    }
    
    setIsTranslating(true);
    
    // Gerçek bir API kullanılacak, şimdilik simüle ediyoruz
    setTimeout(() => {
      // Basit bir çeviri simülasyonu
      const translations: Record<string, string> = {
        'hello': 'merhaba',
        'world': 'dünya',
        'book': 'kitap',
        'car': 'araba',
        'house': 'ev',
        'dog': 'köpek',
        'cat': 'kedi',
        'tree': 'ağaç',
        'water': 'su',
        'food': 'yemek',
      };
      
      const translatedWord = translations[original.toLowerCase()] || '';
      
      if (translatedWord) {
        setTranslation(translatedWord);
        setSnackbarMessage('Çeviri tamamlandı');
      } else {
        setSnackbarMessage('Çeviri bulunamadı');
      }
      
      setSnackbarVisible(true);
      setIsTranslating(false);
    }, 1000);
  };

  // Toplu kelime işleme
  const processBulkWords = () => {
    if (!bulkText.trim()) {
      setSnackbarMessage('Toplu kelime metni boş olamaz');
      setSnackbarVisible(true);
      return;
    }
    
    const lines = bulkText.split('\n').filter(line => line.trim());
    const processedWords: { original: string; translation: string }[] = [];
    
    for (const line of lines) {
      const parts = line.split(bulkSeparator);
      
      if (parts.length >= 2) {
        processedWords.push({
          original: parts[0].trim(),
          translation: parts[1].trim(),
        });
      }
    }
    
    if (processedWords.length === 0) {
      setSnackbarMessage('İşlenebilir kelime bulunamadı. Format: "kelime:çeviri"');
      setSnackbarVisible(true);
      return;
    }
    
    setBulkWords(processedWords);
    setSnackbarMessage(`${processedWords.length} kelime işlendi`);
    setSnackbarVisible(true);
  };

  // Toplu kelimeleri kaydetme
  const saveBulkWords = async () => {
    if (bulkWords.length === 0) {
      setSnackbarMessage('Eklenecek kelime yok');
      setSnackbarVisible(true);
      return;
    }
    
    try {
      setAddingWords(true);
      
      const newWords = bulkWords.map(word => ({
        list_id: listId,
        original: word.original,
        translation: word.translation,
        mastery_level: 0,
      }));
      
      await wordListService.addMultipleWords(newWords);
      
      // Listedeki kelimeleri güncelle
      const updatedWords = await wordListService.getWords(listId);
      setWords(updatedWords);
      
      // Formu temizle
      setBulkText('');
      setBulkWords([]);
      
      setSnackbarMessage(`${newWords.length} kelime başarıyla eklendi`);
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Error adding bulk words:', error);
      setSnackbarMessage('Kelimeler eklenirken bir hata oluştu');
      setSnackbarVisible(true);
    } finally {
      setAddingWords(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Kelime Ekle" subtitle={wordList?.name} />
        <Appbar.Action 
          icon={bulkMode ? "format-list-text" : "format-list-bulleted-square"} 
          onPress={() => setBulkMode(!bulkMode)} 
        />
      </Appbar.Header>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          {!bulkMode ? (
            // Tekli kelime ekleme formu
            <>
              <View style={styles.wordInputContainer}>
                <TextInput
                  label="Kelime"
                  value={original}
                  onChangeText={setOriginal}
                  mode="outlined"
                  style={styles.wordInput}
                  outlineColor="#334155"
                  activeOutlineColor="#4CAF50"
                  textColor="#FFFFFF"
                  error={!!errors.original}
                  theme={{ colors: { onSurfaceVariant: '#94A3B8' } }}
                />
                <IconButton
                  icon="translate"
                  size={24}
                  iconColor="#4CAF50"
                  style={styles.translateButton}
                  onPress={translateWord}
                  disabled={isTranslating}
                />
              </View>
              {errors.original && <HelperText type="error" visible={!!errors.original}>{errors.original}</HelperText>}

              <TextInput
                label="Çeviri"
                value={translation}
                onChangeText={setTranslation}
                mode="outlined"
                style={styles.input}
                outlineColor="#334155"
                activeOutlineColor="#4CAF50"
                textColor="#FFFFFF"
                error={!!errors.translation}
                theme={{ colors: { onSurfaceVariant: '#94A3B8' } }}
              />
              {errors.translation && <HelperText type="error" visible={!!errors.translation}>{errors.translation}</HelperText>}

              <TextInput
                label="Bağlam (İsteğe Bağlı)"
                value={context}
                onChangeText={setContext}
                mode="outlined"
                multiline
                numberOfLines={2}
                style={styles.input}
                outlineColor="#334155"
                activeOutlineColor="#4CAF50"
                textColor="#FFFFFF"
                theme={{ colors: { onSurfaceVariant: '#94A3B8' } }}
              />

              <TextInput
                label="Notlar (İsteğe Bağlı)"
                value={notes}
                onChangeText={setNotes}
                mode="outlined"
                multiline
                numberOfLines={2}
                style={styles.input}
                outlineColor="#334155"
                activeOutlineColor="#4CAF50"
                textColor="#FFFFFF"
                theme={{ colors: { onSurfaceVariant: '#94A3B8' } }}
              />

              <Button
                mode="contained"
                onPress={addWord}
                style={styles.addButton}
                loading={isTranslating}
                disabled={isTranslating}
              >
                Kelime Ekle
              </Button>
            </>
          ) : (
            // Toplu kelime ekleme formu
            <>
              <Text style={styles.bulkTitle}>Toplu Kelime Ekleme</Text>
              <Text style={styles.bulkDescription}>
                Her satıra bir kelime ve çevirisi girin. Ayırıcı olarak "{bulkSeparator}" kullanın.
              </Text>
              
              <View style={styles.separatorContainer}>
                <Text style={styles.separatorLabel}>Ayırıcı:</Text>
                <Chip
                  selected={bulkSeparator === ':'}
                  onPress={() => setBulkSeparator(':')}
                  style={styles.separatorChip}
                >
                  :
                </Chip>
                <Chip
                  selected={bulkSeparator === '-'}
                  onPress={() => setBulkSeparator('-')}
                  style={styles.separatorChip}
                >
                  -
                </Chip>
                <Chip
                  selected={bulkSeparator === '='}
                  onPress={() => setBulkSeparator('=')}
                  style={styles.separatorChip}
                >
                  =
                </Chip>
                <Chip
                  selected={bulkSeparator === ','}
                  onPress={() => setBulkSeparator(',')}
                  style={styles.separatorChip}
                >
                  ,
                </Chip>
              </View>
              
              <TextInput
                label="Kelimeler"
                value={bulkText}
                onChangeText={setBulkText}
                mode="outlined"
                multiline
                numberOfLines={8}
                style={styles.bulkInput}
                outlineColor="#334155"
                activeOutlineColor="#4CAF50"
                textColor="#FFFFFF"
                theme={{ colors: { onSurfaceVariant: '#94A3B8' } }}
                placeholder={`örnek${bulkSeparator}example\nkitap${bulkSeparator}book\nev${bulkSeparator}house`}
                placeholderTextColor="#64748B"
              />
              
              <Button
                mode="contained"
                onPress={processBulkWords}
                style={styles.processButton}
              >
                Kelimeleri İşle
              </Button>
              
              {bulkWords.length > 0 && (
                <>
                  <Text style={styles.previewTitle}>Önizleme ({bulkWords.length} kelime)</Text>
                  <View style={styles.previewContainer}>
                    {bulkWords.slice(0, 5).map((word, index) => (
                      <View key={index} style={styles.previewItem}>
                        <Text style={styles.previewOriginal}>{word.original}</Text>
                        <Text style={styles.previewArrow}>→</Text>
                        <Text style={styles.previewTranslation}>{word.translation}</Text>
                      </View>
                    ))}
                    {bulkWords.length > 5 && (
                      <Text style={styles.moreWords}>ve {bulkWords.length - 5} kelime daha...</Text>
                    )}
                  </View>
                  
                  <Button
                    mode="contained"
                    onPress={saveBulkWords}
                    style={styles.saveButton}
                    loading={addingWords}
                    disabled={addingWords}
                  >
                    {bulkWords.length} Kelimeyi Kaydet
                  </Button>
                </>
              )}
            </>
          )}

          <Divider style={styles.divider} />

          <Text style={styles.listTitle}>Listedeki Kelimeler ({words.length})</Text>
          {words.length === 0 ? (
            <Text style={styles.emptyText}>Bu listede henüz kelime yok.</Text>
          ) : (
            <View style={styles.wordsList}>
              {words.slice(0, 5).map((word, index) => (
                <View key={word.id} style={styles.wordItem}>
                  <Text style={styles.wordNumber}>{index + 1}</Text>
                  <Text style={styles.wordOriginal}>{word.original}</Text>
                  <Text style={styles.wordArrow}>→</Text>
                  <Text style={styles.wordTranslation}>{word.translation}</Text>
                </View>
              ))}
              {words.length > 5 && (
                <TouchableOpacity 
                  style={styles.viewAllButton}
                  onPress={() => navigation.navigate('ListDetail', { listId })}
                >
                  <Text style={styles.viewAllText}>Tüm kelimeleri görüntüle</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  appbar: {
    backgroundColor: '#1E293B',
    elevation: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  formContainer: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  wordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wordInput: {
    flex: 1,
    marginBottom: 8,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
  },
  translateButton: {
    marginLeft: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  input: {
    marginBottom: 8,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
  },
  addButton: {
    marginTop: 16,
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  snackbar: {
    backgroundColor: '#1E293B',
  },
  bulkTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  bulkDescription: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 16,
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  separatorLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    marginRight: 8,
  },
  separatorChip: {
    marginRight: 8,
    backgroundColor: '#334155',
  },
  bulkInput: {
    marginBottom: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    minHeight: 150,
  },
  processButton: {
    backgroundColor: '#2196F3',
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  previewContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  previewOriginal: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
  },
  previewArrow: {
    color: '#4CAF50',
    marginHorizontal: 8,
    fontSize: 14,
  },
  previewTranslation: {
    flex: 1,
    color: '#94A3B8',
    fontSize: 14,
  },
  moreWords: {
    color: '#64748B',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    marginBottom: 16,
  },
  divider: {
    backgroundColor: '#334155',
    marginVertical: 24,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  wordsList: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 12,
  },
  wordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  wordNumber: {
    width: 24,
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
  },
  wordOriginal: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
  },
  wordArrow: {
    color: '#4CAF50',
    marginHorizontal: 8,
    fontSize: 14,
  },
  wordTranslation: {
    flex: 1,
    color: '#94A3B8',
    fontSize: 14,
  },
  viewAllButton: {
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 8,
  },
  viewAllText: {
    color: '#4CAF50',
    fontSize: 14,
  },
});

export default AddWordScreen;
