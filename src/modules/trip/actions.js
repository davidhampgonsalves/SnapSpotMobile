'use strict'

import uuid from 'uuid'

import reactor from '../../reactor'
import apiActions from '../api/actions'
import queueActions from '../action-queue/actions'
import getters from './getters'

// import {
//   actionTypes.TRIP_STARTING,
//   actionTypes.TRIP_UPDATING,
//   CLEAR_ERRORS,
//   actionTypes.TRIP_CREATE,
//   actionTypes.TRIP_UPDATE,
//   actionTypes.TRIP_DELETE,
//   actionTypes.TRIP_CREATED,
//   actionTypes.TRIP_CREATE_ERRORS,
//   actionTypes.TRIP_UPDATE_ERRORS,
// } from './action-types'
import actionTypes from './action-types'

exports.startTrip = function startTrip(remainingMinutes) {
  const id = uuid.v4()

  reactor.dispatch(actionTypes.TRIP_STARTING, {id: id, remainingMinutes: remainingMinutes})

  const optionArgs = {id: id, remainingMinutes: remainingMinutes}
  const success = function tripCreateSuccess(secret) {
    reactor.dispatch(actionTypes.TRIP_CREATED, {id: id, secret: secret})
  }
  const failure = function tripCreateError(err) {
    reactor.dispatch(actionTypes.TRIP_CREATE_ERRORS, { errors: err })
  }

  queueActions.add('Create Trip', apiActions.createTrip, optionArgs, success, failure)
}

exports.updateTrip = function updateTrip(trip, remainingMinutes) {
  reactor.dispatch(actionTypes.TRIP_UPDATING, {remainingMinutes: remainingMinutes})
  apiActions.updateTrip(trip, remainingMinutes)
}

exports.deleteTrip = function deleteTrip(trip) {
  reactor.dispatch(actionTypes.TRIP_DELETING, {trip: trip})

  const optionArgs = {trip: trip}
  const success = function tripDeleteSuccess(secret) {
    reactor.dispatch(actionTypes.TRIP_DELETED, {trip: trip})
  }

  queueActions.add('Delete Trip', apiActions.deleteTrip, optionArgs, success, undefined, true)
}

exports.newLocation = function newLocation(trip, location) {

  const tripAddLocationAction = function tripAddLocationAction(options, success, failure) {
    const trip = reactor.evaluate(getters.trip)
    const optionArgs = {trip: trip, location: location}
    // TODO: what if trip is not set (delete was called, position comes in late)? 
    // how do I remove the action? set isComplete and then run process? 
    // maybe when delete finishes it could call clear stale which would remove positions added after a delete but before a create
    apiActions.addLocation.apply(undefined, [optionArgs, success, failure]) 
  }

  queueActions.add("Add Location", tripAddLocationAction, {})
}

exports.clearErrors = function clearErrors() {
  reactor.dispatch(actionTypes.CLEAR_ERRORS)
}
