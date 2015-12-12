'use strict'

//imports causes action events to fire before listeners have been bound
const reactor = require('../../../reactor')
const trip = require('..')
const api = require('../../api')
const actionQueue = require('../../action-queue')

describe('trip > crud', function() {
  var newTrip

  it('create', function(done) {
   reactor.observe(trip.getters.trip, (state) => {
     const t = state.toJS().trip
     if(t.status === trip.statuses.started) {
        expect(t.id).toExist
        newTrip = t
        done()
      }
    })

    trip.actions.startTrip(30)
  })

  it('update', function(done) {
    //this doesn't check that the update happened just that the store was updated which happens right away 
    reactor.observe(trip.getters.trip, (state) => {
      const t = state.toJS().trip
      expect(t.remainingMinutes).toBe(10)
      done()
    })

    trip.actions.updateTrip(newTrip, 10)
  })

  it('delete', function(done) {
    reactor.observe(trip.getters.trip, (state) => {
      const t = state.toJS().trip
      expect(t.id).toNotExist
      done()
    })

    trip.actions.updateTrip(newTrip, 10)
  })
})

describe('trip > validation', function() {
  beforeEach(function() {
    reactor.reset()
  })

  it('with valid parameters', function(done) {
   reactor.observe(trip.getters.trip, (state) => {
     const t = state.toJS().trip
     if(t.status === trip.statuses.started) {
        expect(t.id).toExist
        done()
      }
    })

    trip.actions.startTrip(30)
  })

  it('with negitive duration', function(done) {
    reactor.observe(trip.getters.trip, (state) => {
      const t = state.toJS().trip

      //ignore trip status changes
      if(t.tripErrors.length === 0)
        return

      expect(t.tripErrors.length).toBe(1);
      done()
    })

    trip.actions.startTrip(-1)
  })

  it('clear errors', function(done) {
    reactor.dispatch(trip.actionTypes.TRIP_CREATE_ERRORS, { errors: ['this is a test error'] })

    reactor.observe(trip.getters.trip, (state) => {
      const t = state.toJS().trip
      expect(t.tripErrors.length).toBe(0);
      done()
    })

    trip.actions.clearErrors() 
  })
})



describe('trip > location', function() {
  var newTrip

  it('create trip', function(done) {
   reactor.observe(trip.getters.trip, (state) => {
     const t = state.toJS().trip
     if(t.status === trip.statuses.started) {
        expect(t.id).toExist
        newTrip = t
        done()
      } 
    })

    trip.actions.startTrip(30)
  })

  it('new location', function(done) {
    const location = {coords: {latitude: 23, longitude: 12}}

    reactor.observe(actionQueue.getters.queue, (state) => {
      var curLength = state.toJS().actionQueue.length
      if(curLength === 0) {
        expect(curLength).toBe(0)
        done()
      }
    })
    trip.actions.newLocation(newTrip, location)
  })
})
