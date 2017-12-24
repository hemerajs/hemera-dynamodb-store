'use strict'

const Hemera = require('nats-hemera')
const nats = require('nats').connect()
const hemeraDynamo = require('hemera-dynamodb-store')

const hemera = new Hemera(nats, {
  logLevel: 'info',
  childLogger: true
})

hemera.use(hemeraDynamo, {
  dynamodb: {
    endpoint: 'http://localhost:8000',
    region: 'eu-west-2'
  }
})

hemera.ready(() => {
  hemera.act(
    {
      topic: 'dynamo-store',
      cmd: 'create',
      collection: 'test',
      data: {
        id: '1111',
        name: 'John Doe'
      }
    },
    function(err, resp) {
      if (err) this.log.info(err, 'Errors occured')
      this.log.info(resp, 'Query result')
    }
  )

  hemera.act(
    {
      topic: 'dynamo-store',
      cmd: 'removeById',
      collection: 'test',
      id: '1111'
    },
    function(err, resp) {
      if (err) this.log.info(err, 'Errors occured')
      this.log.info(resp, 'Query result')
    }
  )

  hemera.act(
    {
      topic: 'dynamo-store',
      cmd: 'updateById',
      id: '1111',
      collection: 'test',
      options: {
        UpdateExpression: 'set #city = :city, #country = :country',
        ConditionExpression: '#name = :name',
        ExpressionAttributeNames: { '#name': 'name', '#city': 'city', '#country': 'country'},
        ExpressionAttributeValues: { ':name': 'John Doe', ':city': 'Skopje', ':country': 'Macedonia'}
      }  
    },
    function(err, resp) {
      if (err) this.log.info(err, 'Errors occured')
      this.log.info(resp, 'Query result')
    }
  )

  hemera.act(
    {
      topic: 'dynamo-store',
      cmd: 'findById',
      id: '1111',
      collection: 'test',
      options: {
        ProjectionExpression: '#name,#city',
        ExpressionAttributeNames: {'#name': 'name', '#city': 'city'}
      }    
    },
    function(err, resp) {
      if (err) this.log.info(err, 'Errors occured')
      this.log.info(resp, 'Query result')
    }
  )

  hemera.act(
    {
      topic: 'dynamo-store',
      cmd: 'query',
      collection: 'test',
      options: {
        KeyConditionExpression: '#id = :value',
        FilterExpression: '#name = :name',
        ProjectionExpression: '#name,#city',
        ExpressionAttributeNames: {'#name': 'name', '#city': 'city', '#id': 'id'},
        ExpressionAttributeValues: {':name': 'John Doe', ':value': '1111'}
      } 
    },
    function(err, resp) {
      if (err) this.log.info(err, 'Errors occured')
      this.log.info(resp, 'Query result')
    }
  )

  hemera.act(
    {
      topic: 'dynamo-store',
      cmd: 'scan',
      collection: 'test',
      options: {
        FilterExpression: '#name = :name',
        ProjectionExpression: '#name,#city',
        ExpressionAttributeNames: {'#name': 'name', '#city': 'city'},
        ExpressionAttributeValues: {':name': 'John Doe', ':city': 'Skopje'}
      } 
    },
    function(err, resp) {
      if (err) this.log.info(err, 'Errors occured')
      this.log.info(resp, 'Query result')
    }
  )
})
