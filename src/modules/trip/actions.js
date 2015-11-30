'use strict'

var uuid = require('uuid')

const reactor = require('../../reactor')
const apiActions = require('../api/actions')

import {
  TRIP_STARTING,
  TRIP_UPDATING,
  CLEAR_ERRORS,
} from './action-types'

exports.startTrip = function startTrip(remainingMinutes) {
  const id = uuid.v4()

  reactor.dispatch(TRIP_STARTING, {id: id, remainingMinutes: remainingMinutes}) 
  apiActions.createTrip(id, remainingMinutes)
}

exports.updateTrip = function updateTrip(trip, remainingMinutes) {
  reactor.dispatch(TRIP_UPDATING, {remainingMinutes: remainingMinutes}) 
  apiActions.updateTrip(trip, remainingMinutes)
}

exports.deleteTrip = function deleteTrip(trip) {
  reactor.dispatch(TRIP_DELETING, {trip: trip})
  apiActions.deleteTrip(trip)  
}

exports.newLocation = function newLocation(location) {
  const trip = reactor.evaluateToJS(tripGetters.currentTrip)
}

exports.clearErrors = function clearErrors() {
  reactor.dispatch(CLEAR_ERRORS)
}
