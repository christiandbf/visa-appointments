# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Spanish visa appointment checker for Colombian nationals. It's a serverless AWS Lambda function that periodically scrapes the Spanish consulate's website to check for available visa appointment dates and sends SMS notifications when appointments are found.

## Key Commands

### Development Commands
- `npm run lint` - Run ESLint to check code quality
- `npm run lint:fix` - Run ESLint with auto-fix enabled
- `serverless invoke local --function appointments` - Test the function locally

### Deployment Commands
- `npm run deploy:dev` - Deploy to development environment
- `npm run deploy:test` - Deploy to test environment (`serverless deploy --stage test`)
- `npm run deploy:prod` - Deploy to production environment (`serverless deploy --stage prod`)

## Architecture

### Core Components
- **handler.js** - Single Lambda function that:
  - Uses Playwright to navigate the Spanish consulate website
  - Scrapes appointment availability information
  - Takes screenshots and uploads to S3
  - Sends SMS notifications via AWS SNS

### AWS Resources
- **Lambda Function**: Runs every hour (configurable in serverless.yml events)
- **S3 Bucket**: Stores screenshots with naming pattern `visa-appointments-{stage}-screenshots`
- **IAM Role**: Has permissions for SNS publishing and S3 object operations
- **CloudWatch Events**: Triggers the function on schedule

### Environment Configuration
Environment variables are managed through `env.yml` with stage-specific configurations:
- `NODE_ENV` - Environment setting
- `URL` - Spanish consulate website URL
- `PHONE_NUMBERS` - Comma-separated list of phone numbers for SMS notifications
- `S3_BUCKET` - Auto-generated S3 bucket reference

### Web Scraping Flow
1. Navigate to Spanish consulate website
2. Click through to visa appointments section
3. Extract nearest available date from `#idDivBktDatetimeSelectedDate` element  
4. Take screenshot for verification
5. Upload screenshot to S3
6. Send SMS notifications to configured phone numbers

## Configuration Files

- **serverless.yml** - AWS Lambda configuration with Serverless Framework v4, Node.js 18.x runtime, 1024MB memory, 300s timeout
- **.eslintrc.yml** - ESLint configuration using Airbnb base rules
- **env.yml** - Stage-specific environment variables (not committed to git)
- **package.json** - Node.js dependencies including playwright-aws-lambda and aws-sdk

## Development Notes

The function is configured to run every hour but can be adjusted by modifying the `events.schedule` in serverless.yml. The playwright-aws-lambda package is used to run Chromium in the AWS Lambda environment efficiently.

**Important**: Serverless Framework v4 requires authentication with `serverless login` before deployment. The framework has been updated from v3 to v4 with Node.js runtime upgraded from 14.x to 18.x.