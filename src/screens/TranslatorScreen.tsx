import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  FlatList
} from 'react-native';
import {
  Appbar,
  Card,
  Button,
  TextInput,
  Divider,
  IconButton,
  Chip,
  List,
  Dialog,
  Portal,
  Paragraph,
  Snackbar
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import translatorService, { TranslationResult, TranslationHistory } from '../services/translatorService';
import wordListService from '../services/wordListService';
import { useAuth } from '../context/AuthContext';
import { WordList } from '../types';

const TranslatorScreen = () => {
  const navigation = useNavigation();
  const { authState } = useAuth();

  // State
  const [inputText, setInputText] = useState('');
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);
  const [translationHistory, setTranslationHistory] = useState<TranslationHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [wordLists, setWordLists] = useState<WordList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [saveDialogVisible, setSaveDialogVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Kelime listelerini yükle
  useEffect(() => {
    const loadWordLists = async () => {
      try {
        if (authState.user) {
          const lists = await wordListService.getWordLists(authState.user.id);
          setWordLists(lists);
          
          // Varsayılan liste seç (eğer liste varsa)
          if (lists.length > 0) {
            setSelectedListId(lists[0].id);
          }
        }
      } catch (error) {
        console.error('Error loading word lists:', error);
      }
    };
    
    loadWordLists();
  }, [authState.user]);

  // Çeviri yap
  const translateText = async () => {
    if (!inputText.trim()) {
      setSnackbarMessage('Lütfen çevrilecek bir metin girin');
      setSnackbarVisible(true);
      return;
    }
    
    try {
      setLoading(true);
      
      // Çeviri yap
      const result = await translatorService.translateText(inputText);
      setTranslationResult(result);
      
      // Geçmişe ekle
      const historyItem = await translatorService.saveToHistory(result);
      setTranslationHistory([historyItem, ...translationHistory]);
      
      setLoading(false);
    } catch (error) {
      console.error('Translation error:', error);
      setLoading(false);
      setSnackbarMessage('Çeviri sırasında bir hata oluştu');
      setSnackbarVisible(true);
    }
  };

  // Kelime listesine kaydet
  const saveToWordList = async () => {
    if (!translationResult || !selectedListId) {
      setSnackbarMessage('Kaydedilecek çeviri veya seçili liste yok');
      setSnackbarVisible(true);
      return;
    }
    
    try {
      // Kelime ekle
      await wordListService.addWord({
        list_id: selectedListId,
        original: translationResult.originalText,
        translation: translationResult.translatedText,
        context: '',
        notes: '',
        mastery_level: 0
      });
      
      // Geçmişi güncelle
      const updatedHistory = translationHistory.map(item => {
        if (item.originalText === translationResult.originalText) {
          return { ...item, savedToWordList: true };
        }
        return item;
      });
      
      setTranslationHistory(updatedHistory);
      setSaveDialogVisible(false);
      
      setSnackbarMessage('Çeviri kelime listesine kaydedildi');
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Error saving to word list:', error);
      setSaveDialogVisible(false);
      setSnackbarMessage('Kelime listesine kaydedilirken bir hata oluştu');
      setSnackbarVisible(true);
    }
  };

  // Geçmiş öğesini seç
  const selectHistoryItem = (item: TranslationHistory) => {
    setInputText(item.originalText);
    setTranslationResult({
      originalText: item.originalText,
      translatedText: item.translatedText
    });
  };

  // Geçmiş öğesini temizle
  const clearHistory = () => {
    Alert.alert(
      'Geçmişi Temizle',
      'Tüm çeviri geçmişini temizlemek istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel'
        },
        {
          text: 'Temizle',
          onPress: () => {
            setTranslationHistory([]);
            setSnackbarMessage('Çeviri geçmişi temizlendi');
            setSnackbarVisible(true);
          },
          style: 'destructive'
        }
      ]
    );
  };

  // Render
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Yapay Zeka Tercüman" />
        {translationHistory.length > 0 && (
          <Appbar.Action icon="history-off" onPress={clearHistory} />
        )}
      </Appbar.Header>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Giriş alanı */}
        <Card style={styles.inputCard}>
          <Card.Content>
            <TextInput
              label="İngilizce metin girin"
              value={inputText}
              onChangeText={setInputText}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={styles.textInput}
              outlineColor="#334155"
              activeOutlineColor="#4CAF50"
              textColor="#FFFFFF"
              theme={{ colors: { onSurfaceVariant: '#94A3B8' } }}
              right={
                inputText ? (
                  <TextInput.Icon
                    icon="close"
                    color="#94A3B8"
                    onPress={() => setInputText('')}
                  />
                ) : undefined
              }
            />
            
            <Button
              mode="contained"
              onPress={translateText}
              style={styles.translateButton}
              loading={loading}
              disabled={loading || !inputText.trim()}
            >
              Çevir
            </Button>
          </Card.Content>
        </Card>
        
        {/* Çeviri sonucu */}
        {translationResult && (
          <Card style={styles.resultCard}>
            <Card.Content>
              <Text style={styles.resultLabel}>Çeviri Sonucu:</Text>
              <Text style={styles.resultText}>{translationResult.translatedText}</Text>
              
              <View style={styles.resultActions}>
                <IconButton
                  icon="content-copy"
                  size={20}
                  onPress={() => {
                    // Kopyalama işlevi (gerçek uygulamada Clipboard API kullanılacak)
                    setSnackbarMessage('Çeviri panoya kopyalandı');
                    setSnackbarVisible(true);
                  }}
                  style={styles.actionButton}
                />
                
                <IconButton
                  icon="bookmark-outline"
                  size={20}
                  onPress={() => setSaveDialogVisible(true)}
                  style={styles.actionButton}
                />
                
                <IconButton
                  icon="share-variant"
                  size={20}
                  onPress={() => {
                    // Paylaşma işlevi (gerçek uygulamada Share API kullanılacak)
                    setSnackbarMessage('Paylaşım özelliği henüz uygulanmadı');
                    setSnackbarVisible(true);
                  }}
                  style={styles.actionButton}
                />
              </View>
            </Card.Content>
          </Card>
        )}
        
        {/* Çeviri geçmişi */}
        {translationHistory.length > 0 && (
          <Card style={styles.historyCard}>
            <Card.Content>
              <Text style={styles.historyTitle}>Çeviri Geçmişi</Text>
              
              {translationHistory.map((item, index) => (
                <React.Fragment key={item.id || index}>
                  <TouchableOpacity
                    style={styles.historyItem}
                    onPress={() => selectHistoryItem(item)}
                  >
                    <View style={styles.historyItemContent}>
                      <Text style={styles.historyItemOriginal}>{item.originalText}</Text>
                      <Text style={styles.historyItemTranslation}>{item.translatedText}</Text>
                      <Text style={styles.historyItemTime}>
                        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                    
                    {item.savedToWordList && (
                      <MaterialCommunityIcons
                        name="bookmark"
                        size={16}
                        color="#4CAF50"
                        style={styles.historyItemIcon}
                      />
                    )}
                  </TouchableOpacity>
                  
                  {index < translationHistory.length - 1 && (
                    <Divider style={styles.historyDivider} />
                  )}
                </React.Fragment>
              ))}
            </Card.Content>
          </Card>
        )}
      </ScrollView>
      
      {/* Kelime listesine kaydetme dialog */}
      <Portal>
        <Dialog
          visible={saveDialogVisible}
          onDismiss={() => setSaveDialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Kelime Listesine Kaydet</Dialog.Title>
          <Dialog.Content>
            <Paragraph style={styles.dialogText}>
              Bu çeviriyi hangi kelime listesine kaydetmek istiyorsunuz?
            </Paragraph>
            
            {wordLists.length > 0 ? (
              <View style={styles.listSelector}>
                {wordLists.map(list => (
                  <Chip
                    key={list.id}
                    selected={selectedListId === list.id}
                    onPress={() => setSelectedListId(list.id)}
                    style={[
                      styles.listChip,
                      selectedListId === list.id && styles.selectedListChip
                    ]}
                    textStyle={[
                      styles.listChipText,
                      selectedListId === list.id && styles.selectedListChipText
                    ]}
                  >
                    {list.name}
                  </Chip>
                ))}
              </View>
            ) : (
              <Paragraph style={styles.noListsText}>
                Henüz kelime listeniz yok. Önce bir liste oluşturun.
              </Paragraph>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setSaveDialogVisible(false)}>İptal</Button>
            <Button
              onPress={saveToWordList}
              disabled={!selectedListId || wordLists.length === 0}
            >
              Kaydet
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      {/* Snackbar */}
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
    paddingBottom: 32,
  },
  inputCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    marginBottom: 16,
    borderColor: '#334155',
    borderWidth: 1,
  },
  textInput: {
    backgroundColor: '#1E293B',
    marginBottom: 16,
  },
  translateButton: {
    backgroundColor: '#4CAF50',
  },
  resultCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    marginBottom: 16,
    borderColor: '#334155',
    borderWidth: 1,
  },
  resultLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 16,
    lineHeight: 26,
  },
  resultActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    margin: 0,
  },
  historyCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    marginBottom: 16,
    borderColor: '#334155',
    borderWidth: 1,
  },
  historyTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  historyItemContent: {
    flex: 1,
  },
  historyItemOriginal: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 4,
  },
  historyItemTranslation: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  historyItemTime: {
    fontSize: 12,
    color: '#64748B',
  },
  historyItemIcon: {
    marginLeft: 8,
  },
  historyDivider: {
    backgroundColor: '#334155',
  },
  dialog: {
    backgroundColor: '#1E293B',
  },
  dialogTitle: {
    color: '#FFFFFF',
  },
  dialogText: {
    color: '#E2E8F0',
  },
  listSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  listChip: {
    margin: 4,
    backgroundColor: '#334155',
  },
  selectedListChip: {
    backgroundColor: '#4CAF50',
  },
  listChipText: {
    color: '#FFFFFF',
  },
  selectedListChipText: {
    color: '#FFFFFF',
  },
  noListsText: {
    color: '#94A3B8',
    fontStyle: 'italic',
    marginTop: 16,
  },
  snackbar: {
    backgroundColor: '#1E293B',
  },
});

export default TranslatorScreen;
