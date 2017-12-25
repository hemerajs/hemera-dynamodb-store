'use strict'

const Hemera = require('nats-hemera')
const Nats = require('nats')
const HemeraDynamoStore = require('./../index')
const HemeraJoi = require('hemera-joi')
const Code = require('code')
const HemeraTestsuite = require('hemera-testsuite')
const DynamoDbLocal = require('dynamodb-local')
const AWS = require('aws-sdk');
const expect = Code.expect

AWS.config.region = 'eu-west-2';
AWS.config.accessKeyId= 'fakeAccessKeyId'
AWS.config.secretAccessKey = 'fakeSecretAccessKey'

/* global describe */
/* eslint no-undef: "error" */
describe('Hemera-dynamo-store', function () {
  let PORT = 4222
  var dynamoLocalPort = 8000
  var authUrl = 'nats://localhost:' + PORT

  let server
  let hemera
  let testTable = 'testTable'

  const params = {
    TableName: testTable,
    KeySchema: [{
      AttributeName: 'id',
      KeyType: 'HASH'
    }],
    AttributeDefinitions: [{
      AttributeName: 'id',
      AttributeType: 'S'
    }],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  }

  /**
   * Setup table schema
   *
   * @param {any} driver
   * @param {any} cb
   * @returns
   */

  function setup(driver, cb) {
    driver.createTable(params, function(err, data) {
      if (err) {
        console.log('errors occured')
        cb(err)
      } else {
        console.log('Table is created')
        cb(null, data)
      }
    })
  }

  /* global before */
  /* eslint no-undef: "error" */
  before(function(done) {
    server = HemeraTestsuite.start_server(PORT, () => {
      const nats = Nats.connect(authUrl)
      hemera = new Hemera(nats)
      hemera.use(HemeraJoi)
      hemera.use(HemeraDynamoStore, {
        dynamodb: {
          endpoint: 'http://localhost:8000',
          region: 'eu-west-2'
        }
      })
      hemera.ready(() => {
        console.log('Hemera is ready')
        DynamoDbLocal.configureInstaller({
          installPath: './dynamodblocal-bin',
          downloadUrl: 'https://s3.eu-central-1.amazonaws.com/dynamodb-local-frankfurt/dynamodb_local_latest.tar.gz'
        })
        DynamoDbLocal.launch(dynamoLocalPort, null, ['-sharedDb'])
          .then(function() {
            console.log('Dynamo db is active and listen on port: ' + dynamoLocalPort)
            setup(hemera.dynamoStore.createDb(), done)
          })
      })
    })
  })

  /* global after */
  /* eslint no-undef: "error" */
  after(function() {
    hemera.close()
    server.kill()
    DynamoDbLocal.stop(dynamoLocalPort)
  })

  /* global it */
  /* eslint no-undef: "error" */
  it('create', function(done) {
    hemera.act(
      {
        topic: 'dynamo-store',
        cmd: 'create',
        collection: testTable,
        data: {
          id: '000001',
          name: 'Test item is created'
        }
      },
      (err, resp) => {
        expect(err).to.be.not.exists()
        expect(resp).to.be.an.object()
        done()
      }
    )
  })

  /* global it */
  /* eslint no-undef: "error" */
  it('updateById', function(done) {
    hemera.act(
      {
        topic: 'dynamo-store',
        cmd: 'updateById',
        id: '000001',
        collection: testTable,
        options: {
          UpdateExpression: 'set #city = :city, #country = :country',
          ConditionExpression: '#name = :name',
          ExpressionAttributeNames: { '#name': 'name', '#city': 'city', '#country': 'country'},
          ExpressionAttributeValues: { ':name': 'Test item is created', ':city': 'Skopje', ':country': 'Macedonia'}
        }
      },
      function(err, resp) {
        expect(err).to.be.not.exists()
        expect(resp.Attributes.id).to.be.a.string()
        expect(resp.Attributes.id).to.equal('000001')
        expect(resp.Attributes.city).to.be.a.string()
        expect(resp.Attributes.city).to.equal('Skopje')
        expect(resp.Attributes.country).to.equal('Macedonia')
        done()
      }
    )
  })

  /* global it */
  /* eslint no-undef: "error" */
  it('findById', function(done) {
    hemera.act(
      {
        topic: 'dynamo-store',
        cmd: 'findById',
        collection: testTable,
        id: '000001',
        options: {
          ProjectionExpression: '#name,#city',
          ExpressionAttributeNames: {'#name': 'name', '#city': 'city'}
        }
      },
      function(err, resp) {
        expect(err).to.be.not.exists()
        expect(resp).to.be.a.object()
        expect(resp.name).to.be.a.string()
        expect(resp.name).to.equal('Test item is created')
        expect(resp.city).to.be.a.string()
        expect(resp.city).to.equal('Skopje')
        done()
      }
    )
  })

  /* global it */
  /* eslint no-undef: "error" */
  it('create-2', function(done) {
    hemera.act(
      {
        topic: 'dynamo-store',
        cmd: 'create',
        collection: testTable,
        data: {
          id: '2',
          name: 'Test is second item that is created',
          city: 'Paris',
          country: 'France'
        }
      },
      (err, resp) => {
        expect(err).to.be.not.exists()
        expect(resp).to.be.an.object()
        done()
      }
    )
  })

  /* global it */
  /* eslint no-undef: "error" */
  it('scan', function(done) {
    hemera.act(
      {
        topic: 'dynamo-store',
        cmd: 'scan',
        collection: testTable
      },
      (err, resp) => {
        expect(err).to.be.not.exists()
        expect(resp.Items).to.have.length(2)
        expect(resp.Items[0].name).to.equal('Test item is created')
        done()
      }
    )
  })

  /* global it */
  /* eslint no-undef: "error" */
  it('scan-with-options', function(done) {
    hemera.act(
      {
        topic: 'dynamo-store',
        cmd: 'scan',
        collection: testTable,
        options: {
          ProjectionExpression: '#name,#city',
          ExpressionAttributeNames: {'#name': 'name', '#city': 'city'}
        }
      },
      (err, resp) => {
        expect(err).to.be.not.exists()
        expect(resp.Items).to.have.length(2)
        expect(resp.Items[0].name).to.equal('Test item is created')
        done()
      }
    )
  })

  /* global it */
  /* eslint no-undef: "error" */
  it('query', function(done) {
    hemera.act(
      {
        topic: 'dynamo-store',
        cmd: 'query',
        collection: testTable,
        options: {
          KeyConditionExpression: '#id = :id',
          FilterExpression: '#city = :city',
          ProjectionExpression: '#name,#city',
          ExpressionAttributeNames: {'#id': 'id', '#name': 'name', '#city': 'city'},
          ExpressionAttributeValues: {':city': 'Paris', ':id': '2'}
        }
      },
      function(err, resp) {
        expect(err).to.be.not.exists()
        expect(resp.Items).to.have.length(1)
        expect(resp.Items[0].city).to.equal('Paris')
        done()
      }
    )
  })

  /* global it */
  /* eslint no-undef: "error" */
  it('query-error-test', function(done) {
    hemera.act(
      {
        topic: 'dynamo-store',
        cmd: 'query',
        collection: testTable,
        options: {
          KeyConditionExpression: '#id = :id, pencil',
          FilterExpression: '#city = :city',
          ProjectionExpression: '#name,#city',
          ExpressionAttributeNames: {'#id': 'id', '#name': 'name', '#city': 'city'},
          ExpressionAttributeValues: {':city': 'Paris', ':id': '2'}
        }
      },
      function(err, resp) {
        expect(err).to.exists()
        done()
      }
    )
  })

  /* global it */
  /* eslint no-undef: "error" */
  it('removeById', function(done) {
    hemera.act(
      {
        topic: 'dynamo-store',
        cmd: 'removeById',
        id: '2',
        collection: testTable
      },
      function(err, resp) {
        expect(err).to.be.not.exists()
        expect(resp.Attributes.city).to.equal('Paris')
        done()
      }
    )
  })
})
