'use strict'

import Action from './action'
import { QUEUE_CHANGE } from './action-types'
import reactor from '../../reactor'

const queue = []

exports.add = function add(description, func, argOptions, success, failure) { 
  const actionQueueSuccess = function actionQueueWuccess() {

    console.log('dispatch', QUEUE_CHANGE)
    reactor.dispatch(QUEUE_CHANGE, queue)
    if(success)
      success.apply(undefined, arguments)
  }
  const action = new Action(description, func, argOptions, actionQueueSuccess, failure)

  queue.push(action)
  console.log('dispatch', QUEUE_CHANGE)
  reactor.dispatch(QUEUE_CHANGE, queue)
  exports.process()
}

exports.process = function process() {
  if(queue.length === 0)
    return

  var action = queue[0]
  while(action.complete || action.attemt >= 2) {
    queue.shift()
    action = queue[0]
  }
  
  reactor.dispatch(QUEUE_CHANGE, queue)
  action.run()
}

//Removes all actions that aren't trip deletes
exports.clearStale = function clearStale() {
  for(var i=queue.length-1 ; i >= 0 ; i--) {
    var action = queue[i]
    if(!action.isCritical)
      queue.splice(i, 1) 
  }
  reactor.dispatch(QUEUE_CHANGE, queue)
}
