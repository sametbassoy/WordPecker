import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, Platform, Dimensions, TouchableOpacity, Image } from 'react-native';
import { Button, Card, Title, Paragraph, Avatar, IconButton, Badge, Divider, FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

// Özellik tanımlamaları
const features = [
  {
    id: 1,
    name: 'Kullanıcı Girişi',
    description: 'E-posta/şifre ve sosyal medya ile güvenli ve kullanıcı dostu giriş/kayıt sistemi.',
    expectedFunctionality: [
      'E-posta/şifre ile kullanıcı kaydı',
      'E-posta/şifre ile giriş',
      'Şifre kurtarma',
      'Kullanıcı profili görüntüleme ve yönetimi',
      'Oturum yönetimi',
      'Güvenli token saklama'
    ]
  },
  {
    id: 2,
    name: 'Kelime Listeleri',
    description: 'Kullanıcının oluşturduğu tüm kelime listelerini detayları ve yönetim seçenekleriyle görüntüleme.',
    expectedFunctionality: [
      'Tüm listeleri önizleme bilgileriyle gösterme',
      'Liste sıralama ve filtreleme seçenekleri',
      'Hızlı eylemler (öğrenme, test, detaylar)',
      'İlerleme göstergeleri',
      'Yenileme ve sayfalama'
    ]
  },
  {
    id: 3,
    name: 'Liste Oluştur',
    description: 'İsim, açıklama ve bağlam bilgileriyle yeni kelime listesi oluşturma.',
    expectedFunctionality: [
      'Doğrulama ile liste oluşturma formu',
      'İsteğe bağlı kaynak belirtme alanı',
      'Liste için dil seçimi',
      'Oluşturma sonrası kelime ekleme seçeneği',
      'Yaygın liste türleri için şablonlar'
    ]
  },
  {
    id: 4,
    name: 'Kelime Ekle',
    description: 'Mevcut listeye anlamları ve bağlam örnekleriyle yeni kelimeler ekleme.',
    expectedFunctionality: [
      'Otomatik tamamlama önerileriyle kelime ekleme formu',
      'API ile otomatik anlam getirme',
      'Toplu kelime ekleme özelliği',
      'Bağlam örneği alanı',
      'Resim/telaffuz ilişkilendirme (opsiyonel)'
    ]
  },
  {
    id: 5,
    name: 'Öğrenme Modu',
    description: 'Duolingo tarzı alıştırmalarla liste kelimelerini öğrenme deneyimi.',
    expectedFunctionality: [
      'Çoktan seçmeli alıştırmalar',
      'Oturum sırasında ilerleme takibi',
      'Motivasyon için seri sayacı',
      'Cevaplara geri bildirim',
      'Oturum devamı ve geçmişi',
      'Çeşitli alıştırma türleri'
    ]
  },
  {
    id: 6,
    name: 'Test Modu',
    description: 'Liste kelimelerini daha zorlu bir test formatıyla sınama.',
    expectedFunctionality: [
      'Öğrenme modundan daha zorlu sorular',
      'Puan takibi ve geçmişi',
      'Süre sınırı seçeneği',
      'Yanlış cevapları gözden geçirme',
      'Test sonuç özeti',
      'Sonuçları paylaşma özelliği'
    ]
  },
  {
    id: 7,
    name: 'Liste Detayları',
    description: 'Tüm kelimeleri ve yönetim seçenekleriyle kelime listesinin detaylı görünümü.',
    expectedFunctionality: [
      'Listedeki tüm kelimeleri anlamlarıyla gösterme',
      'Kelime düzenleme ve silme',
      'Liste bilgilerini düzenleme',
      'İlerleme istatistikleri',
      'Öğrenme/Test modu başlatma seçenekleri',
      'Kelime sıralama ve filtreleme'
    ]
  },
  {
    id: 8,
    name: 'İlerleme Takibi',
    description: 'Tüm listeler ve kelimeler için istatistikler ve görselleştirmelerle öğrenme ilerlemesini takip etme.',
    expectedFunctionality: [
      'Genel öğrenme istatistikleri',
      'Liste bazında ilerleme görünümü',
      'Kelime hakimiyet göstergeleri',
      'İlerleme geçmişi grafikleri',
      'Öğrenme serileri ve başarılar',
      'Önerilen tekrar kelimeleri'
    ]
  },
  {
    id: 9,
    name: 'Arama',
    description: 'Listeler ve kelimeler arasında filtreleme seçenekleriyle arama işlevi.',
    expectedFunctionality: [
      'Tüm içerikte genel arama',
      'Liste, tarih, ilerleme seviyesine göre filtreleme',
      'Son aramalar geçmişi',
      'Sesli arama özelliği',
      'Önerilen arama terimleri',
      'Arama sonuçlarından doğrudan eylemler'
    ]
  },
  {
    id: 10,
    name: 'Ayarlar',
    description: 'Öğrenme deneyimini özelleştirmek için uygulama ayarları ve tercihler.',
    expectedFunctionality: [
      'Tema ve görünüm ayarları',
      'Bildirim tercihleri',
      'Varsayılan liste seçenekleri',
      'Öğrenme oturumu yapılandırmaları',
      'Veri yönetimi (dışa/içe aktarma/temizleme)',
      'Hesap ayarları entegrasyonu'
    ]
  },
  {
    id: 11,
    name: 'Yapay Zeka Tercüman',
    description: 'Yapay zeka destekli İngilizce-Türkçe tercüman ile hızlı çeviriler yapın ve kelime listenize ekleyin.',
    expectedFunctionality: [
      'Metinlerin hızlı çevirisi',
      'Çeviri geçmişi',
      'Kelime listelerine kaydetme',
      'Kopyalama ve paylaşma',
      'Kullanıcı dostu arayüz'
    ]
  },
  {
    id: 12,
    name: 'Yenilikçi Özellik 2',
    description: 'Mobil dil öğrenenler için benzersiz bir avantaj sunan ikinci yenilikçi özelliğinizi tasarlayın.',
    expectedFunctionality: [
      'Öğrenme etkinliğini artıran özgün fikir',
      'Mobil öncelikli tasarım yaklaşımı',
      'Uygulama iş akışıyla entegrasyon',
      'Erişilebilir ve sezgisel arayüz',
      'Kaynak verimli uygulama'
    ]
  }
];

// Ana özellikler
const mainFeatures = [
  {
    id: 1,
    name: 'Kelime Listeleri',
    description: 'Tüm kelime listelerinizi görüntüleyin ve yönetin',
    icon: 'format-list-bulleted',
    color: '#4CAF50',
    route: 'Lists'
  },
  {
    id: 2,
    name: 'Liste Oluştur',
    description: 'Yeni kelime listesi oluşturun',
    icon: 'playlist-plus',
    color: '#2196F3',
    route: 'CreateList'
  },
  {
    id: 3,
    name: 'Kelime Ekle',
    description: 'Mevcut listelere yeni kelimeler ekleyin',
    icon: 'plus-circle',
    color: '#9C27B0',
    route: 'Lists'
  },
  {
    id: 4,
    name: 'Öğrenme Modu',
    description: 'Kelimelerinizi interaktif şekilde öğrenin',
    icon: 'school',
    color: '#FF9800',
    route: 'Lists'
  },
  {
    id: 5,
    name: 'Test Modu',
    description: 'Bilginizi test edin ve ilerleyişinizi takip edin',
    icon: 'clipboard-check',
    color: '#F44336',
    route: 'Lists'
  },
  {
    id: 6,
    name: 'Arama',
    description: 'Kelime ve listelerde arama yapın',
    icon: 'magnify',
    color: '#00BCD4',
    route: 'Search'
  },
  {
    id: 7,
    name: 'Yapay Zeka Tercüman',
    description: 'İngilizce metinleri Türkçeye çevirin',
    icon: 'translate',
    color: '#FF9800',
    route: 'Translator'
  },
];

// Kullanıcı istatistikleri
const userStats = {
  totalWords: 248,
  learnedWords: 156,
  streakDays: 7,
  todayLearned: 12,
  totalLists: 8,
};

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { authState, logout } = useAuth();

  useEffect(() => {
    // Kullanıcı giriş yapmamışsa, Login ekranına yönlendir
    if (!authState.isAuthenticated) {
      navigation.navigate('Login');
    }
  }, [authState.isAuthenticated, navigation]);

  const navigateToFeature = (route: string, params?: any) => {
    navigation.navigate(route as any, params);
  };

  // Kullanıcı giriş yapmamışsa, boş bir ekran göster (Login ekranına yönlendirilecek)
  if (!authState.isAuthenticated) {
    return <View style={styles.container} />;
  }

  // Ana ekran içeriği
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollViewContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Üst bilgi alanı */}
      <LinearGradient
        colors={['#1E293B', '#0F172A']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>Merhaba, {authState.user?.name || 'Kullanıcı'}</Text>
            <Text style={styles.dateText}>{new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.logoutButton}>
            <Avatar.Icon size={40} icon="cog" color="#FFF" style={{ backgroundColor: 'transparent' }} />
          </TouchableOpacity>
        </View>

        {/* İstatistik kartları */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userStats.totalWords}</Text>
            <Text style={styles.statLabel}>Toplam Kelime</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userStats.learnedWords}</Text>
            <Text style={styles.statLabel}>Öğrenilen</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userStats.streakDays}</Text>
            <Text style={styles.statLabel}>Gün Serisi</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userStats.todayLearned}</Text>
            <Text style={styles.statLabel}>Bugün</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Ana özellikler grid */}
      <View style={styles.featuresContainer}>
        <Text style={styles.sectionTitle}>Özellikler</Text>
        <View style={styles.featuresGrid}>
          {mainFeatures.map((feature) => (
            <TouchableOpacity
              key={feature.id}
              style={[styles.featureCard, { backgroundColor: feature.color + '20' }]}
              onPress={() => navigateToFeature(feature.route)}
            >
              <IconButton
                icon={feature.icon}
                size={32}
                iconColor={feature.color}
                style={styles.featureIcon}
              />
              <Text style={styles.featureName}>{feature.name}</Text>
              <Text style={styles.featureDescription} numberOfLines={2}>{feature.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Son çalışılan listeler */}
      <View style={styles.recentContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Son Çalışılan Listeler</Text>
          <Button
            mode="text"
            onPress={() => navigateToFeature('Lists')}
            labelStyle={styles.viewAllButton}
          >
            Tümünü Gör
          </Button>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recentListsScroll}
        >
          {/* Örnek liste kartları */}
          <Card style={styles.recentListCard}>
            <Card.Content>
              <Title style={styles.recentListTitle}>İngilizce Temel Kelimeler</Title>
              <Paragraph style={styles.recentListInfo}>120 kelime • %75 tamamlandı</Paragraph>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '75%', backgroundColor: '#4CAF50' }]} />
              </View>
            </Card.Content>
            <Card.Actions style={styles.recentListActions}>
              <Button mode="text" onPress={() => navigateToFeature('Learn', { listId: '1' })} labelStyle={{ color: '#4CAF50' }}>Öğren</Button>
              <Button mode="text" onPress={() => navigateToFeature('Quiz', { listId: '1' })} labelStyle={{ color: '#F44336' }}>Test Et</Button>
            </Card.Actions>
          </Card>

          <Card style={styles.recentListCard}>
            <Card.Content>
              <Title style={styles.recentListTitle}>Almanca Günlük Konuşma</Title>
              <Paragraph style={styles.recentListInfo}>85 kelime • %40 tamamlandı</Paragraph>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '40%', backgroundColor: '#FF9800' }]} />
              </View>
            </Card.Content>
            <Card.Actions style={styles.recentListActions}>
              <Button mode="text" onPress={() => navigateToFeature('Learn', { listId: '2' })} labelStyle={{ color: '#4CAF50' }}>Öğren</Button>
              <Button mode="text" onPress={() => navigateToFeature('Quiz', { listId: '2' })} labelStyle={{ color: '#F44336' }}>Test Et</Button>
            </Card.Actions>
          </Card>

          <Card style={styles.recentListCard}>
            <Card.Content>
              <Title style={styles.recentListTitle}>İspanyolca Seyahat</Title>
              <Paragraph style={styles.recentListInfo}>65 kelime • %25 tamamlandı</Paragraph>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '25%', backgroundColor: '#F44336' }]} />
              </View>
            </Card.Content>
            <Card.Actions style={styles.recentListActions}>
              <Button mode="text" onPress={() => navigateToFeature('Learn', { listId: '3' })} labelStyle={{ color: '#4CAF50' }}>Öğren</Button>
              <Button mode="text" onPress={() => navigateToFeature('Quiz', { listId: '3' })} labelStyle={{ color: '#F44336' }}>Test Et</Button>
            </Card.Actions>
          </Card>
        </ScrollView>
      </View>

      {/* Yeni liste oluşturma butonu */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigateToFeature('CreateList')}
        color="#FFFFFF"
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: Platform.select({
    web: {
      height: Dimensions.get('window').height,
      overflow: 'scroll',
      padding: 0,
      backgroundColor: '#0F172A',
    },
    default: {
      flex: 1,
      padding: 0,
      backgroundColor: '#0F172A',
    },
  }),
  scrollViewContent: {
    ...(Platform.OS === 'web' ? {
      minHeight: '100%',
    } : {
      flexGrow: 1,
    }),
  },
  // Header styles
  header: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  logoutButton: {
    padding: 5,
  },
  // Stats styles
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 15,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
  },
  // Features grid styles
  featuresContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  featureIcon: {
    marginBottom: 8,
  },
  featureName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
  // Recent lists styles
  recentContainer: {
    padding: 20,
    paddingTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllButton: {
    color: '#4CAF50',
    fontSize: 14,
  },
  recentListsScroll: {
    paddingRight: 20,
    paddingBottom: 10,
  },
  recentListCard: {
    width: 280,
    marginRight: 16,
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 12,
  },
  recentListTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  recentListInfo: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 8,
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
  recentListActions: {
    justifyContent: 'space-between',
  },
  // FAB style
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#4CAF50',
  },
  // Legacy styles
  instructions: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 24,
    color: '#94A3B8',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
    ...(Platform.OS === 'web' ? {
      maxWidth: 1200,
      marginHorizontal: 'auto',
    } : {}),
  },
  card: {
    width: Platform.OS === 'web' ? '31%' : '48%',
    marginBottom: 16,
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
    ...(Platform.OS === 'web' ? {
      minWidth: 280,
    } : {}),
  },
  cardTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  cardDescription: {
    color: '#94A3B8',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#4CAF50',
  }
});

export default HomeScreen;
