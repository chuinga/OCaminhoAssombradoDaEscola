import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class GameLeaderboardStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB table for storing scores
    const scoresTable = new dynamodb.Table(this, 'ScoresTable', {
      tableName: 'caminho-assombrado-scores',
      partitionKey: {
        name: 'scoreId',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'createdAt',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN, // Keep data on stack deletion
      pointInTimeRecoverySpecification: {
        pointInTimeRecoveryEnabled: true,
      },
    });

    // Global Secondary Index for querying by score (for leaderboard)
    scoresTable.addGlobalSecondaryIndex({
      indexName: 'ScoreIndex',
      partitionKey: {
        name: 'gameType',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'score',
        type: dynamodb.AttributeType.NUMBER,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Lambda function for getting top 10 scores
    const getTop10Function = new lambda.Function(this, 'GetTop10ScoresFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
        const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb');

        const client = new DynamoDBClient({});
        const docClient = DynamoDBDocumentClient.from(client);

        exports.handler = async (event) => {
          console.log('GetTop10Scores event:', JSON.stringify(event, null, 2));
          
          try {
            const params = {
              TableName: process.env.SCORES_TABLE_NAME,
              IndexName: 'ScoreIndex',
              KeyConditionExpression: 'gameType = :gameType',
              ExpressionAttributeValues: {
                ':gameType': 'caminho-assombrado'
              },
              ScanIndexForward: false, // Sort in descending order (highest scores first)
              Limit: 10
            };

            const result = await docClient.send(new QueryCommand(params));
            
            const response = {
              scores: result.Items || [],
              total: result.Count || 0
            };

            return {
              statusCode: 200,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
              },
              body: JSON.stringify(response),
            };
          } catch (error) {
            console.error('Error fetching top 10 scores:', error);
            return {
              statusCode: 500,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
              body: JSON.stringify({ error: 'Internal server error' }),
            };
          }
        };
      `),
      environment: {
        SCORES_TABLE_NAME: scoresTable.tableName,
      },
      timeout: cdk.Duration.seconds(10),
    });

    // Lambda function for getting all scores with pagination
    const getAllScoresFunction = new lambda.Function(this, 'GetAllScoresFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
        const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb');

        const client = new DynamoDBClient({});
        const docClient = DynamoDBDocumentClient.from(client);

        exports.handler = async (event) => {
          console.log('GetAllScores event:', JSON.stringify(event, null, 2));
          
          try {
            const queryParams = event.queryStringParameters || {};
            const limit = parseInt(queryParams.limit) || 50;
            const nextToken = queryParams.nextToken;

            const params = {
              TableName: process.env.SCORES_TABLE_NAME,
              IndexName: 'ScoreIndex',
              KeyConditionExpression: 'gameType = :gameType',
              ExpressionAttributeValues: {
                ':gameType': 'caminho-assombrado'
              },
              ScanIndexForward: false, // Sort in descending order (highest scores first)
              Limit: limit
            };

            if (nextToken) {
              params.ExclusiveStartKey = JSON.parse(Buffer.from(nextToken, 'base64').toString());
            }

            const result = await docClient.send(new QueryCommand(params));
            
            const response = {
              scores: result.Items || [],
              hasMore: !!result.LastEvaluatedKey
            };

            if (result.LastEvaluatedKey) {
              response.nextToken = Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64');
            }

            return {
              statusCode: 200,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
              },
              body: JSON.stringify(response),
            };
          } catch (error) {
            console.error('Error fetching all scores:', error);
            return {
              statusCode: 500,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
              body: JSON.stringify({ error: 'Internal server error' }),
            };
          }
        };
      `),
      environment: {
        SCORES_TABLE_NAME: scoresTable.tableName,
      },
      timeout: cdk.Duration.seconds(15),
    });

    // Lambda function for submitting scores
    const submitScoreFunction = new lambda.Function(this, 'SubmitScoreFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
        const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
        const { randomUUID } = require('crypto');

        const client = new DynamoDBClient({});
        const docClient = DynamoDBDocumentClient.from(client);

        exports.handler = async (event) => {
          console.log('SubmitScore event:', JSON.stringify(event, null, 2));
          
          try {
            const body = JSON.parse(event.body || '{}');
            
            // Validate required fields
            const { firstName, lastName, score, character, weapon, difficulty } = body;
            
            if (!firstName || !lastName || typeof score !== 'number') {
              return {
                statusCode: 400,
                headers: {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({ error: 'Missing required fields: firstName, lastName, score' }),
              };
            }

            // Validate character
            if (!['boy', 'girl'].includes(character)) {
              return {
                statusCode: 400,
                headers: {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({ error: 'Invalid character. Must be "boy" or "girl"' }),
              };
            }

            // Validate weapon
            if (!['katana', 'laser', 'baseball', 'bazooka'].includes(weapon)) {
              return {
                statusCode: 400,
                headers: {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({ error: 'Invalid weapon' }),
              };
            }

            // Validate difficulty
            if (!['easy', 'medium', 'impossible'].includes(difficulty)) {
              return {
                statusCode: 400,
                headers: {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({ error: 'Invalid difficulty' }),
              };
            }

            // Validate score range
            if (score < 0 || score > 999999) {
              return {
                statusCode: 400,
                headers: {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({ error: 'Score must be between 0 and 999999' }),
              };
            }

            const scoreId = randomUUID();
            const createdAt = new Date().toISOString();
            
            const scoreItem = {
              scoreId,
              gameType: 'caminho-assombrado',
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              score,
              character,
              weapon,
              difficulty,
              createdAt
            };

            const params = {
              TableName: process.env.SCORES_TABLE_NAME,
              Item: scoreItem
            };

            await docClient.send(new PutCommand(params));

            return {
              statusCode: 201,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
              },
              body: JSON.stringify(scoreItem),
            };
          } catch (error) {
            console.error('Error submitting score:', error);
            return {
              statusCode: 500,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
              body: JSON.stringify({ error: 'Internal server error' }),
            };
          }
        };
      `),
      environment: {
        SCORES_TABLE_NAME: scoresTable.tableName,
      },
      timeout: cdk.Duration.seconds(15),
    });

    // Grant DynamoDB permissions to Lambda functions
    scoresTable.grantReadData(getTop10Function);
    scoresTable.grantReadData(getAllScoresFunction);
    scoresTable.grantWriteData(submitScoreFunction);

    // API Gateway
    const api = new apigateway.RestApi(this, 'GameLeaderboardApi', {
      restApiName: 'Caminho Assombrado Leaderboard API',
      description: 'API for managing game scores and leaderboard',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    // API Gateway integrations
    const getTop10Integration = new apigateway.LambdaIntegration(getTop10Function);
    const getAllScoresIntegration = new apigateway.LambdaIntegration(getAllScoresFunction);
    const submitScoreIntegration = new apigateway.LambdaIntegration(submitScoreFunction);

    // API routes
    const scoresResource = api.root.addResource('scores');
    
    // GET /scores - Get all scores with pagination
    scoresResource.addMethod('GET', getAllScoresIntegration);
    
    // POST /scores - Submit new score
    scoresResource.addMethod('POST', submitScoreIntegration);
    
    // GET /scores/top10 - Get top 10 scores
    const top10Resource = scoresResource.addResource('top10');
    top10Resource.addMethod('GET', getTop10Integration);

    // Output the API Gateway URL
    new cdk.CfnOutput(this, 'ApiGatewayUrl', {
      value: api.url,
      description: 'API Gateway URL for the leaderboard system',
      exportName: 'CaminhoAssombradoApiUrl',
    });

    // Output the DynamoDB table name
    new cdk.CfnOutput(this, 'ScoresTableName', {
      value: scoresTable.tableName,
      description: 'DynamoDB table name for scores',
      exportName: 'CaminhoAssombradoScoresTable',
    });
  }
}