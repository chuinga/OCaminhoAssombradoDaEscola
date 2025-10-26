/**
 * AWS API client utilities for communicating with Lambda functions
 * Provides retry logic, error handling, and request/response validation
 */

export interface RetryOptions {
  maxRetries: number;
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
};

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calculate exponential backoff delay with jitter
 */
const calculateDelay = (attempt: number, options: RetryOptions): number => {
  const exponentialDelay = options.baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 0.1 * exponentialDelay; // 10% jitter
  return Math.min(exponentialDelay + jitter, options.maxDelay);
};

/**
 * Check if an error is retryable
 */
const isRetryableError = (error: any): boolean => {
  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }
  
  // Timeout errors
  if (error instanceof Error && error.name === 'AbortError') {
    return true;
  }
  
  // HTTP status codes that should be retried
  if (error.status) {
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    return retryableStatuses.includes(error.status);
  }
  
  return false;
};

/**
 * Enhanced fetch with retry logic and error handling
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryOptions: Partial<RetryOptions> = {}
): Promise<Response> {
  const finalRetryOptions = { ...DEFAULT_RETRY_OPTIONS, ...retryOptions };
  let lastError: any;

  for (let attempt = 0; attempt <= finalRetryOptions.maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
      });

      // If successful or non-retryable error, return response
      if (response.ok || !isRetryableError({ status: response.status })) {
        return response;
      }

      // Store error for potential retry
      lastError = { status: response.status, statusText: response.statusText };
      
      // Don't retry on last attempt
      if (attempt === finalRetryOptions.maxRetries) {
        return response;
      }

    } catch (error) {
      lastError = error;
      
      // Don't retry on last attempt or non-retryable errors
      if (attempt === finalRetryOptions.maxRetries || !isRetryableError(error)) {
        throw error;
      }
    }

    // Calculate delay and wait before retry
    if (attempt < finalRetryOptions.maxRetries) {
      const delay = calculateDelay(attempt, finalRetryOptions);
      console.warn(`Request failed, retrying in ${delay}ms (attempt ${attempt + 1}/${finalRetryOptions.maxRetries + 1})`);
      await sleep(delay);
    }
  }

  // This should never be reached, but throw last error as fallback
  throw lastError;
}

/**
 * Validate AWS API base URL configuration
 */
export function validateAwsConfig(): string {
  const baseUrl = process.env.AWS_API_BASE_URL;
  
  if (!baseUrl) {
    throw new Error('AWS_API_BASE_URL environment variable is not configured');
  }
  
  try {
    new URL(baseUrl);
  } catch {
    throw new Error('AWS_API_BASE_URL is not a valid URL');
  }
  
  return baseUrl;
}

/**
 * Create standardized error responses for API routes
 */
export function createErrorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

/**
 * Handle common AWS API errors and convert to appropriate HTTP responses
 */
export function handleAwsError(error: any): Response {
  console.error('AWS API Error:', error);
  
  // Network connectivity issues
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return createErrorResponse('Network error connecting to AWS', 503);
  }
  
  // Timeout errors
  if (error instanceof Error && error.name === 'AbortError') {
    return createErrorResponse('Request timeout', 504);
  }
  
  // Configuration errors
  if (error.message?.includes('AWS_API_BASE_URL')) {
    return createErrorResponse('API configuration error', 500);
  }
  
  // HTTP errors with status codes
  if (error.status) {
    switch (error.status) {
      case 400:
        return createErrorResponse('Invalid request data', 400);
      case 401:
        return createErrorResponse('Unauthorized', 401);
      case 403:
        return createErrorResponse('Forbidden', 403);
      case 404:
        return createErrorResponse('Resource not found', 404);
      case 429:
        return createErrorResponse('Too many requests. Please try again later.', 429);
      case 500:
        return createErrorResponse('Internal server error', 500);
      case 502:
        return createErrorResponse('Bad gateway', 502);
      case 503:
        return createErrorResponse('Service unavailable', 503);
      case 504:
        return createErrorResponse('Gateway timeout', 504);
      default:
        return createErrorResponse(`AWS API error: ${error.statusText || 'Unknown error'}`, error.status);
    }
  }
  
  // Generic fallback
  return createErrorResponse('Internal server error', 500);
}