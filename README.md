# Business Profile API sync poc

This is a proof of concept for syncronizing opening hours from Hauki API to Google Business Profile.

## How to run

### Install dependencis

```shell
npm install
```

### Build

```shell
npm run build
```

### Copy .env

```shell
cp .env.example .env
```

### Get accounts and copy the appropriate location group id to .env file

```shell
npm run start -- accounts
```

### Run synchronization

```shell
npm run start -- location <TPR_UNIT_ID>
```
