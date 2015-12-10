'use strict'

import uuid from 'uuid'
import keyMirror from 'keyMirror'
import reactor from '../../reactor'
import { QUEUE_CHANGE } from './action-types'


function Action(description, func, argOptions, success, failure) {
  if(!success)
    throw "undefined success was passed to action"

  this.id = uuid.v4()
  this.when = new Date()
  this.attempt = 0
  this.func = func
  this.description = description
  this.argOptions = argOptions
  this.success = success
  this.failure = failure || function() {}
  this.complete = false
}

Action.prototype.run = function run() {
  // es6 fat arrow => doesn't provide arguments
  this.attempt += 1
  const self = this
  this.func(this.argOptions, function actionSuccess() {
    self.complete = true
    self.success.apply(undefined, arguments)
  }, this.failure)
}

export default Action 
