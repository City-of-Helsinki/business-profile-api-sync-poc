# Business Profile API sync poc

This is a proof of concept for syncronizing opening hours from Hauki API to Google Business Profile.

## How to run

### Install dependencis

```shell
npm install
```

### Copy .env

```shell
cp .env.example .env
```

### Build

```shell
npm run build
```

### Service account preparation

- Create service account in Google Cloud
- Create keys file for the account and copy it under `keys` folder
- Define the file name in .env
- Invite service account to your business profile organization

### Accept invitation

#### List accounts to get the service account id

```shell
npm run cmd -- accounts
```

#### Use service account id to get invitations

```shell
npm run cmd -- invites <SERVICE_ACCOUNT_ID>
```

#### Accept the invite

```shell
npm run cmd -- accept <INVITE_ID>
```

### Finalize service account setup

- Add service account to appropriate user group in the business profile organization

### Set location group

#### Get accounts and copy the appropriate location group id to .env file

```shell
npm run cmd -- accounts
```

### Run synchronization

```shell
npm run cmd -- location <TPR_UNIT_ID>
```

## Event driven architecture POC

Run Kafka server

```shell
docker-compose up
```

Build application

```shell
npm run build
```

Run resource updates event listener

```shell
npm run start-resource-updates-listener
```

Fire test resource update event

```shell
npm run test-resource-update
```
