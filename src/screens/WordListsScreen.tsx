import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { Appbar, Card, Title, Paragraph, Button, Searchbar, Menu, Divider, FAB, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, WordList } from '../types';
import { useAuth } from '../context/AuthContext';
import { wordListService } from '../services/wordListService';

type WordListsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Lists'>;

const WordListsScreen = () => {
  const [lists, setLists] = useState<WordList[]>([]);
  const [filteredLists, setFilteredLists] = useState<WordList[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'progress'>('date');
  const [selectedList, setSelectedList] = useState<WordList | null>(null);
  const [actionMenuVisible, setActionMenuVisible] = useState(false);

  const navigation = useNavigation<WordListsScreenNavigationProp>();
  const { authState } = useAuth();

  // Listeleri yükle
  const loadLists = async () => {
    try {
      setLoading(true);
      if (authState.user) {
        const userLists = await wordListService.getWordLists(authState.user.id);
        setLists(userLists);
        applyFilters(userLists, searchQuery, sortBy);
      }
    } catch (error) {
      console.error('Error loading word lists:', error);
      Alert.alert('Hata', 'Kelime listeleri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // İlk yükleme
  useEffect(() => {
    loadLists();
  }, [authState.user]);

  // Yenileme işlemi
  const onRefresh = () => {
    setRefreshing(true);
    loadLists();
  };

  // Filtreleme ve sıralama
  const applyFilters = (listData: WordList[], query: string, sort: 'name' | 'date' | 'progress') => {
    let filtered = [...listData];
    
    // Arama filtresi
    if (query) {
      filtered = filtered.filter(list => 
        list.name.toLowerCase().includes(query.toLowerCase()) || 
        list.description.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // Sıralama
    switch (sort) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'date':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'progress':
        filtered.sort((a, b) => b.progress - a.progress);
        break;
    }
    
    setFilteredLists(filtered);
  };

  // Arama sorgusu değiştiğinde
  const onChangeSearch = (query: string) => {
    setSearchQuery(query);
    applyFilters(lists, query, sortBy);
  };

  // Sıralama değiştiğinde
  const changeSortBy = (sort: 'name' | 'date' | 'progress') => {
    setSortBy(sort);
    setMenuVisible(false);
    applyFilters(lists, searchQuery, sort);
  };

  // Liste silme
  const deleteList = async (listId: string) => {
    try {
      await wordListService.deleteWordList(listId);
      setLists(lists.filter(list => list.id !== listId));
      setFilteredLists(filteredLists.filter(list => list.id !== listId));
      setActionMenuVisible(false);
    } catch (error) {
      console.error('Error deleting list:', error);
      Alert.alert('Hata', 'Liste silinirken bir hata oluştu.');
    }
  };

  // Liste silme onayı
  const confirmDelete = (list: WordList) => {
    Alert.alert(
      'Listeyi Sil',
      `"${list.name}" listesini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`,
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Sil', style: 'destructive', onPress: () => deleteList(list.id) }
      ]
    );
  };

  // Liste kartı bileşeni
  const renderListItem = ({ item }: { item: WordList }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Title style={styles.cardTitle}>{item.name}</Title>
          <IconButton
            icon="dots-vertical"
            size={20}
            onPress={() => {
              setSelectedList(item);
              setActionMenuVisible(true);
            }}
          />
        </View>
        <Paragraph style={styles.cardDescription}>{item.description}</Paragraph>
        <View style={styles.cardInfo}>
          <Text style={styles.infoText}>{item.word_count} kelime</Text>
          <Text style={styles.infoText}>%{Math.round(item.progress * 100)}</Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${item.progress * 100}%`,
                backgroundColor: item.progress < 0.3 ? '#F44336' : item.progress < 0.7 ? '#FF9800' : '#4CAF50'
              }
            ]} 
          />
        </View>
      </Card.Content>
      <Card.Actions style={styles.cardActions}>
        <Button 
          mode="text" 
          onPress={() => navigation.navigate('Learn', { listId: item.id })}
          labelStyle={{ color: '#4CAF50' }}
        >
          Öğren
        </Button>
        <Button 
          mode="text" 
          onPress={() => navigation.navigate('Quiz', { listId: item.id })}
          labelStyle={{ color: '#F44336' }}
        >
          Test Et
        </Button>
        <Button 
          mode="text" 
          onPress={() => navigation.navigate('ListDetail', { listId: item.id })}
          labelStyle={{ color: '#2196F3' }}
        >
          Detaylar
        </Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Kelime Listeleri" />
        <Appbar.Action icon="sort" onPress={() => setMenuVisible(true)} />
      </Appbar.Header>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Liste ara..."
          onChangeText={onChangeSearch}
          value={searchQuery}
          style={styles.searchbar}
          iconColor="#94A3B8"
          inputStyle={{ color: '#FFFFFF' }}
          placeholderTextColor="#94A3B8"
        />
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : filteredLists.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchQuery ? 'Aramanızla eşleşen liste bulunamadı.' : 'Henüz kelime listeniz yok.'}
          </Text>
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('CreateList')}
            style={styles.createButton}
          >
            Yeni Liste Oluştur
          </Button>
        </View>
      ) : (
        <FlatList
          data={filteredLists}
          renderItem={renderListItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4CAF50']}
              tintColor="#4CAF50"
            />
          }
        />
      )}

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('CreateList')}
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
          onPress={() => changeSortBy('name')} 
          title="İsme Göre Sırala" 
          leadingIcon="sort-alphabetical-ascending"
          titleStyle={{ color: sortBy === 'name' ? '#4CAF50' : '#FFFFFF' }}
        />
        <Menu.Item 
          onPress={() => changeSortBy('date')} 
          title="Tarihe Göre Sırala" 
          leadingIcon="sort-calendar-descending"
          titleStyle={{ color: sortBy === 'date' ? '#4CAF50' : '#FFFFFF' }}
        />
        <Menu.Item 
          onPress={() => changeSortBy('progress')} 
          title="İlerlemeye Göre Sırala" 
          leadingIcon="sort-numeric-descending"
          titleStyle={{ color: sortBy === 'progress' ? '#4CAF50' : '#FFFFFF' }}
        />
      </Menu>

      {/* Liste işlemleri menüsü */}
      {selectedList && (
        <Menu
          visible={actionMenuVisible}
          onDismiss={() => setActionMenuVisible(false)}
          anchor={{ x: 0, y: 0 }}
          style={styles.actionMenu}
        >
          <Menu.Item 
            onPress={() => {
              setActionMenuVisible(false);
              navigation.navigate('ListDetail', { listId: selectedList.id });
            }} 
            title="Detayları Görüntüle" 
            leadingIcon="information-outline"
          />
          <Menu.Item 
            onPress={() => {
              setActionMenuVisible(false);
              navigation.navigate('AddWord', { listId: selectedList.id });
            }} 
            title="Kelime Ekle" 
            leadingIcon="plus-circle-outline"
          />
          <Divider />
          <Menu.Item 
            onPress={() => {
              setActionMenuVisible(false);
              confirmDelete(selectedList);
            }} 
            title="Listeyi Sil" 
            leadingIcon="delete-outline"
            titleStyle={{ color: '#F44336' }}
          />
        </Menu>
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
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    marginBottom: 16,
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
    flex: 1,
  },
  cardDescription: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 12,
  },
  cardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  cardActions: {
    justifyContent: 'space-between',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  createButton: {
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
});

export default WordListsScreen;
