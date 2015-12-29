'use strict'

import uuid from 'uuid'
import keyMirror from 'keyMirror'
import reactor from '../../reactor'


function Action(description, func, argOptions, success, failure, isCritical) {
  if(!success)
    throw "success callback must be passed to action"

  this.id = uuid.v4()
  this.attempt = 0
  this.func = func
  this.description = description
  this.argOptions = argOptions
  this.isCritical = isCritical || false
  this.success = success
  this.failure = failure || function() {}
  this.isComplete = false
  this.isRunning = false
  this.wasRunAt = null
}

Action.prototype.run = function run() {
  // es6 fat arrow => doesn't provide arguments
  this.attempt += 1
  this.isRunning = true
  this.wasRunAt = new Date()
  const self = this
  this.func(this.argOptions, function actionSuccess() {
    self.isRunning = false
    self.wasRunAt = null
    self.isComplete = true
    self.success.apply(undefined, arguments)
  }, function actionFailure() {
    self.isRunning = false
    self.wasRunAt = null
    self.failure.apply(undefined, arguments)
  })
}

Action.prototype.hasExpired = function hasExpired() {
  if(!this.isRunning)
    return

  const runDurration = new Date() - this.wasRunAt
  return runDurration > 30 * 1000
}

export default Action 
