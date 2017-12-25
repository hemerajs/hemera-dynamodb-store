# Hemera-dynamodb-store package

[![Build Status](https://travis-ci.org/hemerajs/hemera-dynamodb-store.svg?branch=master)](https://travis-ci.org/hemerajs/hemera-dynamodb-store)
[![npm](https://img.shields.io/npm/v/hemera-dynamodb-store.svg?maxAge=3600)](https://www.npmjs.com/package/hemera-dynamodb-store)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](#badge)

This is a plugin to use [DynamoDB](https://aws.amazon.com/dynamodb/) with Hemera 

## Install

```
npm i hemera-dynamodb-store --save
```

## Example

```js
hemera.use(require('hemera-dynamodb-store'), {
   dynamodb: {
        endpoint: 'http://localhost:8000',
        region: 'eu-west-2'
    }
})

hemera.ready(() => {
  hemera.act({
    topic: 'dynamo-store',
    cmd: 'create',
    collection: 'test',
    data: {
      id: '12345' , 
      name: 'John Doe'
    }
  }, function (err, resp) {
    this.log.info(resp, 'Query result')
  })
})

```

## Tests

```
npm run test
```

## Examples

[Here](https://aws.amazon.com/dynamodb/) you can find examples to see how to use it with Hemera

## API

See [Store](https://github.com/hemerajs/hemera/tree/master/packages/hemera-store) Interface.

## Dependencies

- hemera-joi
