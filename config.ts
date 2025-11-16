// Simulates environment variables for easy configuration.
// In a real-world scenario, these would be populated by a build process (e.g., from .env files).
export const config = {
  // Minimum delay for the mock API response in milliseconds.
  MOCK_API_DELAY_MIN: 1000,
  // Maximum delay for the mock API response in milliseconds.
  MOCK_API_DELAY_MAX: 2000,
  // The chance (0 to 1) that the mock API will return an error.
  MOCK_API_FAILURE_RATE: 0.05, // 5% chance
};
