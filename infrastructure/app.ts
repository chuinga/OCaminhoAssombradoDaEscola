#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { GameLeaderboardStack } from './game-leaderboard-stack';

const app = new cdk.App();

new GameLeaderboardStack(app, 'CaminhoAssombradoLeaderboard', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  description: 'Leaderboard system for Caminho Assombrado da Escola game',
});