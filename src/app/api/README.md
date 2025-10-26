# API Routes Documentation

This directory contains Next.js API routes that act as proxies to AWS Lambda functions for the "Caminho Assombrado da Escola" game.

## Overview

The API routes provide a secure and reliable interface between the frontend application and the AWS backend infrastructure. They handle:

- Request validation and sanitization
- Error handling and retry logic
- Response formatting and validation
- Rate limiting and timeout management

## Environment Configuration

### Required Environment Variables

```bash
# AWS Lambda API endpoints
AWS_API_BASE_URL=https://your-api-gateway-url.execute-api.region.amazonaws.com/prod
```

### Local Development

For local development, you can:

1. Use AWS SAM Local to run Lambda functions locally:
   ```bash
   AWS_API_BASE_URL=http://localhost:3001/dev
   ```

2. Use mock endpoints for testing:
   ```bash
   AWS_API_BASE_URL=http://localhost:3001/mock
   ```

## API Endpoints

### GET /api/scores/top10

Fetches the top 10 highest scores for the leaderboard.

**Response:**
```typescript
{
  scores: Score[];
  total: number;
}
```

**Features:**
- Fast response with reduced retry attempts
- Automatic truncation to 10 scores maximum
- 10-second timeout

### GET /api/scores

Fetches all scores with pagination support.

**Query Parameters:**
- `nextToken` (optional): Pagination token for next page

**Response:**
```typescript
{
  scores: Score[];
  nextToken?: string;
  hasMore: boolean;
}
```

**Features:**
- Pagination support via nextToken
- 15-second timeout for larger datasets
- Enhanced retry logic for reliability

### POST /api/scores

Submits a new score to the leaderboard.

**Request Body:**
```typescript
{
  firstName: string;
  lastName: string;
  score: number;
  character: 'boy' | 'girl';
  weapon: 'katana' | 'laser' | 'baseball' | 'bazooka';
  difficulty: 'easy' | 'medium' | 'impossible';
}
```

**Response:**
```typescript
{
  scoreId: string;
  firstName: string;
  lastName: string;
  score: number;
  character: 'boy' | 'girl';
  weapon: string;
  difficulty: 'easy' | 'medium' | 'impossible';
  createdAt: string;
}
```

**Features:**
- Comprehensive input validation
- Data sanitization (trimming whitespace)
- Reduced retry attempts to prevent duplicate submissions
- 15-second timeout

## Error Handling

### Client-Side Validation

All routes perform client-side validation before proxying to AWS:

- **Required fields**: firstName, lastName, score
- **Character validation**: Must be 'boy' or 'girl'
- **Weapon validation**: Must be one of the four available weapons
- **Difficulty validation**: Must be 'easy', 'medium', or 'impossible'
- **Score validation**: Must be between 0 and 999,999

### AWS Integration Features

- **Retry Logic**: Exponential backoff with jitter for transient failures
- **Timeout Handling**: Configurable timeouts per endpoint
- **Error Classification**: Distinguishes between retryable and non-retryable errors
- **Response Validation**: Validates AWS response structure before returning to client

### HTTP Status Codes

- `200` - Success
- `201` - Score created successfully
- `400` - Invalid request data
- `429` - Rate limit exceeded
- `500` - Internal server error
- `503` - Service unavailable (network issues)
- `504` - Gateway timeout

## AWS Lambda Integration

### Expected AWS API Structure

The API routes expect the following AWS Lambda endpoints:

```
GET  /scores/top10     - Returns top 10 scores
GET  /scores           - Returns paginated scores
POST /scores           - Creates new score entry
```

### AWS Response Format

AWS Lambda functions should return responses in the following format:

**Success Response:**
```json
{
  "statusCode": 200,
  "body": "{\"scores\": [...], \"total\": 10}"
}
```

**Error Response:**
```json
{
  "statusCode": 400,
  "body": "{\"error\": \"Validation error message\"}"
}
```

### Security Considerations

- **Origin Validation**: API Gateway should restrict access to known origins
- **Rate Limiting**: Implemented at API Gateway level
- **Input Sanitization**: Performed at both Next.js and Lambda levels
- **CORS Configuration**: Properly configured for the game domain

## Monitoring and Logging

### Logging

All API routes log:
- Request details (sanitized)
- AWS response status and timing
- Error details for debugging
- Retry attempts and delays

### Metrics to Monitor

- **Response Times**: Track API response times
- **Error Rates**: Monitor 4xx and 5xx error rates
- **Retry Frequency**: Track how often retries are needed
- **Timeout Occurrences**: Monitor timeout frequency

## Development and Testing

### Testing the API Routes

```bash
# Test leaderboard endpoint
curl http://localhost:3000/api/scores/top10

# Test pagination
curl "http://localhost:3000/api/scores?nextToken=10"

# Test score submission
curl -X POST http://localhost:3000/api/scores \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Player",
    "score": 1500,
    "character": "boy",
    "weapon": "katana",
    "difficulty": "medium"
  }'
```

### Local Development Setup

1. Copy `.env.local.example` to `.env.local`
2. Configure `AWS_API_BASE_URL` for your environment
3. Start the development server: `npm run dev`
4. Test endpoints using the curl commands above

## Deployment Checklist

- [ ] Configure `AWS_API_BASE_URL` in production environment
- [ ] Verify AWS Lambda functions are deployed and accessible
- [ ] Test all API endpoints in staging environment
- [ ] Configure monitoring and alerting
- [ ] Verify CORS settings allow game domain
- [ ] Test error scenarios and retry logic