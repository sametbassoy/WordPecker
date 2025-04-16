console.log('Email:', email);
console.log('Password:', password);
console.log('Is Password Visible:', isPasswordVisible);
console.log('Snackbar Visible:', snackbarVisible);
console.log('Snackbar Message:', snackbarMessage);
console.log('Is Reset Password Mode:', isResetPasswordMode);
console.log('Auth State:', authState);import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { TextInput, Button, Snackbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';
import { supabaseAuth } from '../services/supabaseService';
import { LinearGradient } from 'expo-linear-gradient';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isResetPasswordMode, setIsResetPasswordMode] = useState(false);

  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { signIn, register, authState } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      setSnackbarMessage('Lütfen email ve şifrenizi girin');
      setSnackbarVisible(true);
      return;
    }

    try {
      await signIn(email, password);
      navigation.navigate('Home');
    } catch (error) {
      setSnackbarMessage('Giriş başarısız: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
      setSnackbarVisible(true);
    }
  };

  const handleRegister = async () => {
    navigation.navigate('Register');
  };

  const handleResetPassword = async () => {
    if (!email) {
      setSnackbarMessage('Lütfen şifresini sıfırlamak istediğiniz e-posta adresini girin');
      setSnackbarVisible(true);
      return;
    }

    try {
      await supabaseAuth.resetPassword(email);
      setSnackbarMessage('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi');
      setSnackbarVisible(true);
    } catch (error) {
      setSnackbarMessage('Şifre sıfırlama başarısız: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
      setSnackbarVisible(true);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient
        colors={['#1E293B', '#0F172A']}
        style={styles.background}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.appName}>WordPecker</Text>
            <Text style={styles.tagline}>Kelime öğrenmenin en etkili yolu</Text>
          </View>

          <View style={styles.formContainer}>
            <TextInput
              label="E-posta"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              outlineColor="#334155"
              activeOutlineColor="#4CAF50"
              textColor="#FFFFFF"
              theme={{ colors: { onSurfaceVariant: '#94A3B8' } }}
              left={<TextInput.Icon icon="email" color="#94A3B8" />}
            />

            <TextInput
              label="Şifre"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry={!isPasswordVisible}
              style={styles.input}
              outlineColor="#334155"
              activeOutlineColor="#4CAF50"
              textColor="#FFFFFF"
              theme={{ colors: { onSurfaceVariant: '#94A3B8' } }}
              left={<TextInput.Icon icon="lock" color="#94A3B8" />}
              right={
                <TextInput.Icon
                  icon={isPasswordVisible ? 'eye-off' : 'eye'}
                  color="#94A3B8"
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                />
              }
            />

            <Button
              mode="contained"
              onPress={handleLogin}
              style={styles.loginButton}
              labelStyle={styles.loginButtonText}
              loading={authState.loading}
              disabled={authState.loading}
            >
              Giriş Yap
            </Button>

            <TouchableOpacity style={styles.forgotPassword} onPress={handleResetPassword}>
              <Text style={styles.forgotPasswordText}>Şifremi Unuttum</Text>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>veya</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
              <Text style={styles.registerButtonText}>Hesap Oluştur</Text>
            </TouchableOpacity>
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
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
  },
  loginButton: {
    marginTop: 8,
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    borderRadius: 8,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPassword: {
    alignSelf: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#4CAF50',
    fontSize: 14,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#334155',
  },
  dividerText: {
    color: '#94A3B8',
    paddingHorizontal: 16,
    fontSize: 14,
  },
  registerButton: {
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
  },
  snackbar: {
    backgroundColor: '#1E293B',
  },
});

export default LoginScreen;
