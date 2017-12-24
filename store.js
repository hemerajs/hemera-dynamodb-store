'use strict'

const Store = require('hemera-store')

/**
 *
 *
 * @class DynamoStore
 * @extends {Store}
 */
class DynamoStore extends Store {
  /**
   * Creates an instance of DynamoStore.
   *
   * @param {any} driver
   * @param {any} options
   *
   * @memberOf DynamoStore
   */
  constructor(driver, options = {}) {
    options.dynamo = {}
    super(driver, options)
  }

  /**
   *
   *
   * @param {any} req
   * @param {any} cb
   *
   * @memberOf DynamoStore
   */
  create(req, cb) {
    const params = {
      TableName: req.collection,
      Item: req.data
    }
    this._driver.put(params, function (err, data) {
      if (err) return err
      cb(null, params.Item)
    })
  }

  /**
   *
   *
   * @param {any} req
   * @param {any} cb
   *
   * @memberOf DynamoStore
   */
  removeById(req, cb) {
    const params = {
      TableName: req.collection,
      Key: {
        'id': req.id
      },
      ReturnValues: 'ALL_OLD'
    }
    this._driver.delete(params, function (err, data) {
      if (err) return err
      cb(null, data)
    })
  }

  /**
   *
   *
   * @param {any} req
   * @param {any} cb
   *
   * @memberOf DynamoStore
   */
  updateById(req, cb) {
    let params = {
      TableName: req.collection,
      Key: {
        'id': req.id
      },
      ReturnValues: 'ALL_NEW'
    } 
    if(req.options) {
     params = Object.assign(params, req.options)
    }
 
    this._driver.update(params, function (err, data) {
      if (err) return err
      cb(null, data)
    })
  }

  /**
   *
   *
   * @param {any} req
   * @param {any} cb
   *
   * @memberOf DynamoStore
   */
  findById(req, cb) {
    let params = {
      TableName: req.collection,
      Key: {
        'id': req.id
      }
    }
    if(req.options) {
     params = Object.assign(params, req.options)
    }
    this._driver.get(params, function (err, data) {
      if (err) cb(err)
      cb(null, data.Item)
    })
  }

  /**
   *
   *
   * @param {any} req
   * @param {any} cb
   *
   * @memberOf DynamoStore
   */

  query(req, cb) {
    let params = {
      TableName: req.collection
    }
    if(req.options) {
     params = Object.assign(params, req.options)
    }
    this._driver.query(params, function (err, data) {
      if (err) return err
      cb(null, data)
    })
  }

  /**
   *
   *
   * @param {any} req
   * @param {any} cb
   *
   * @memberOf DynamoStore
   */

  scan(req, cb) {
    let params = {
      TableName: req.collection
    }
    if(req.options) {
     params = Object.assign(params, req.options)
    }
    this._driver.scan(params, function (err, data) {
      if (err) return err
      cb(null, data)
    })
  }
}

module.exports = DynamoStore
