import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Appbar, Searchbar, Chip, Card, Title, Paragraph, Divider, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, WordList, Word } from '../types';
import { useAuth } from '../context/AuthContext';
import { wordListService } from '../services/wordListService';

type SearchScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Search'>;

// Arama sonucu tipi
type SearchResult = {
  type: 'list' | 'word';
  item: WordList | Word;
  listName?: string; // Kelime sonuçları için liste adı
};

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'lists' | 'words'>('all');

  const navigation = useNavigation<SearchScreenNavigationProp>();
  const { authState } = useAuth();

  // Son aramaları yükle
  useEffect(() => {
    const loadRecentSearches = async () => {
      try {
        // Gerçek uygulamada AsyncStorage'dan yüklenecek
        setRecentSearches(['ingilizce', 'fiil', 'seyahat', 'akademik']);
      } catch (error) {
        console.error('Error loading recent searches:', error);
      }
    };

    loadRecentSearches();
  }, []);

  // Arama işlemi
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      
      if (!authState.user) {
        Alert.alert('Hata', 'Arama yapmak için giriş yapmalısınız');
        return;
      }

      // Son aramalara ekle
      if (!recentSearches.includes(query) && query.trim()) {
        const updatedSearches = [query, ...recentSearches.slice(0, 4)];
        setRecentSearches(updatedSearches);
        // Gerçek uygulamada AsyncStorage'a kaydedilecek
      }

      // Listelerde arama
      let searchResults: SearchResult[] = [];
      
      if (filter === 'all' || filter === 'lists') {
        const lists = await wordListService.searchWordLists(authState.user.id, query);
        searchResults = [
          ...searchResults,
          ...lists.map(list => ({ type: 'list', item: list })),
        ];
      }
      
      // Kelimelerde arama
      if (filter === 'all' || filter === 'words') {
        const words = await wordListService.searchWords(authState.user.id, query);
        
        // Kelimeler için liste adlarını al
        const listIds = [...new Set(words.map(word => word.list_id))];
        const listsMap: Record<string, string> = {};
        
        for (const listId of listIds) {
          try {
            const list = await wordListService.getWordList(listId);
            listsMap[listId] = list.name;
          } catch (error) {
            console.error(`Error fetching list ${listId}:`, error);
          }
        }
        
        searchResults = [
          ...searchResults,
          ...words.map(word => ({ 
            type: 'word', 
            item: word,
            listName: listsMap[word.list_id] || 'Bilinmeyen Liste'
          })),
        ];
      }
      
      setResults(searchResults);
    } catch (error) {
      console.error('Error performing search:', error);
      Alert.alert('Hata', 'Arama yapılırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Arama sorgusunu değiştirme
  const onChangeSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      performSearch(query);
    } else if (query.length === 0) {
      setResults([]);
    }
  };

  // Son aramaya tıklama
  const onRecentSearchPress = (query: string) => {
    setSearchQuery(query);
    performSearch(query);
  };

  // Sonuç öğesine tıklama
  const onResultPress = (result: SearchResult) => {
    if (result.type === 'list') {
      const list = result.item as WordList;
      navigation.navigate('ListDetail', { listId: list.id });
    } else {
      const word = result.item as Word;
      navigation.navigate('ListDetail', { listId: word.list_id, highlightWordId: word.id });
    }
  };

  // Sonuç öğesi render
  const renderResultItem = ({ item }: { item: SearchResult }) => {
    if (item.type === 'list') {
      const list = item.item as WordList;
      return (
        <Card style={styles.resultCard} onPress={() => onResultPress(item)}>
          <Card.Content>
            <View style={styles.resultHeader}>
              <Chip style={styles.typeChip} textStyle={styles.typeChipText}>Liste</Chip>
              <Title style={styles.resultTitle}>{list.name}</Title>
            </View>
            <Paragraph style={styles.resultDescription}>{list.description}</Paragraph>
            <View style={styles.resultInfo}>
              <Text style={styles.infoText}>{list.word_count} kelime</Text>
              <Text style={styles.infoText}>%{Math.round(list.progress * 100)} tamamlandı</Text>
            </View>
          </Card.Content>
        </Card>
      );
    } else {
      const word = item.item as Word;
      return (
        <Card style={styles.resultCard} onPress={() => onResultPress(item)}>
          <Card.Content>
            <View style={styles.resultHeader}>
              <Chip style={styles.typeChip} textStyle={styles.typeChipText}>Kelime</Chip>
              <Text style={styles.listName}>Liste: {item.listName}</Text>
            </View>
            <View style={styles.wordContainer}>
              <Title style={styles.wordOriginal}>{word.original}</Title>
              <IconButton icon="arrow-right" size={20} iconColor="#4CAF50" style={styles.wordArrow} />
              <Title style={styles.wordTranslation}>{word.translation}</Title>
            </View>
            {word.context && (
              <Paragraph style={styles.wordContext}>"{word.context}"</Paragraph>
            )}
          </Card.Content>
        </Card>
      );
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Arama" />
      </Appbar.Header>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Kelime veya liste ara..."
          onChangeText={onChangeSearch}
          value={searchQuery}
          style={styles.searchbar}
          iconColor="#94A3B8"
          inputStyle={{ color: '#FFFFFF' }}
          placeholderTextColor="#94A3B8"
          onSubmitEditing={() => performSearch(searchQuery)}
        />
      </View>

      <View style={styles.filterContainer}>
        <Chip
          selected={filter === 'all'}
          onPress={() => setFilter('all')}
          style={[styles.filterChip, filter === 'all' && styles.selectedFilterChip]}
          textStyle={[styles.filterChipText, filter === 'all' && styles.selectedFilterChipText]}
        >
          Tümü
        </Chip>
        <Chip
          selected={filter === 'lists'}
          onPress={() => setFilter('lists')}
          style={[styles.filterChip, filter === 'lists' && styles.selectedFilterChip]}
          textStyle={[styles.filterChipText, filter === 'lists' && styles.selectedFilterChipText]}
        >
          Listeler
        </Chip>
        <Chip
          selected={filter === 'words'}
          onPress={() => setFilter('words')}
          style={[styles.filterChip, filter === 'words' && styles.selectedFilterChip]}
          textStyle={[styles.filterChipText, filter === 'words' && styles.selectedFilterChipText]}
        >
          Kelimeler
        </Chip>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          renderItem={renderResultItem}
          keyExtractor={(item, index) => 
            item.type === 'list' 
              ? `list-${(item.item as WordList).id}` 
              : `word-${(item.item as Word).id}`
          }
          contentContainerStyle={styles.resultsList}
        />
      ) : searchQuery.length > 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aramanızla eşleşen sonuç bulunamadı.</Text>
        </View>
      ) : (
        <View style={styles.recentContainer}>
          <Text style={styles.recentTitle}>Son Aramalar</Text>
          <View style={styles.recentSearches}>
            {recentSearches.map((search, index) => (
              <Chip
                key={index}
                onPress={() => onRecentSearchPress(search)}
                style={styles.recentChip}
                textStyle={styles.recentChipText}
              >
                {search}
              </Chip>
            ))}
          </View>

          <Divider style={styles.divider} />

          <Text style={styles.recentTitle}>Önerilen Aramalar</Text>
          <View style={styles.recentSearches}>
            <Chip
              onPress={() => onRecentSearchPress('ingilizce')}
              style={styles.recentChip}
              textStyle={styles.recentChipText}
            >
              ingilizce
            </Chip>
            <Chip
              onPress={() => onRecentSearchPress('seyahat')}
              style={styles.recentChip}
              textStyle={styles.recentChipText}
            >
              seyahat
            </Chip>
            <Chip
              onPress={() => onRecentSearchPress('günlük')}
              style={styles.recentChip}
              textStyle={styles.recentChipText}
            >
              günlük
            </Chip>
            <Chip
              onPress={() => onRecentSearchPress('fiil')}
              style={styles.recentChip}
              textStyle={styles.recentChipText}
            >
              fiil
            </Chip>
            <Chip
              onPress={() => onRecentSearchPress('akademik')}
              style={styles.recentChip}
              textStyle={styles.recentChipText}
            >
              akademik
            </Chip>
          </View>
        </View>
      )}
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
  searchContainer: {
    padding: 16,
    backgroundColor: '#1E293B',
  },
  searchbar: {
    backgroundColor: '#334155',
    borderRadius: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 0,
    backgroundColor: '#1E293B',
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: '#334155',
  },
  selectedFilterChip: {
    backgroundColor: '#4CAF50',
  },
  filterChipText: {
    color: '#FFFFFF',
  },
  selectedFilterChipText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsList: {
    padding: 16,
  },
  resultCard: {
    marginBottom: 16,
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 12,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeChip: {
    backgroundColor: '#334155',
    marginRight: 8,
  },
  typeChipText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  resultTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
    flex: 1,
  },
  resultDescription: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 8,
  },
  resultInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  listName: {
    color: '#94A3B8',
    fontSize: 14,
    flex: 1,
  },
  wordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  wordOriginal: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
    flex: 1,
  },
  wordArrow: {
    margin: 0,
    padding: 0,
  },
  wordTranslation: {
    fontSize: 18,
    color: '#94A3B8',
    flex: 1,
  },
  wordContext: {
    color: '#64748B',
    fontSize: 14,
    fontStyle: 'italic',
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
  },
  recentContainer: {
    padding: 16,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  recentSearches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  recentChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#334155',
  },
  recentChipText: {
    color: '#FFFFFF',
  },
  divider: {
    backgroundColor: '#334155',
    marginVertical: 24,
  },
});

export default SearchScreen;
