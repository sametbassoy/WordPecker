import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { Appbar, List, Divider, Text, Button, Dialog, Portal, RadioButton, Snackbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

// Tema seçenekleri
const themes = [
  { value: 'dark', label: 'Koyu Tema' },
  { value: 'light', label: 'Açık Tema' },
  { value: 'system', label: 'Sistem Teması' },
];

// Bildirim seçenekleri
const notificationOptions = [
  { value: 'all', label: 'Tüm Bildirimler' },
  { value: 'important', label: 'Sadece Önemli Bildirimler' },
  { value: 'none', label: 'Bildirimler Kapalı' },
];

const SettingsScreen = () => {
  const [theme, setTheme] = useState('dark');
  const [notifications, setNotifications] = useState('all');
  const [dailyReminder, setDailyReminder] = useState(true);
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [showWordCount, setShowWordCount] = useState(true);
  const [themeDialogVisible, setThemeDialogVisible] = useState(false);
  const [notificationDialogVisible, setNotificationDialogVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { authState, logout } = useAuth();

  // Ayarları yükle
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme) setTheme(savedTheme);
        
        const savedNotifications = await AsyncStorage.getItem('notifications');
        if (savedNotifications) setNotifications(savedNotifications);
        
        const savedDailyReminder = await AsyncStorage.getItem('dailyReminder');
        if (savedDailyReminder) setDailyReminder(savedDailyReminder === 'true');
        
        const savedAutoTranslate = await AsyncStorage.getItem('autoTranslate');
        if (savedAutoTranslate) setAutoTranslate(savedAutoTranslate === 'true');
        
        const savedShowWordCount = await AsyncStorage.getItem('showWordCount');
        if (savedShowWordCount) setShowWordCount(savedShowWordCount === 'true');
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, []);

  // Ayarları kaydet
  const saveSettings = async (key: string, value: string | boolean) => {
    try {
      await AsyncStorage.setItem(key, value.toString());
      setSnackbarMessage('Ayarlar kaydedildi');
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSnackbarMessage('Ayarlar kaydedilirken bir hata oluştu');
      setSnackbarVisible(true);
    }
  };

  // Tema değiştirme
  const changeTheme = (newTheme: string) => {
    setTheme(newTheme);
    saveSettings('theme', newTheme);
    setThemeDialogVisible(false);
  };

  // Bildirim ayarlarını değiştirme
  const changeNotifications = (newNotifications: string) => {
    setNotifications(newNotifications);
    saveSettings('notifications', newNotifications);
    setNotificationDialogVisible(false);
  };

  // Günlük hatırlatıcı değiştirme
  const toggleDailyReminder = () => {
    const newValue = !dailyReminder;
    setDailyReminder(newValue);
    saveSettings('dailyReminder', newValue);
  };

  // Otomatik çeviri değiştirme
  const toggleAutoTranslate = () => {
    const newValue = !autoTranslate;
    setAutoTranslate(newValue);
    saveSettings('autoTranslate', newValue);
  };

  // Kelime sayısı gösterme değiştirme
  const toggleShowWordCount = () => {
    const newValue = !showWordCount;
    setShowWordCount(newValue);
    saveSettings('showWordCount', newValue);
  };

  // Verileri temizleme
  const clearData = () => {
    Alert.alert(
      'Verileri Temizle',
      'Tüm uygulama verileriniz silinecek. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Temizle', 
          style: 'destructive', 
          onPress: async () => {
            try {
              // Gerçek uygulamada tüm verileri temizleme işlemi yapılacak
              await AsyncStorage.clear();
              setSnackbarMessage('Tüm veriler temizlendi');
              setSnackbarVisible(true);
              
              // Kullanıcıyı çıkış yap
              setTimeout(() => {
                logout();
              }, 1000);
            } catch (error) {
              console.error('Error clearing data:', error);
              setSnackbarMessage('Veriler temizlenirken bir hata oluştu');
              setSnackbarVisible(true);
            }
          } 
        },
      ]
    );
  };

  // Hesabı silme
  const deleteAccount = () => {
    Alert.alert(
      'Hesabı Sil',
      'Hesabınız ve tüm verileriniz kalıcı olarak silinecek. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Hesabı Sil', 
          style: 'destructive', 
          onPress: async () => {
            try {
              // Gerçek uygulamada hesap silme işlemi yapılacak
              setSnackbarMessage('Hesabınız silindi');
              setSnackbarVisible(true);
              
              // Kullanıcıyı çıkış yap
              setTimeout(() => {
                logout();
              }, 1000);
            } catch (error) {
              console.error('Error deleting account:', error);
              setSnackbarMessage('Hesap silinirken bir hata oluştu');
              setSnackbarVisible(true);
            }
          } 
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Ayarlar" />
      </Appbar.Header>

      <ScrollView style={styles.scrollView}>
        <List.Section>
          <List.Subheader style={styles.sectionHeader}>Görünüm</List.Subheader>
          
          <TouchableOpacity onPress={() => setThemeDialogVisible(true)}>
            <List.Item
              title="Tema"
              description={themes.find(t => t.value === theme)?.label || 'Koyu Tema'}
              left={props => <List.Icon {...props} icon="theme-light-dark" color="#4CAF50" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDescription}
              style={styles.listItem}
            />
          </TouchableOpacity>
          
          <Divider style={styles.divider} />
          
          <List.Subheader style={styles.sectionHeader}>Bildirimler</List.Subheader>
          
          <TouchableOpacity onPress={() => setNotificationDialogVisible(true)}>
            <List.Item
              title="Bildirim Tercihleri"
              description={notificationOptions.find(n => n.value === notifications)?.label || 'Tüm Bildirimler'}
              left={props => <List.Icon {...props} icon="bell" color="#4CAF50" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDescription}
              style={styles.listItem}
            />
          </TouchableOpacity>
          
          <List.Item
            title="Günlük Hatırlatıcı"
            description="Her gün çalışmanız için hatırlatma alın"
            left={props => <List.Icon {...props} icon="calendar-clock" color="#4CAF50" />}
            right={() => (
              <Switch
                value={dailyReminder}
                onValueChange={toggleDailyReminder}
                color="#4CAF50"
              />
            )}
            titleStyle={styles.listTitle}
            descriptionStyle={styles.listDescription}
            style={styles.listItem}
          />
          
          <Divider style={styles.divider} />
          
          <List.Subheader style={styles.sectionHeader}>Uygulama Ayarları</List.Subheader>
          
          <List.Item
            title="Otomatik Çeviri"
            description="Kelime eklerken otomatik çeviri önerisi"
            left={props => <List.Icon {...props} icon="translate" color="#4CAF50" />}
            right={() => (
              <Switch
                value={autoTranslate}
                onValueChange={toggleAutoTranslate}
                color="#4CAF50"
              />
            )}
            titleStyle={styles.listTitle}
            descriptionStyle={styles.listDescription}
            style={styles.listItem}
          />
          
          <List.Item
            title="Kelime Sayısı Göster"
            description="Liste önizlemelerinde kelime sayısını göster"
            left={props => <List.Icon {...props} icon="counter" color="#4CAF50" />}
            right={() => (
              <Switch
                value={showWordCount}
                onValueChange={toggleShowWordCount}
                color="#4CAF50"
              />
            )}
            titleStyle={styles.listTitle}
            descriptionStyle={styles.listDescription}
            style={styles.listItem}
          />
          
          <Divider style={styles.divider} />
          
          <List.Subheader style={styles.sectionHeader}>Veri Yönetimi</List.Subheader>
          
          <List.Item
            title="Verileri Dışa Aktar"
            description="Tüm kelime listelerinizi dışa aktarın"
            left={props => <List.Icon {...props} icon="export" color="#4CAF50" />}
            onPress={() => {
              setSnackbarMessage('Veriler dışa aktarıldı');
              setSnackbarVisible(true);
            }}
            titleStyle={styles.listTitle}
            descriptionStyle={styles.listDescription}
            style={styles.listItem}
          />
          
          <List.Item
            title="Verileri İçe Aktar"
            description="Dışa aktarılmış kelime listelerinizi içe aktarın"
            left={props => <List.Icon {...props} icon="import" color="#4CAF50" />}
            onPress={() => {
              setSnackbarMessage('Veriler içe aktarıldı');
              setSnackbarVisible(true);
            }}
            titleStyle={styles.listTitle}
            descriptionStyle={styles.listDescription}
            style={styles.listItem}
          />
          
          <List.Item
            title="Verileri Temizle"
            description="Tüm uygulama verilerinizi temizleyin"
            left={props => <List.Icon {...props} icon="delete" color="#F44336" />}
            onPress={clearData}
            titleStyle={styles.listTitle}
            descriptionStyle={styles.listDescription}
            style={styles.listItem}
          />
          
          <Divider style={styles.divider} />
          
          <List.Subheader style={styles.sectionHeader}>Hesap</List.Subheader>
          
          <List.Item
            title="Hesap Bilgileri"
            description={authState.user?.email || 'Giriş yapılmadı'}
            left={props => <List.Icon {...props} icon="account" color="#4CAF50" />}
            titleStyle={styles.listTitle}
            descriptionStyle={styles.listDescription}
            style={styles.listItem}
          />
          
          <List.Item
            title="Şifre Değiştir"
            description="Hesap şifrenizi değiştirin"
            left={props => <List.Icon {...props} icon="lock-reset" color="#4CAF50" />}
            onPress={() => {
              setSnackbarMessage('Şifre değiştirme e-postası gönderildi');
              setSnackbarVisible(true);
            }}
            titleStyle={styles.listTitle}
            descriptionStyle={styles.listDescription}
            style={styles.listItem}
          />
          
          <List.Item
            title="Çıkış Yap"
            description="Hesabınızdan çıkış yapın"
            left={props => <List.Icon {...props} icon="logout" color="#F44336" />}
            onPress={logout}
            titleStyle={styles.listTitle}
            descriptionStyle={styles.listDescription}
            style={styles.listItem}
          />
          
          <List.Item
            title="Hesabı Sil"
            description="Hesabınızı ve tüm verilerinizi kalıcı olarak silin"
            left={props => <List.Icon {...props} icon="account-remove" color="#F44336" />}
            onPress={deleteAccount}
            titleStyle={styles.listTitle}
            descriptionStyle={styles.listDescription}
            style={styles.listItem}
          />
        </List.Section>
        
        <View style={styles.aboutSection}>
          <Text style={styles.appVersion}>WordPecker v1.0.0</Text>
          <Text style={styles.copyright}>© 2025 WordPecker. Tüm hakları saklıdır.</Text>
        </View>
      </ScrollView>

      {/* Tema Seçim Dialog */}
      <Portal>
        <Dialog
          visible={themeDialogVisible}
          onDismiss={() => setThemeDialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Tema Seçin</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={changeTheme} value={theme}>
              {themes.map((item) => (
                <RadioButton.Item
                  key={item.value}
                  label={item.label}
                  value={item.value}
                  color="#4CAF50"
                  labelStyle={styles.radioLabel}
                  style={styles.radioItem}
                />
              ))}
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setThemeDialogVisible(false)}>İptal</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Bildirim Seçim Dialog */}
      <Portal>
        <Dialog
          visible={notificationDialogVisible}
          onDismiss={() => setNotificationDialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Bildirim Tercihleri</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={changeNotifications} value={notifications}>
              {notificationOptions.map((item) => (
                <RadioButton.Item
                  key={item.value}
                  label={item.label}
                  value={item.value}
                  color="#4CAF50"
                  labelStyle={styles.radioLabel}
                  style={styles.radioItem}
                />
              ))}
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setNotificationDialogVisible(false)}>İptal</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
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
  scrollView: {
    flex: 1,
  },
  sectionHeader: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: 'bold',
  },
  listItem: {
    paddingVertical: 8,
  },
  listTitle: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  listDescription: {
    color: '#94A3B8',
    fontSize: 14,
  },
  divider: {
    backgroundColor: '#334155',
    height: 1,
  },
  aboutSection: {
    padding: 24,
    alignItems: 'center',
  },
  appVersion: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 4,
  },
  copyright: {
    color: '#64748B',
    fontSize: 12,
  },
  dialog: {
    backgroundColor: '#1E293B',
  },
  dialogTitle: {
    color: '#FFFFFF',
  },
  radioItem: {
    paddingVertical: 8,
  },
  radioLabel: {
    color: '#FFFFFF',
  },
  snackbar: {
    backgroundColor: '#1E293B',
  },
});

export default SettingsScreen;
