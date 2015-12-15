'use strict'

//imports causes action events to fire before listeners have been bound
const actionQueue = require('..')
const reactor = require('../../../reactor')

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


  it('queue is synchronous', function(done) {
    reactor.observe(actionQueue.getters.queue, (state) => {
      const queue = actionQueue.actions.queue

      expect(queue[0].isRunning).toBe(true)
      expect(queue[1].isRunning).toBe(false)
      expect(queue[2].isRunning).toBe(false)
      done()
    })

    actionQueue.actions.add('test action', neverFinishingAction, {}, undefined, undefined) 
  })

  it('expired actions are killed', function(done) {
    reactor.observe(actionQueue.getters.queue, (state) => {
      const queueLength = state.get('actionQueue').length
      expect(queueLength).toBe(1)
      done()
    })

    const queue = actionQueue.actions.queue
    queue[0].wasRunAt = 0
    actionQueue.actions.process()
  })
})
