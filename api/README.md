# Business Profile API sync POC - API

## How to run

### Service account preparation

- Create service account in Google Cloud
- Create keys file for the account and copy it under `keys` folder
- Put the keys file name to the `KEY_FILE` variable

### Service account as part of business profile organization

- Invite service account to your business profile organization

Install dependencies

```shell
npm install
```

Build application

```shell
npm run build
```

List accounts to get the service account id

```shell
npm run cmd -- accounts
```

#### Use service account's id to get pending invitations

```shell
npm run cmd -- invitations <SERVICE_ACCOUNT_ID>
```

#### Accept the invitation

```shell
npm run cmd -- accept <INVITE_ID>
```

#### Finalize service account setup

- Add service account to appropriate user group in the business profile organization.

### Set location group

Get accounts and copy the appropriate location group id to `LOCATION_GROUP_ID` in the .env file

```shell
npm run cmd -- accounts
```

## Opening hours update simulation

### Simulate update event from command line

```shell
npm run cmd -- location <HAUKI_PRODUCTION_ID>
```

### Event driven architecture POC

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
npm run start:resource-updates-listener
```

Simulate resource update event with default location

```shell
npm run test:resource-update
```

You can pass Hauki id to test with other locations

```shell
npm run test:resource-update -- 1
```

You can find location ids from here: <https://hauki.api.hel.fi/v1/opening_hours/?start_date=+0w&end_date=+0w>

## Rest API

Run migrations

```shell
npm run migrations migrate:latest
```

Run development server

```shell
npm run start:api:dev
```

Run production server

```shell
npm run build && npm run start:api
```
