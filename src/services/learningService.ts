import { Word } from '../types';
import wordListService from './wordListService';

// Question types
export type QuestionType = 'multipleChoice' | 'translation' | 'context';

export interface Question {
  id: string;
  wordId: string;
  type: QuestionType;
  question: string;
  options: string[];
  correctAnswer: string;
  word: Word;
}

// Learning session
export interface LearningSession {
  listId: string;
  questions: Question[];
  currentQuestionIndex: number;
  correctAnswers: number;
  incorrectAnswers: number;
  startTime: Date;
}

// Generate a random ID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

// Shuffle an array
const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Get random items from an array
const getRandomItems = <T>(array: T[], count: number): T[] => {
  const shuffled = shuffleArray(array);
  return shuffled.slice(0, count);
};

// Learning service
const learningService = {
  // Start a new learning session
  startSession: async (listId: string): Promise<LearningSession> => {
    try {
      // Get words from the list
      const words = await wordListService.getWords(listId);

      if (words.length === 0) {
        throw new Error('No words found in this list');
      }

      // Generate questions
      const questions = learningService.generateQuestions(words);

      // Create a new session
      const session: LearningSession = {
        listId,
        questions,
        currentQuestionIndex: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        startTime: new Date(),
      };

      return session;
    } catch (error) {
      console.error('Error starting learning session:', error);
      throw error;
    }
  },

  // Generate questions from words
  generateQuestions: (words: Word[]): Question[] => {
    const questions: Question[] = [];

    // For each word, create only original -> translation questions
    words.forEach(word => {
      // Multiple choice question (original -> translation)
      questions.push(learningService.createMultipleChoiceQuestion(word, words, 'original'));

      // Context question if available (optional - can be commented out if not needed)
      // if (word.context) {
      //   questions.push(learningService.createContextQuestion(word, words));
      // }
    });

    // Shuffle questions
    return shuffleArray(questions);
  },

  // Create a multiple choice question
  createMultipleChoiceQuestion: (
    word: Word,
    allWords: Word[],
    questionType: 'original' | 'translation'
  ): Question => {
    // Get other words for wrong options
    const otherWords = allWords.filter(w => w.id !== word.id);

    // Create options
    let correctAnswer = '';
    let questionText = '';
    let options: string[] = [];

    if (questionType === 'original') {
      // Question about the original word
      questionText = `"${word.original}" kelimesinin anlamı nedir?`;
      correctAnswer = word.translation;

      // Ensure we have enough other words for wrong options
      if (otherWords.length < 3) {
        // If not enough words, create some fake options
        const fakeOptions = [
          ` konaklama`,
          ` ağaç`,
          ` kırmızı`,
          ` sürmek`,
          ` elma`,
          ` buzdolabı`,
          ` yaz`,
          ` kış`,
          ` numara`,
          ` koşmak`,
          ` izlemek`,
          ` çalışmak`,
          ` ağlamak`,
          ` karlı hava`,
          ` üflemek`,
          ` taş`,
        ];

        // Get as many real options as possible, then fill with fake ones
        const realWrongOptions = otherWords.map(w => w.translation);
        const neededFakeOptions = 3 - realWrongOptions.length;
        const wrongOptions = [...realWrongOptions, ...fakeOptions.slice(0, neededFakeOptions)];

        // Combine and shuffle options
        options = shuffleArray([correctAnswer, ...wrongOptions]);
      } else {
        // Get random wrong options that are different from the correct answer
        let wrongOptions = [];
        const possibleOptions = otherWords.map(w => w.translation)
          .filter(t => t !== correctAnswer); // Ensure no duplicates with correct answer

        // Get exactly 3 wrong options
        wrongOptions = getRandomItems(possibleOptions, 3);

        // Combine and shuffle options
        options = shuffleArray([correctAnswer, ...wrongOptions]);
      }
    } else {
      // Question about the translation
      questionText = `"${word.translation}" kelimesinin karşılığı nedir?`;
      correctAnswer = word.original;

      // Ensure we have enough other words for wrong options
      if (otherWords.length < 3) {
        // If not enough words, create some fake options
        const fakeOptions = [
          ` konaklama`,
          ` ağaç`,
          ` kırmızı`,
          ` sürmek`,
          ` elma`,
          ` buzdolabı`,
          ` yaz`,
          ` kış`,
          ` numara`,
          ` koşmak`,
          ` izlemek`,
          ` çalışmak`,
          ` ağlamak`,
          ` karlı hava`,
          ` üflemek`,
          ` taş`,
        ];

        // Get as many real options as possible, then fill with fake ones
        const realWrongOptions = otherWords.map(w => w.original);
        const neededFakeOptions = 3 - realWrongOptions.length;
        const wrongOptions = [...realWrongOptions, ...fakeOptions.slice(0, neededFakeOptions)];

        // Combine and shuffle options
        options = shuffleArray([correctAnswer, ...wrongOptions]);
      } else {
        // Get random wrong options that are different from the correct answer
        let wrongOptions = [];
        const possibleOptions = otherWords.map(w => w.original)
          .filter(t => t !== correctAnswer); // Ensure no duplicates with correct answer

        // Get exactly 3 wrong options
        wrongOptions = getRandomItems(possibleOptions, 3);

        // Combine and shuffle options
        options = shuffleArray([correctAnswer, ...wrongOptions]);
      }
    }

    // Ensure we have exactly 4 options (1 correct, 3 wrong)
    if (options.length !== 4) {
      console.warn(`Question has ${options.length} options instead of 4`);
    }

    return {
      id: generateId(),
      wordId: word.id,
      type: 'multipleChoice',
      question: questionText,
      options,
      correctAnswer,
      word,
    };
  },

  // Create a context question
  createContextQuestion: (word: Word, allWords: Word[]): Question => {
    // Get other words for wrong options
    const otherWords = allWords.filter(w => w.id !== word.id);

    // Create context question
    const contextWithBlank = word.context?.replace(
      word.original,
      '________'
    ) || '';

    const questionText = `Boşluğa hangi kelime gelmelidir?\n\n"${contextWithBlank}"`;
    const correctAnswer = word.original;

    // Ensure we have enough other words for wrong options
    let options: string[] = [];

    if (otherWords.length < 3) {
      // If not enough words, create some fake options
      const fakeOptions = [
        `${correctAnswer}e`,
        `${correctAnswer}da`,
        `${correctAnswer}dan`
      ];

      // Get as many real options as possible, then fill with fake ones
      const realWrongOptions = otherWords.map(w => w.original);
      const neededFakeOptions = 3 - realWrongOptions.length;
      const wrongOptions = [...realWrongOptions, ...fakeOptions.slice(0, neededFakeOptions)];

      // Combine and shuffle options
      options = shuffleArray([correctAnswer, ...wrongOptions]);
    } else {
      // Get random wrong options that are different from the correct answer
      let wrongOptions = [];
      const possibleOptions = otherWords.map(w => w.original)
        .filter(t => t !== correctAnswer); // Ensure no duplicates with correct answer

      // Get exactly 3 wrong options
      wrongOptions = getRandomItems(possibleOptions, 3);

      // Combine and shuffle options
      options = shuffleArray([correctAnswer, ...wrongOptions]);
    }

    // Ensure we have exactly 4 options (1 correct, 3 wrong)
    if (options.length !== 4) {
      console.warn(`Context question has ${options.length} options instead of 4`);
    }

    return {
      id: generateId(),
      wordId: word.id,
      type: 'context',
      question: questionText,
      options,
      correctAnswer,
      word,
    };
  },

  // Check if an answer is correct
  checkAnswer: (question: Question, answer: string): boolean => {
    return question.correctAnswer === answer;
  },

  // Update word mastery level based on answer
  updateWordMastery: async (word: Word, isCorrect: boolean): Promise<Word> => {
    try {
      // Update mastery level
      let masteryLevel = word.mastery_level || 0;

      if (isCorrect) {
        // Increase mastery level (max 5)
        masteryLevel = Math.min(5, masteryLevel + 1);
      } else {
        // Decrease mastery level (min 0)
        masteryLevel = Math.max(0, masteryLevel - 1);
      }

      // Update word
      const updatedWord = {
        ...word,
        mastery_level: masteryLevel,
      };

      // Save to database
      return await wordListService.updateWord(updatedWord);
    } catch (error) {
      console.error('Error updating word mastery:', error);
      throw error;
    }
  },

  // Complete a learning session
  completeSession: async (session: LearningSession): Promise<void> => {
    try {
      // Calculate session duration
      const endTime = new Date();
      const durationMs = endTime.getTime() - session.startTime.getTime();
      const durationMinutes = Math.floor(durationMs / 60000);

      console.log(`Learning session completed in ${durationMinutes} minutes`);
      console.log(`Correct answers: ${session.correctAnswers}`);
      console.log(`Incorrect answers: ${session.incorrectAnswers}`);

      // In a real implementation, we would save session statistics to the database
    } catch (error) {
      console.error('Error completing learning session:', error);
      throw error;
    }
  },
};

export default learningService;
