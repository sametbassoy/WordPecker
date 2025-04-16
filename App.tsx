import React, { useEffect } from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import WordListsScreen from './src/screens/WordListsScreen';
import CreateListScreen from './src/screens/CreateListScreen';
import AddWordScreen from './src/screens/AddWordScreen';
import ListDetailScreen from './src/screens/ListDetailScreen';
import SearchScreen from './src/screens/SearchScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import FeaturePlaceholder from './src/screens/placeholders/FeaturePlaceholder';
import LearnScreen from './src/screens/LearnScreen';
import TranslatorScreen from './src/screens/TranslatorScreen';
import { AuthProvider } from './src/context/AuthContext';
import theme from './src/styles/theme';
import { RootStackParamList } from './src/types';
import setupDatabase from './src/services/setupDatabase';

const Stack = createStackNavigator<RootStackParamList>();

function App(): JSX.Element {
  // Veritabanı kurulumunu başlat
  useEffect(() => {
    setupDatabase();
  }, []);
  return (
    <AuthProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer
          theme={{
            dark: true,
            colors: {
              primary: '#4CAF50',
              background: '#0F172A',
              card: '#1E293B',
              text: '#FFFFFF',
              border: '#334155',
              notification: '#FF9800',
            },
            fonts: {
              regular: {
                fontFamily: 'System',
                fontWeight: 'normal',
              },
              medium: {
                fontFamily: 'System',
                fontWeight: '500',
              },
              bold: {
                fontFamily: 'System',
                fontWeight: '700',
              },
              heavy: {
                fontFamily: 'System',
                fontWeight: '800',
              },
            },
          }}
        >
          <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
            <Stack.Navigator
              initialRouteName="Login"
              screenOptions={{
                headerStyle: {
                  backgroundColor: '#1E293B',
                },
                headerTintColor: '#FFFFFF',
                headerTitleStyle: {
                  color: '#FFFFFF',
                },
                cardStyle: { backgroundColor: '#0F172A' }
              }}
            >
              <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{
                  title: 'WordPecker',
                  headerShown: false
                }}
              />
              <Stack.Screen
                name="Register"
                component={RegisterScreen}
                options={{
                  title: 'Hesap Oluştur',
                  headerShown: false
                }}
              />
              <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{
                  title: 'WordPecker',
                  headerShown: false
                }}
              />
              <Stack.Screen
                name="Lists"
                component={WordListsScreen}
                options={{
                  title: 'Kelime Listeleri'
                }}
              />
              <Stack.Screen
                name="CreateList"
                component={CreateListScreen}
                options={{
                  title: 'Liste Oluştur'
                }}
              />
              <Stack.Screen
                name="AddWord"
                component={AddWordScreen}
                options={{
                  title: 'Kelime Ekle'
                }}
              />
              <Stack.Screen
                name="ListDetail"
                component={ListDetailScreen}
                options={{
                  title: 'Liste Detayı'
                }}
              />
              <Stack.Screen
                name="Search"
                component={SearchScreen}
                options={{
                  title: 'Arama'
                }}
              />
              <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                  title: 'Ayarlar'
                }}
              />
              <Stack.Screen
                name="Learn"
                component={LearnScreen}
                options={{
                  title: 'Öğrenme Modu',
                  headerShown: false
                }}
              />
              <Stack.Screen
                name="Quiz"
                component={FeaturePlaceholder}
                options={{
                  title: 'Test Modu'
                }}
              />
              <Stack.Screen
                name="Translator"
                component={TranslatorScreen}
                options={{
                  title: 'Yapay Zeka Tercüman',
                  headerShown: false
                }}
              />
              <Stack.Screen
                name="FeaturePlaceholder"
                component={FeaturePlaceholder}
                options={({ route }) => ({ title: route.params.featureName })}
              />
            </Stack.Navigator>
          </SafeAreaView>
        </NavigationContainer>
      </PaperProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
});

export default App;
