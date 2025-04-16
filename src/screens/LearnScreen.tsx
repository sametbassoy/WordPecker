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
} from 'react-native';
import { Appbar, Card, Button, ProgressBar, IconButton, Title, Paragraph, Divider } from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../types';
import learningService, { LearningSession, Question } from '../services/learningService';
import wordListService from '../services/wordListService';
import { WordList } from '../types';

type LearnScreenRouteProp = RouteProp<RootStackParamList, 'Learn'>;

const LearnScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<LearnScreenRouteProp>();
  const { listId } = route.params;

  // State
  const [loading, setLoading] = useState(true);
  const [wordList, setWordList] = useState<WordList | null>(null);
  const [session, setSession] = useState<LearningSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [streak, setStreak] = useState(0);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  // Load word list and start session
  useEffect(() => {
    const loadSession = async () => {
      try {
        setLoading(true);
        
        // Get word list
        const list = await wordListService.getWordList(listId);
        setWordList(list);
        
        // Start learning session
        const newSession = await learningService.startSession(listId);
        setSession(newSession);
        
        // Set first question
        if (newSession.questions.length > 0) {
          setCurrentQuestion(newSession.questions[0]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading learning session:', error);
        Alert.alert('Hata', 'Öğrenme oturumu başlatılırken bir hata oluştu.');
        navigation.goBack();
      }
    };
    
    loadSession();
  }, [listId, navigation]);

  // Check answer
  const checkAnswer = (answer: string) => {
    if (!currentQuestion || isAnswerChecked) return;
    
    setSelectedAnswer(answer);
    setIsAnswerChecked(true);
    
    // Check if answer is correct
    const correct = learningService.checkAnswer(currentQuestion, answer);
    setIsCorrect(correct);
    
    // Update session stats
    if (session) {
      const updatedSession = { ...session };
      
      if (correct) {
        updatedSession.correctAnswers += 1;
        setStreak(streak + 1);
      } else {
        updatedSession.incorrectAnswers += 1;
        setStreak(0);
      }
      
      setSession(updatedSession);
      
      // Update word mastery
      learningService.updateWordMastery(currentQuestion.word, correct);
    }
  };

  // Move to next question
  const nextQuestion = () => {
    if (!session) return;
    
    // Reset state
    setSelectedAnswer(null);
    setIsAnswerChecked(false);
    
    // Move to next question
    const nextIndex = session.currentQuestionIndex + 1;
    
    if (nextIndex < session.questions.length) {
      // Update session
      const updatedSession = {
        ...session,
        currentQuestionIndex: nextIndex,
      };
      
      setSession(updatedSession);
      setCurrentQuestion(session.questions[nextIndex]);
    } else {
      // Session completed
      setSessionCompleted(true);
      learningService.completeSession(session);
    }
  };

  // Restart session
  const restartSession = async () => {
    try {
      setLoading(true);
      setSessionCompleted(false);
      setStreak(0);
      
      // Start new session
      const newSession = await learningService.startSession(listId);
      setSession(newSession);
      
      // Set first question
      if (newSession.questions.length > 0) {
        setCurrentQuestion(newSession.questions[0]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error restarting learning session:', error);
      Alert.alert('Hata', 'Öğrenme oturumu yeniden başlatılırken bir hata oluştu.');
    }
  };

  // Render option
  const renderOption = (option: string, index: number) => {
    const isSelected = selectedAnswer === option;
    const isCorrectAnswer = currentQuestion?.correctAnswer === option;
    
    // Determine style based on selection and correctness
    let optionStyle = styles.option;
    let textStyle = styles.optionText;
    
    if (isAnswerChecked) {
      if (isCorrectAnswer) {
        optionStyle = styles.correctOption;
        textStyle = styles.correctOptionText;
      } else if (isSelected && !isCorrectAnswer) {
        optionStyle = styles.incorrectOption;
        textStyle = styles.incorrectOptionText;
      }
    } else if (isSelected) {
      optionStyle = styles.selectedOption;
      textStyle = styles.selectedOptionText;
    }
    
    return (
      <TouchableOpacity
        key={index}
        style={optionStyle}
        onPress={() => checkAnswer(option)}
        disabled={isAnswerChecked}
      >
        <Text style={textStyle}>{option}</Text>
        {isAnswerChecked && isCorrectAnswer && (
          <MaterialCommunityIcons name="check-circle" size={24} color="#4CAF50" style={styles.optionIcon} />
        )}
        {isAnswerChecked && isSelected && !isCorrectAnswer && (
          <MaterialCommunityIcons name="close-circle" size={24} color="#F44336" style={styles.optionIcon} />
        )}
      </TouchableOpacity>
    );
  };

  // Render question
  const renderQuestion = () => {
    if (!currentQuestion) return null;
    
    return (
      <Card style={styles.questionCard}>
        <Card.Content>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
          
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => renderOption(option, index))}
          </View>
          
          {isAnswerChecked && (
            <View style={styles.feedbackContainer}>
              <MaterialCommunityIcons
                name={isCorrect ? 'check-circle' : 'close-circle'}
                size={32}
                color={isCorrect ? '#4CAF50' : '#F44336'}
              />
              <Text style={[
                styles.feedbackText,
                { color: isCorrect ? '#4CAF50' : '#F44336' }
              ]}>
                {isCorrect ? 'Doğru!' : 'Yanlış!'}
              </Text>
              {!isCorrect && (
                <Text style={styles.correctAnswerText}>
                  Doğru cevap: {currentQuestion.correctAnswer}
                </Text>
              )}
            </View>
          )}
        </Card.Content>
        
        {isAnswerChecked && (
          <Card.Actions style={styles.cardActions}>
            <Button
              mode="contained"
              onPress={nextQuestion}
              style={styles.nextButton}
            >
              Sonraki Soru
            </Button>
          </Card.Actions>
        )}
      </Card>
    );
  };

  // Render session summary
  const renderSessionSummary = () => {
    if (!session) return null;
    
    const totalQuestions = session.correctAnswers + session.incorrectAnswers;
    const successRate = totalQuestions > 0 ? (session.correctAnswers / totalQuestions) * 100 : 0;
    
    return (
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Title style={styles.summaryTitle}>Oturum Tamamlandı!</Title>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="check-circle" size={32} color="#4CAF50" />
              <Text style={styles.statValue}>{session.correctAnswers}</Text>
              <Text style={styles.statLabel}>Doğru</Text>
            </View>
            
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="close-circle" size={32} color="#F44336" />
              <Text style={styles.statValue}>{session.incorrectAnswers}</Text>
              <Text style={styles.statLabel}>Yanlış</Text>
            </View>
            
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="percent" size={32} color="#2196F3" />
              <Text style={styles.statValue}>{successRate.toFixed(0)}%</Text>
              <Text style={styles.statLabel}>Başarı</Text>
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          <Paragraph style={styles.summaryText}>
            Tebrikler! Bu oturumda {session.questions.length} sorudan {session.correctAnswers} tanesini doğru cevapladınız.
            Öğrenmeye devam etmek için yeni bir oturum başlatabilirsiniz.
          </Paragraph>
        </Card.Content>
        
        <Card.Actions style={styles.summaryActions}>
          <Button
            mode="contained"
            onPress={restartSession}
            style={styles.restartButton}
          >
            Yeni Oturum Başlat
          </Button>
          
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.exitButton}
          >
            Çıkış
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Öğrenme oturumu hazırlanıyor...</Text>
      </View>
    );
  }

  // No questions available
  if (session && session.questions.length === 0) {
    return (
      <View style={styles.container}>
        <Appbar.Header style={styles.appbar}>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Öğrenme Modu" subtitle={wordList?.name} />
        </Appbar.Header>
        
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="book-open-variant" size={64} color="#94A3B8" />
          <Text style={styles.emptyText}>Bu listede öğrenilecek kelime bulunamadı.</Text>
          <Button
            mode="contained"
            onPress={() => navigation.goBack()}
            style={styles.emptyButton}
          >
            Geri Dön
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Öğrenme Modu" subtitle={wordList?.name} />
      </Appbar.Header>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {!sessionCompleted ? (
          <>
            {/* Progress bar */}
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                Soru {session?.currentQuestionIndex + 1}/{session?.questions.length}
              </Text>
              <ProgressBar
                progress={(session?.currentQuestionIndex || 0) / (session?.questions.length || 1)}
                color="#4CAF50"
                style={styles.progressBar}
              />
            </View>
            
            {/* Streak indicator */}
            {streak > 0 && (
              <View style={styles.streakContainer}>
                <MaterialCommunityIcons name="fire" size={24} color="#FF9800" />
                <Text style={styles.streakText}>{streak} seri</Text>
              </View>
            )}
            
            {/* Question */}
            {renderQuestion()}
          </>
        ) : (
          /* Session summary */
          renderSessionSummary()
        )}
      </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#E2E8F0',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#334155',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  streakText: {
    fontSize: 14,
    color: '#FF9800',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  questionCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    marginBottom: 16,
    borderColor: '#334155',
    borderWidth: 1,
  },
  questionText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 24,
    lineHeight: 26,
  },
  optionsContainer: {
    marginBottom: 16,
  },
  option: {
    backgroundColor: '#334155',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#4338CA',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  correctOption: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderColor: '#4CAF50',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  incorrectOption: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    borderColor: '#F44336',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
  },
  selectedOptionText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
    flex: 1,
  },
  correctOptionText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
    flex: 1,
  },
  incorrectOptionText: {
    fontSize: 16,
    color: '#F44336',
    fontWeight: 'bold',
    flex: 1,
  },
  optionIcon: {
    marginLeft: 8,
  },
  feedbackContainer: {
    alignItems: 'center',
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderRadius: 8,
  },
  feedbackText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  correctAnswerText: {
    fontSize: 16,
    color: '#E2E8F0',
    marginTop: 8,
  },
  cardActions: {
    justifyContent: 'center',
    paddingBottom: 16,
  },
  nextButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
  },
  summaryCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    marginTop: 16,
    borderColor: '#334155',
    borderWidth: 1,
  },
  summaryTitle: {
    fontSize: 24,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  divider: {
    backgroundColor: '#334155',
    marginVertical: 16,
  },
  summaryText: {
    fontSize: 16,
    color: '#E2E8F0',
    textAlign: 'center',
    lineHeight: 24,
  },
  summaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  restartButton: {
    backgroundColor: '#4CAF50',
    flex: 1,
    marginHorizontal: 8,
  },
  exitButton: {
    borderColor: '#94A3B8',
    flex: 1,
    marginHorizontal: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
  },
});

export default LearnScreen;
