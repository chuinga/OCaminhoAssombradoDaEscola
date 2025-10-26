// Manual test to verify API client functionality
// This can be run in a browser console or Node.js environment

import { apiClient, ApiError, NetworkError, TimeoutError, getErrorMessage, isRetryableError } from '../lib/api';
import type { SubmitScoreRequest } from '../types';

// Test data
const testScoreData: SubmitScoreRequest = {
  firstName: 'Test',
  lastName: 'Player',
  score: 1500,
  character: 'boy',
  weapon: 'katana',
  difficulty: 'medium'
};

// Manual test functions
export async function testApiClient() {
  console.log('🧪 Testing API Client...');
  
  try {
    // Test 1: Health check (if endpoint exists)
    console.log('1. Testing health check...');
    const isHealthy = await apiClient.healthCheck();
    console.log(`   Health check result: ${isHealthy}`);
    
    // Test 2: Get top 10 scores
    console.log('2. Testing getTop10Scores...');
    const top10 = await apiClient.getTop10Scores();
    console.log(`   Top 10 scores fetched: ${top10.scores.length} scores, total: ${top10.total}`);
    
    // Test 3: Get all scores
    console.log('3. Testing getAllScores...');
    const allScores = await apiClient.getAllScores();
    console.log(`   All scores fetched: ${allScores.scores.length} scores, hasMore: ${allScores.hasMore}`);
    
    // Test 4: Submit score (this will likely fail without a real backend)
    console.log('4. Testing submitScore...');
    try {
      const submittedScore = await apiClient.submitScore(testScoreData);
      console.log(`   Score submitted successfully: ${submittedScore.scoreId}`);
    } catch (error) {
      console.log(`   Score submission failed (expected): ${getErrorMessage(error)}`);
    }
    
    console.log('✅ API Client tests completed');
    
  } catch (error) {
    console.error('❌ API Client test failed:', error);
  }
}

// Test error handling
export function testErrorHandling() {
  console.log('🧪 Testing Error Handling...');
  
  // Test error message generation
  const apiError = new ApiError('Test API error', 500);
  const networkError = new NetworkError('Test network error');
  const timeoutError = new TimeoutError('Test timeout');
  
  console.log('Error messages:');
  console.log(`  API Error: ${getErrorMessage(apiError)}`);
  console.log(`  Network Error: ${getErrorMessage(networkError)}`);
  console.log(`  Timeout Error: ${getErrorMessage(timeoutError)}`);
  
  // Test retry logic
  console.log('Retry logic:');
  console.log(`  API Error (500) retryable: ${isRetryableError(apiError)}`);
  console.log(`  API Error (400) retryable: ${isRetryableError(new ApiError('Client error', 400))}`);
  console.log(`  Network Error retryable: ${isRetryableError(networkError)}`);
  console.log(`  Timeout Error retryable: ${isRetryableError(timeoutError)}`);
  
  console.log('✅ Error handling tests completed');
}

// Test validation
export function testValidation() {
  console.log('🧪 Testing Validation...');
  
  const invalidData = [
    { ...testScoreData, firstName: '' },
    { ...testScoreData, lastName: '' },
    { ...testScoreData, score: -1 },
    { ...testScoreData, score: 1000000 },
    { ...testScoreData, character: 'invalid' as any },
    { ...testScoreData, weapon: 'invalid' },
    { ...testScoreData, difficulty: 'invalid' as any }
  ];
  
  invalidData.forEach((data, index) => {
    try {
      // This will trigger validation in submitScore
      apiClient.submitScore(data);
      console.log(`  Test ${index + 1}: ❌ Should have failed validation`);
    } catch (error) {
      console.log(`  Test ${index + 1}: ✅ Validation caught: ${getErrorMessage(error)}`);
    }
  });
  
  console.log('✅ Validation tests completed');
}

// Export test runner
export function runAllTests() {
  console.log('🚀 Running all API client tests...\n');
  
  testErrorHandling();
  console.log('');
  
  testValidation();
  console.log('');
  
  // Note: testApiClient() requires actual API endpoints
  console.log('ℹ️  To test actual API calls, run testApiClient() when backend is available');
  
  console.log('\n🎉 All tests completed!');
}

// Auto-run if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  (window as any).testApiClient = testApiClient;
  (window as any).runAllTests = runAllTests;
  console.log('API test functions available: testApiClient(), runAllTests()');
}