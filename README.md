# Saksoff5th API

## Prerequisites

* First download and install Git [Install Tutorial](https://www.atlassian.com/git/tutorials/install-git)
* Install [Node](https://nodejs.org/en/download/) v14.17.3 or use [NVM](https://github.com/nvm-sh/nvm) (node-version-manager) manage the Node versions installed on your system
* Install and configure [Mysql v8.*](https://www.mysql.com/downloads/)
* An AWS S3 account credentials or a [LocalStack](https://localstack.cloud/) setup for s3

## How to run this project

* install the pre-requisites
* crate two empty databases on your MySql server `saksoff5th` and `saksoff5th_test` (the second one is optional and only for running the test suite)
* create the s3 buckets for development and testing e.g. `SaksOff5th-dev` and `SaksOff5th-test`
* clone this repository using `git clone https://github.com/tartexs/saksoff5th.git` or `git clone git@github.com:tartexs/saksoff5th.git`
* install project dependencies using Yarn or NPM by running `npm install` or `yarn install`
* configure the app environments ([HOW TO](#how-to-configure-app-environments)) to match your current setup on the `.env.dev` and `.env.test` files.
* run database migrations by running `npm run migration:run`
* run database fixtures by running `npm run fixtures:run`
* run the development server by running `npm run dev`
* open your browser and navigate to http://localhost:3000 or http://localhost:3000/docs and verify that the app is running correctly.

## How to run test suite

To be able to run the test suite is necessary to have had configured the `.env.test` file correctly and run `npm run test` on your terminal.

## How to configure app environments

To correctly configure the different app environments is necessary to modify the files `.env.dev` and `.env.test` located at root folder and write the right values for your MySql setup

```
TYPEORM_HOST=localhost
TYPEORM_PORT=3306
TYPEORM_USERNAME=root
TYPEORM_PASSWORD=rootroot
TYPEORM_DATABASE=saksoff5th
```

and

```
S3_USER=SaksOff5th
S3_BUCKET_NAME=SaksOff5th-dev
S3_ACCESS_KEY=SOME_ACCESS_KEY
S3_SECRET_KEY=SOME_SECRET_KEY

# optional key for localstack endpoint
S3_LOCALSTACK_ENDPOINT=http://localhost:4566
```

with your AWS S3 access keys or your localstack setup


## API Architecture

This API is written using [TypeScript](https://www.typescriptlang.org/) and the [Routing-Controllers](https://github.com/typestack/routing-controllers) stack with [Express](https://expressjs.com/) and the [TypeORM](https://typeorm.io/) [ORM](https://en.wikipedia.org/wiki/Object%E2%80%93relational_mapping)

### Folder Structure

* `./src` includes all the source code
  * `./src/api`
    * `./src/api/entities` contains the different database entities declarations
    * `./src/api/repositories` contains the different repositories to interact with the database entities
    * `./src/api/subscribers` contains the different subscribers to watch and process the ORM events
    * `./src/api/commands` here are declared the models or DTO expected by the different API routes. The commands has validations and Swagger specification
    * `./src/api/viewmodels` here are declared the models or DTO that the API returns to the clients on each requests. The main ViewModel class allows to create one, many or paginated results and each model has his own Swagger specification
    * `./src/api/types` custom types and enumerations are declared here
    * `./src/api/validators` custom properties validators for API commands
    * `./src/api/middlewares` here are declared many middlewares for error handling, event logging and security
    * `./src/api/controllers` API routes are declared here, with routes requirements like commands and viewmodels with his own Swagger specification. Each route on the controllers uses the different services to interact with the Entities and to process the request
    * `./src/api/services` here are declared the different services and logics to interact with the database using the ORM for manipulate (fetch, create, edit and delete) entities and to process the different commands
  * `./src/auth` here are the functions required by the Routing-Controller stack to handle the request authentication and validation
  * `./src/database`
    * `./src/database/fixtures` in this folder goes the different database seeds or fixtures with the necessary processors and assets
    * `./src/database/migrations` this folder contains the different database migrations to create all the necessary tables and schemas
  * `./src/decorators` here are defined some custom decoractors
  * `./src/lib` contains some shared functions, the logger declaration and a helper to access to the ENV variables.
* `./tests` includes all the test suite

### Database model

![Alt text](assets/diagram-types.png?raw=true "Title")
