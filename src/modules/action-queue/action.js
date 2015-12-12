'use strict'

import uuid from 'uuid'
import keyMirror from 'keyMirror'
import reactor from '../../reactor'
import { QUEUE_CHANGE } from './action-types'


function Action(description, func, argOptions, success, failure, isCritical) {
  if(!success)
    throw "undefined success was passed to action"

  this.id = uuid.v4()
  this.when = new Date()
  this.attempt = 0
  this.func = func
  this.description = description
  this.argOptions = argOptions
  this.isCritical = isCritical || false
  this.success = success
  this.failure = failure || function() {}
  this.isComplete = false
  this.isRunning = false
}

Action.prototype.run = function run() {
  // es6 fat arrow => doesn't provide arguments
  this.attempt += 1
  this.isRunning = true
  const self = this
  this.func(this.argOptions, function actionSuccess() {
    self.isRunning = false
    self.isComplete = true
    self.success.apply(undefined, arguments)
  }, function actionFailure() {
    self.isRunning = false
    self.failure.apply(undefined, arguments)
  })
}

Action.prototype.hasExpired = function hasExpired() {
  const age = new Date() - this.when
  return age > 30 * 1000
}

export default Action 
