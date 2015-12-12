'use strict'

//imports causes action events to fire before listeners have been bound
const actionQueue = require('..')
const reactor = require('../../../reactor')

// test
// add actions verify they are processed
// add actions and a delete action, then clear the queue and check for the delete action
const neverFinishingAction = (options, success, failure) => {}

describe('action queue > actions', function() {

  beforeEach(function() {
    reactor.reset()

    actionQueue.actions.add('test action', neverFinishingAction, {}) 
    actionQueue.actions.add('test critical action', neverFinishingAction, {}, undefined, undefined, true) 
  })

  it('add', function(done) {
    reactor.observe(actionQueue.getters.queue, (state) => {
      const queueLength = state.get('actionQueue').length
      if(queueLength === 3)  {
        expect(queueLength).toBe(3);
        done()
      }
    })

    actionQueue.actions.add('test critical action', neverFinishingAction, {}, undefined, undefined, true) 
  })

  it('clear stale (all non-critical actions)', function(done) {
    reactor.observe(actionQueue.getters.queue, (state) => {
      const queueLength = state.get('actionQueue').length
      if(queueLength === 1)  {
        expect(queueLength).toBe(1);
        done()
      }
    })

    actionQueue.actions.clearStale()
  })
})
