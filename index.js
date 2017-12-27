'use strict'

const Hp = require('hemera-plugin')
const AWS = require('aws-sdk')
const DynamoStore = require('./store')
const StorePattern = require('hemera-store/pattern')

function hemeraDynamoStore(hemera, opts, done) {
  let topic = 'dynamo-store'
  let Joi = hemera.joi

  const client = new AWS.DynamoDB(opts.dynamodb)
  const db = new AWS.DynamoDB.DocumentClient(opts.dynamodb, client)

  hemera.decorate('dynamoStore', {
    db,
    client
  })

  hemera.add(StorePattern.create(topic), function(req, cb) {
    const store = new DynamoStore(db)
    store.create(req, cb)
  })

  hemera.add(
    {
      topic,
      cmd: 'removeById',
      id: Joi.required(),
      collection: Joi.string().required()
    },
    function(req, cb) {
      const store = new DynamoStore(db)
      store.removeById(req, cb)
    }
  )

  hemera.add(
    {
      topic,
      cmd: 'updateById',
      id: Joi.required(),
      collection: Joi.string().required(),
      options: Joi.object()
        .keys({
          UpdateExpression: Joi.string().required(),
          ConditionExpression: Joi.string(),
          ExpressionAttributeNames: Joi.object(),
          ExpressionAttributeValues: Joi.object()
        })
        .required()
    },
    function(req, cb) {
      const store = new DynamoStore(db)
      store.updateById(req, cb)
    }
  )

  hemera.add(
    {
      topic,
      cmd: 'findById',
      id: Joi.required(),
      collection: Joi.string().required(),
      options: Joi.object().keys({
        ProjectionExpression: Joi.string(),
        ExpressionAttributeNames: Joi.object()
      })
    },
    function(req, cb) {
      const store = new DynamoStore(db)
      store.findById(req, cb)
    }
  )

  hemera.add(
    {
      topic,
      cmd: 'find',
      collection: Joi.string().required(),
      options: Joi.object()
        .keys({
          KeyConditionExpression: Joi.string().required(),
          FilterExpression: Joi.string(),
          ProjectionExpression: Joi.string(),
          ExpressionAttributeNames: Joi.object(),
          ExpressionAttributeValues: Joi.object()
        })
        .required()
    },
    function(req, cb) {
      const store = new DynamoStore(db)
      store.find(req, cb)
    }
  )

  hemera.add(
    {
      topic,
      cmd: 'scan',
      collection: Joi.string().required(),
      options: Joi.object().keys({
        FilterExpression: Joi.string(),
        ProjectionExpression: Joi.string(),
        ExpressionAttributeNames: Joi.object(),
        ExpressionAttributeValues: Joi.object()
      })
    },
    function(req, cb) {
      const store = new DynamoStore(db)
      store.scan(req, cb)
    }
  )

  hemera.add(
    {
      topic,
      cmd: 'count',
      collection: Joi.string().required(),
      query: Joi.object()
        .keys({
          KeyConditionExpression: Joi.string().required(),
          FilterExpression: Joi.string(),
          ProjectionExpression: Joi.string(),
          ExpressionAttributeNames: Joi.object(),
          ExpressionAttributeValues: Joi.object()
        })
        .required()
    },
    function(req, cb) {
      const store = new DynamoStore(db)
      store.count(req, cb)
    }
  )

  hemera.add(
    {
      topic,
      cmd: 'exists',
      collection: Joi.string().required(),
      query: Joi.object()
        .keys({
          KeyConditionExpression: Joi.string().required(),
          FilterExpression: Joi.string(),
          ProjectionExpression: Joi.string(),
          ExpressionAttributeNames: Joi.object(),
          ExpressionAttributeValues: Joi.object()
        })
        .required()
    },
    function(req, cb) {
      const store = new DynamoStore(db)
      store.exists(req, cb)
    }
  )

  done()
}

module.exports = Hp(hemeraDynamoStore, {
  hemera: '>=3',
  name: require('./package.json').name,
  options: {
    payloadValidator: 'hemera-joi',
    dynamodb: {
      endpoint: 'http://localhost:8000',
      region: 'eu-west-2'
    }
  }
})
