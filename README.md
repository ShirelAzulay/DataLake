<p align="center"> 
  <a href="http://nestjs.com/" target="blank"> 
    <img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /> 
  </a> 
</p> 

<!-- Badges --> 
<p align="center"> 
  <a href="https://www.npmjs.com/~nestjscore" target="_blank">
    <img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" />
  </a> 
  <a href="https://www.npmjs.com/~nestjscore" target="_blank">
    <img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" />
  </a> 
  <a href="https://www.npmjs.com/~nestjscore" target="_blank">
    <img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" />
  </a> 
  <a href="https://circleci.com/gh/nestjs/nest" target="_blank">
    <img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" />
  </a> 
  <a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank">
    <img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" />
  </a> 
  <a href="https://discord.gg/G7Qnnhy" target="_blank">
    <img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/>
  </a> 
  <a href="https://opencollective.com/nest#backer" target="_blank">
    <img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" />
  </a> 
  <a href="https://opencollective.com/nest#sponsor" target="_blank">
    <img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" />
  </a> 
  <a href="https://paypal.me/kamilmysliwiec" target="_blank">
    <img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/>
  </a> 
  <a href="https://opencollective.com/nest#sponsor" target="_blank">
    <img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us">
  </a> 
  <a href="https://twitter.com/nestframework" target="_blank">
    <img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow">
  </a> 
</p>

# Data Lake - Project

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## API Endpoints

### Root Route

**URL:**

```
GET http://localhost:3000/
```

**Response:**

```json
{
  "message": "Hello World!"
}
```

### Download Controller

**URL:**

```
GET http://localhost:3000/download/:unique_id
```

**Example:**

```
GET http://localhost:3000/download/abcde
```

**Response (with 5-character key):**

```json
{
  "status": "success",
  "links": [
    {
      "id": "111",
      "directory": "https://storage.googleapis.com/my_storage_bucket/abcde/kl"
    },
    {
      "id": "222",
      "directory": "https://storage.googleapis.com/my_storage_bucket/abcde/xy"
    }
  ]
}
```

**Example:**

```
GET http://localhost:3000/download/abcdexy
```

**Response (with 7-character key):**

```json
{
  "status": "success",
  "links": [
    {
      "id": "222",
      "directory": "https://storage.googleapis.com/my_storage_bucket/abcde/xy"
    }
  ]
}
```

### Notification Controller

**URL:**

```
POST http://localhost:3000/notify
```

**Data:**

```json
{
  "event_type": "upload",
  "unique_id": "12345",
  "details": "File uploaded successfully."
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Notification sent."
}
```

### Orchestration Controller

**URL:**

```
POST http://localhost:3000/orchestrate
```

**Data:**

```json
{
  "workflow": {
    "step1": "action1",
    "step2": "action2"
  }
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Workflow orchestration started."
}
```

### Upload Controller

**URL:**

```
POST http://localhost:3000/upload?unique_id=abcde
```

**Data:**

FormData with key `directory` to upload files.

**Example with Postman:**

1. Select `POST` method.
2. Enter URL: `http://localhost:3000/upload?unique_id=abcde`
3. Go to `Body` tab.
4. Select `form-data`.
5. Add file with key `directory`.