// Test script for Learning Mode
// This is a manual test script to verify the functionality of the Learning Mode

/**
 * Test Steps:
 * 
 * 1. Login to the app
 * 2. Navigate to a word list with words
 * 3. Click on "Öğren" button to start learning mode
 * 4. Verify that questions are generated based on the words in the list
 * 5. Answer questions and verify feedback
 * 6. Complete the session and verify summary
 * 7. Restart session and verify new questions
 * 
 * Expected Results:
 * 
 * - Questions should be generated based on the words and translations added by the user
 * - Different question types should be presented (original->translation, translation->original, context)
 * - Feedback should be provided for correct/incorrect answers
 * - Progress should be tracked during the session
 * - Session summary should show correct statistics
 * - Restarting should generate a new set of questions
 */

// Test Data:
// Create a list with the following words for testing:
// 
// 1. hello - merhaba - Context: "Hello, how are you?"
// 2. book - kitap - Context: "I read a book yesterday."
// 3. car - araba - Context: "I drive a car to work."
// 4. house - ev - Context: "My house is big."
// 5. world - dünya - Context: "Hello world!"
//
// Expected question types:
// - "hello" kelimesinin anlamı nedir? (Options should include "merhaba")
// - "merhaba" kelimesinin karşılığı nedir? (Options should include "hello")
// - Boşluğa hangi kelime gelmelidir? "________, how are you?" (Options should include "hello")
