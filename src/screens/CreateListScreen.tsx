import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Appbar, TextInput, Button, Text, Chip, HelperText, Snackbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';
import { wordListService } from '../services/wordListService';

type CreateListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CreateList'>;

// Dil seçenekleri
const languages = [
  { code: 'en', name: 'İngilizce' },
  { code: 'de', name: 'Almanca' },
  { code: 'fr', name: 'Fransızca' },
  { code: 'es', name: 'İspanyolca' },
  { code: 'it', name: 'İtalyanca' },
  { code: 'ru', name: 'Rusça' },
  { code: 'ja', name: 'Japonca' },
  { code: 'zh', name: 'Çince' },
  { code: 'ar', name: 'Arapça' },
  { code: 'tr', name: 'Türkçe' },
];

// Liste şablonları
const templates = [
  { id: 'basic', name: 'Temel Kelimeler', description: 'Günlük konuşmada en sık kullanılan kelimeler' },
  { id: 'travel', name: 'Seyahat', description: 'Seyahat ederken ihtiyaç duyacağınız kelimeler' },
  { id: 'business', name: 'İş Dünyası', description: 'İş hayatında kullanılan terimler' },
  { id: 'academic', name: 'Akademik', description: 'Akademik çalışmalarda kullanılan kelimeler' },
];

const CreateListScreen = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  // source alanı veritabanında olmadığı için kaldırıldı
  // const [source, setSource] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const navigation = useNavigation<CreateListScreenNavigationProp>();
  const { authState } = useAuth();

  // Form doğrulama
  const validateForm = () => {
    const newErrors: { name?: string; description?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Liste adı gereklidir';
    } else if (name.length < 3) {
      newErrors.name = 'Liste adı en az 3 karakter olmalıdır';
    }

    if (!description.trim()) {
      newErrors.description = 'Liste açıklaması gereklidir';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Liste oluşturma
  const createList = async () => {
    if (!validateForm()) return;

    if (!authState.user) {
      setSnackbarMessage('Oturum açmanız gerekiyor');
      setSnackbarVisible(true);
      return;
    }

    try {
      setLoading(true);

      const newList = {
        name,
        description,
        // source alanı veritabanında olmadığı için kaldırıldı
        // source: source || undefined,
        language: selectedLanguage,
        user_id: authState.user.id,
      };

      const createdList = await wordListService.createWordList(newList);

      setSnackbarMessage('Liste başarıyla oluşturuldu');
      setSnackbarVisible(true);

      // Kullanıcıya kelime ekleme seçeneği sun
      setTimeout(() => {
        Alert.alert(
          'Liste Oluşturuldu',
          'Şimdi listeye kelime eklemek ister misiniz?',
          [
            {
              text: 'Daha Sonra',
              onPress: () => navigation.navigate('Lists'),
              style: 'cancel',
            },
            {
              text: 'Kelime Ekle',
              onPress: () => navigation.navigate('AddWord', { listId: createdList.id }),
            },
          ]
        );
      }, 500);
    } catch (error) {
      console.error('Error creating list:', error);
      setSnackbarMessage('Liste oluşturulurken bir hata oluştu');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  // Şablon seçme
  const selectTemplate = (template: { id: string; name: string; description: string }) => {
    setName(template.name);
    setDescription(template.description);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Yeni Liste Oluştur" />
      </Appbar.Header>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          <TextInput
            label="Liste Adı"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
            outlineColor="#334155"
            activeOutlineColor="#4CAF50"
            textColor="#FFFFFF"
            error={!!errors.name}
            theme={{ colors: { onSurfaceVariant: '#94A3B8' } }}
          />
          {errors.name && <HelperText type="error" visible={!!errors.name}>{errors.name}</HelperText>}

          <TextInput
            label="Açıklama"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
            outlineColor="#334155"
            activeOutlineColor="#4CAF50"
            textColor="#FFFFFF"
            error={!!errors.description}
            theme={{ colors: { onSurfaceVariant: '#94A3B8' } }}
          />
          {errors.description && <HelperText type="error" visible={!!errors.description}>{errors.description}</HelperText>}

          {/* Kaynak alanı veritabanında olmadığı için kaldırıldı
          <TextInput
            label="Kaynak (İsteğe Bağlı)"
            value={source}
            onChangeText={setSource}
            mode="outlined"
            style={styles.input}
            outlineColor="#334155"
            activeOutlineColor="#4CAF50"
            textColor="#FFFFFF"
            theme={{ colors: { onSurfaceVariant: '#94A3B8' } }}
          />
          */}

          <Text style={styles.sectionTitle}>Dil Seçin</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.languageContainer}
          >
            {languages.map((language) => (
              <Chip
                key={language.code}
                selected={selectedLanguage === language.code}
                onPress={() => setSelectedLanguage(language.code)}
                style={[
                  styles.languageChip,
                  selectedLanguage === language.code && styles.selectedLanguageChip
                ]}
                textStyle={[
                  styles.languageChipText,
                  selectedLanguage === language.code && styles.selectedLanguageChipText
                ]}
              >
                {language.name}
              </Chip>
            ))}
          </ScrollView>

          <Text style={styles.sectionTitle}>Şablonlar</Text>
          <Text style={styles.sectionDescription}>
            Başlamak için bir şablon seçebilirsiniz
          </Text>
          <View style={styles.templatesContainer}>
            {templates.map((template) => (
              <TouchableOpacity
                key={template.id}
                style={styles.templateCard}
                onPress={() => selectTemplate(template)}
              >
                <Text style={styles.templateName}>{template.name}</Text>
                <Text style={styles.templateDescription}>{template.description}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button
            mode="contained"
            onPress={createList}
            style={styles.createButton}
            loading={loading}
            disabled={loading}
          >
            Liste Oluştur
          </Button>
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
  input: {
    marginBottom: 8,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 12,
  },
  languageContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  languageChip: {
    marginRight: 8,
    backgroundColor: '#334155',
  },
  selectedLanguageChip: {
    backgroundColor: '#4CAF50',
  },
  languageChipText: {
    color: '#FFFFFF',
  },
  selectedLanguageChipText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  templatesContainer: {
    marginTop: 8,
  },
  templateCard: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  templateName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 14,
    color: '#94A3B8',
  },
  createButton: {
    marginTop: 24,
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
  },
  snackbar: {
    backgroundColor: '#1E293B',
  },
});

export default CreateListScreen;
