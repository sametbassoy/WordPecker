import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
  TextInput as RNTextInput,
} from 'react-native';
import { Appbar, Card, Title, Paragraph, Button, Searchbar, Menu, Divider, FAB, IconButton, Dialog, Portal, TextInput } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, WordList, Word } from '../types';
import { wordListService } from '../services/wordListService';

type ListDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ListDetail'>;
type ListDetailScreenRouteProp = RouteProp<RootStackParamList, 'ListDetail'>;

const ListDetailScreen = () => {
  const [wordList, setWordList] = useState<WordList | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [filteredWords, setFilteredWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'original' | 'mastery'>('original');
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [actionMenuVisible, setActionMenuVisible] = useState(false);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [editedOriginal, setEditedOriginal] = useState('');
  const [editedTranslation, setEditedTranslation] = useState('');
  const [editedContext, setEditedContext] = useState('');
  const [editedNotes, setEditedNotes] = useState('');
  const [editListDialogVisible, setEditListDialogVisible] = useState(false);
  const [editedListName, setEditedListName] = useState('');
  const [editedListDescription, setEditedListDescription] = useState('');
  
  const navigation = useNavigation<ListDetailScreenNavigationProp>();
  const route = useRoute<ListDetailScreenRouteProp>();
  const { listId, highlightWordId } = route.params;
  
  const highlightedItemRef = useRef<RNTextInput>(null);

  // Liste ve kelime verilerini yükle
  useEffect(() => {
    const loadListDetails = async () => {
      try {
        setLoading(true);
        
        // Liste bilgilerini al
        const list = await wordListService.getWordList(listId);
        setWordList(list);
        setEditedListName(list.name);
        setEditedListDescription(list.description);
        
        // Listedeki kelimeleri al
        const listWords = await wordListService.getWords(listId);
        setWords(listWords);
        applyFilters(listWords, searchQuery, sortBy);
      } catch (error) {
        console.error('Error loading list details:', error);
        Alert.alert('Hata', 'Liste bilgileri yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    loadListDetails();
  }, [listId]);

  // Filtreleme ve sıralama
  const applyFilters = (wordData: Word[], query: string, sort: 'original' | 'mastery') => {
    let filtered = [...wordData];
    
    // Arama filtresi
    if (query) {
      filtered = filtered.filter(word => 
        word.original.toLowerCase().includes(query.toLowerCase()) || 
        word.translation.toLowerCase().includes(query.toLowerCase()) ||
        (word.context && word.context.toLowerCase().includes(query.toLowerCase()))
      );
    }
    
    // Sıralama
    switch (sort) {
      case 'original':
        filtered.sort((a, b) => a.original.localeCompare(b.original));
        break;
      case 'mastery':
        filtered.sort((a, b) => b.mastery_level - a.mastery_level);
        break;
    }
    
    setFilteredWords(filtered);
  };

  // Arama sorgusu değiştiğinde
  const onChangeSearch = (query: string) => {
    setSearchQuery(query);
    applyFilters(words, query, sortBy);
  };

  // Sıralama değiştiğinde
  const changeSortBy = (sort: 'original' | 'mastery') => {
    setSortBy(sort);
    setMenuVisible(false);
    applyFilters(words, searchQuery, sort);
  };

  // Kelime silme
  const deleteWord = async (wordId: string) => {
    try {
      await wordListService.deleteWord(wordId);
      const updatedWords = words.filter(word => word.id !== wordId);
      setWords(updatedWords);
      applyFilters(updatedWords, searchQuery, sortBy);
      setActionMenuVisible(false);
    } catch (error) {
      console.error('Error deleting word:', error);
      Alert.alert('Hata', 'Kelime silinirken bir hata oluştu');
    }
  };

  // Kelime silme onayı
  const confirmDeleteWord = (word: Word) => {
    Alert.alert(
      'Kelimeyi Sil',
      `"${word.original}" kelimesini silmek istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Sil', style: 'destructive', onPress: () => deleteWord(word.id) }
      ]
    );
  };

  // Liste silme
  const deleteList = async () => {
    try {
      await wordListService.deleteWordList(listId);
      navigation.navigate('Lists');
    } catch (error) {
      console.error('Error deleting list:', error);
      Alert.alert('Hata', 'Liste silinirken bir hata oluştu');
    }
  };

  // Liste silme onayı
  const confirmDeleteList = () => {
    if (!wordList) return;
    
    Alert.alert(
      'Listeyi Sil',
      `"${wordList.name}" listesini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`,
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Sil', style: 'destructive', onPress: deleteList }
      ]
    );
  };

  // Kelime düzenleme
  const editWord = (word: Word) => {
    setSelectedWord(word);
    setEditedOriginal(word.original);
    setEditedTranslation(word.translation);
    setEditedContext(word.context || '');
    setEditedNotes(word.notes || '');
    setEditDialogVisible(true);
    setActionMenuVisible(false);
  };

  // Kelime güncelleme
  const updateWord = async () => {
    if (!selectedWord) return;
    
    try {
      const updatedWord = {
        ...selectedWord,
        original: editedOriginal,
        translation: editedTranslation,
        context: editedContext || undefined,
        notes: editedNotes || undefined,
      };
      
      await wordListService.updateWord(updatedWord);
      
      // Kelime listesini güncelle
      const updatedWords = words.map(word => 
        word.id === selectedWord.id ? updatedWord : word
      );
      
      setWords(updatedWords);
      applyFilters(updatedWords, searchQuery, sortBy);
      setEditDialogVisible(false);
    } catch (error) {
      console.error('Error updating word:', error);
      Alert.alert('Hata', 'Kelime güncellenirken bir hata oluştu');
    }
  };

  // Liste düzenleme
  const updateList = async () => {
    if (!wordList) return;
    
    try {
      const updatedList = {
        ...wordList,
        name: editedListName,
        description: editedListDescription,
      };
      
      await wordListService.updateWordList(updatedList);
      setWordList(updatedList);
      setEditListDialogVisible(false);
    } catch (error) {
      console.error('Error updating list:', error);
      Alert.alert('Hata', 'Liste güncellenirken bir hata oluştu');
    }
  };

  // Kelime kartı bileşeni
  const renderWordItem = ({ item, index }: { item: Word; index: number }) => (
    <Card 
      style={[
        styles.wordCard, 
        highlightWordId === item.id && styles.highlightedWordCard
      ]}
      ref={highlightWordId === item.id ? highlightedItemRef : null}
    >
      <Card.Content>
        <View style={styles.wordHeader}>
          <View style={styles.wordNumberContainer}>
            <Text style={styles.wordNumber}>{index + 1}</Text>
          </View>
          <View style={styles.wordContent}>
            <Title style={styles.wordOriginal}>{item.original}</Title>
            <Paragraph style={styles.wordTranslation}>{item.translation}</Paragraph>
            {item.context && (
              <Paragraph style={styles.wordContext}>"{item.context}"</Paragraph>
            )}
            {item.notes && (
              <Paragraph style={styles.wordNotes}>Not: {item.notes}</Paragraph>
            )}
          </View>
          <IconButton
            icon="dots-vertical"
            size={20}
            onPress={() => {
              setSelectedWord(item);
              setActionMenuVisible(true);
            }}
          />
        </View>
        <View style={styles.masteryContainer}>
          <Text style={styles.masteryLabel}>Hakimiyet:</Text>
          <View style={styles.masteryBar}>
            <View 
              style={[
                styles.masteryFill, 
                { 
                  width: `${item.mastery_level * 20}%`,
                  backgroundColor: 
                    item.mastery_level < 2 ? '#F44336' : 
                    item.mastery_level < 3 ? '#FF9800' : 
                    item.mastery_level < 4 ? '#FFEB3B' : 
                    item.mastery_level < 5 ? '#8BC34A' : '#4CAF50'
                }
              ]} 
            />
          </View>
          <Text style={styles.masteryValue}>{item.mastery_level}/5</Text>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!wordList) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Liste bulunamadı</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Geri Dön
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={wordList.name} subtitle={`${words.length} kelime`} />
        <Appbar.Action icon="sort" onPress={() => setMenuVisible(true)} />
        <Appbar.Action icon="pencil" onPress={() => {
          setEditListDialogVisible(true);
        }} />
        <Appbar.Action icon="delete" onPress={confirmDeleteList} />
      </Appbar.Header>

      <View style={styles.listInfoContainer}>
        <Text style={styles.listDescription}>{wordList.description}</Text>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>İlerleme: %{Math.round(wordList.progress * 100)}</Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${wordList.progress * 100}%`,
                  backgroundColor: wordList.progress < 0.3 ? '#F44336' : wordList.progress < 0.7 ? '#FF9800' : '#4CAF50'
                }
              ]} 
            />
          </View>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Kelime ara..."
          onChangeText={onChangeSearch}
          value={searchQuery}
          style={styles.searchbar}
          iconColor="#94A3B8"
          inputStyle={{ color: '#FFFFFF' }}
          placeholderTextColor="#94A3B8"
        />
      </View>

      <View style={styles.actionsContainer}>
        <Button 
          mode="contained" 
          icon="school"
          onPress={() => navigation.navigate('Learn', { listId: wordList.id })}
          style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
        >
          Öğren
        </Button>
        <Button 
          mode="contained" 
          icon="clipboard-check"
          onPress={() => navigation.navigate('Quiz', { listId: wordList.id })}
          style={[styles.actionButton, { backgroundColor: '#F44336' }]}
        >
          Test Et
        </Button>
      </View>

      {filteredWords.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchQuery ? 'Aramanızla eşleşen kelime bulunamadı.' : 'Bu listede henüz kelime yok.'}
          </Text>
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('AddWord', { listId: wordList.id })}
            style={styles.addWordButton}
          >
            Kelime Ekle
          </Button>
        </View>
      ) : (
        <FlatList
          data={filteredWords}
          renderItem={renderWordItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.wordsList}
          showsVerticalScrollIndicator={false}
        />
      )}

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('AddWord', { listId: wordList.id })}
        color="#FFFFFF"
      />

      {/* Sıralama menüsü */}
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={{ x: 0, y: 0 }}
        style={styles.sortMenu}
      >
        <Menu.Item 
          onPress={() => changeSortBy('original')} 
          title="Alfabetik Sırala" 
          leadingIcon="sort-alphabetical-ascending"
          titleStyle={{ color: sortBy === 'original' ? '#4CAF50' : '#FFFFFF' }}
        />
        <Menu.Item 
          onPress={() => changeSortBy('mastery')} 
          title="Hakimiyete Göre Sırala" 
          leadingIcon="sort-numeric-descending"
          titleStyle={{ color: sortBy === 'mastery' ? '#4CAF50' : '#FFFFFF' }}
        />
      </Menu>

      {/* Kelime işlemleri menüsü */}
      {selectedWord && (
        <Menu
          visible={actionMenuVisible}
          onDismiss={() => setActionMenuVisible(false)}
          anchor={{ x: 0, y: 0 }}
          style={styles.actionMenu}
        >
          <Menu.Item 
            onPress={() => editWord(selectedWord)} 
            title="Düzenle" 
            leadingIcon="pencil"
          />
          <Divider />
          <Menu.Item 
            onPress={() => {
              setActionMenuVisible(false);
              confirmDeleteWord(selectedWord);
            }} 
            title="Sil" 
            leadingIcon="delete"
            titleStyle={{ color: '#F44336' }}
          />
        </Menu>
      )}

      {/* Kelime düzenleme dialog */}
      <Portal>
        <Dialog
          visible={editDialogVisible}
          onDismiss={() => setEditDialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Kelimeyi Düzenle</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Kelime"
              value={editedOriginal}
              onChangeText={setEditedOriginal}
              mode="outlined"
              style={styles.dialogInput}
              outlineColor="#334155"
              activeOutlineColor="#4CAF50"
              textColor="#FFFFFF"
              theme={{ colors: { onSurfaceVariant: '#94A3B8' } }}
            />
            
            <TextInput
              label="Çeviri"
              value={editedTranslation}
              onChangeText={setEditedTranslation}
              mode="outlined"
              style={styles.dialogInput}
              outlineColor="#334155"
              activeOutlineColor="#4CAF50"
              textColor="#FFFFFF"
              theme={{ colors: { onSurfaceVariant: '#94A3B8' } }}
            />
            
            <TextInput
              label="Bağlam (İsteğe Bağlı)"
              value={editedContext}
              onChangeText={setEditedContext}
              mode="outlined"
              multiline
              numberOfLines={2}
              style={styles.dialogInput}
              outlineColor="#334155"
              activeOutlineColor="#4CAF50"
              textColor="#FFFFFF"
              theme={{ colors: { onSurfaceVariant: '#94A3B8' } }}
            />
            
            <TextInput
              label="Notlar (İsteğe Bağlı)"
              value={editedNotes}
              onChangeText={setEditedNotes}
              mode="outlined"
              multiline
              numberOfLines={2}
              style={styles.dialogInput}
              outlineColor="#334155"
              activeOutlineColor="#4CAF50"
              textColor="#FFFFFF"
              theme={{ colors: { onSurfaceVariant: '#94A3B8' } }}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditDialogVisible(false)}>İptal</Button>
            <Button onPress={updateWord}>Kaydet</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Liste düzenleme dialog */}
      <Portal>
        <Dialog
          visible={editListDialogVisible}
          onDismiss={() => setEditListDialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Listeyi Düzenle</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Liste Adı"
              value={editedListName}
              onChangeText={setEditedListName}
              mode="outlined"
              style={styles.dialogInput}
              outlineColor="#334155"
              activeOutlineColor="#4CAF50"
              textColor="#FFFFFF"
              theme={{ colors: { onSurfaceVariant: '#94A3B8' } }}
            />
            
            <TextInput
              label="Açıklama"
              value={editedListDescription}
              onChangeText={setEditedListDescription}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.dialogInput}
              outlineColor="#334155"
              activeOutlineColor="#4CAF50"
              textColor="#FFFFFF"
              theme={{ colors: { onSurfaceVariant: '#94A3B8' } }}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditListDialogVisible(false)}>İptal</Button>
            <Button onPress={updateList}>Kaydet</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
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
  listInfoContainer: {
    padding: 16,
    backgroundColor: '#1E293B',
  },
  listDescription: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginRight: 12,
    width: 100,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  searchContainer: {
    padding: 16,
    paddingTop: 8,
    backgroundColor: '#1E293B',
  },
  searchbar: {
    backgroundColor: '#334155',
    borderRadius: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 0,
    backgroundColor: '#1E293B',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  wordsList: {
    padding: 16,
    paddingBottom: 80,
  },
  wordCard: {
    marginBottom: 16,
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 12,
  },
  highlightedWordCard: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  wordHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  wordNumberContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 4,
  },
  wordNumber: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  wordContent: {
    flex: 1,
  },
  wordOriginal: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  wordTranslation: {
    color: '#94A3B8',
    fontSize: 16,
    marginBottom: 4,
  },
  wordContext: {
    color: '#64748B',
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  wordNotes: {
    color: '#64748B',
    fontSize: 14,
  },
  masteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  masteryLabel: {
    color: '#94A3B8',
    fontSize: 14,
    marginRight: 8,
    width: 70,
  },
  masteryBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 8,
  },
  masteryFill: {
    height: '100%',
    borderRadius: 3,
  },
  masteryValue: {
    color: '#94A3B8',
    fontSize: 14,
    width: 30,
    textAlign: 'right',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#F44336',
    fontSize: 16,
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  addWordButton: {
    backgroundColor: '#4CAF50',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#4CAF50',
  },
  sortMenu: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    position: 'absolute',
    right: 16,
    top: 56,
  },
  actionMenu: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
  },
  dialog: {
    backgroundColor: '#1E293B',
  },
  dialogTitle: {
    color: '#FFFFFF',
  },
  dialogInput: {
    marginBottom: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
  },
});

export default ListDetailScreen;
