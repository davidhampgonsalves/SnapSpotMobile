'use strict'

import Action from './action'
import { QUEUE_CHANGE } from './action-types'
import reactor from '../../reactor'

const queue = []

exports.queue = queue

exports.add = function add(description, func, argOptions, success, failure, isCritical) { 
  const actionQueueSuccess = function actionQueueSuccess() {
    reactor.dispatch(QUEUE_CHANGE, queue)
    if(success)
      success.apply(undefined, arguments)
    exports.process() 
  }
  const actionQueueFailure = function actionQueueFailure() {
    if(failure)
      failure.apply(undefined, arguments)
    exports.process() 
  }

  const action = new Action(description, func, argOptions, actionQueueSuccess, actionQueueFailure, isCritical)

  queue.push(action)
  reactor.dispatch(QUEUE_CHANGE, queue)
  exports.process()
}

exports.process = function process() {
  while(queue.length > 0) {
    action = queue[0]

    if(action.isRunning) {
      if(!action.hasExpired())
        break
      action.isComplete = true
    }

    if(action.isComplete || action.attempt >= 2) {
      queue.shift()  
    } else {
      action.run()
      break
    }
  }

  reactor.dispatch(QUEUE_CHANGE, queue)
}

//Removes all actions that aren't critical (trip delete)
exports.clearStale = function clearStale() {
  for(var i=queue.length-1 ; i >= 0 ; i--) {
    var action = queue[i]
    if(!action.isCritical)
      queue.splice(i, 1) 
  }
  reactor.dispatch(QUEUE_CHANGE, queue)
}
