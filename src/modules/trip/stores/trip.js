'use strict'

import { Store, toImmutable } from 'nuclear-js'

import getters from '../getters'
import statuses from '../statuses'
import actionTypes from '../action-types'

const initialState = toImmutable({
  trip: {
    status: statuses.stopped, 
    positions: [],
    tripErrors: [],
  }
})

export default Store({
  getInitialState() {
    return initialState
  },

  initialize() {
    this.on(actionTypes.TRIP_STARTING, tripStarting)
    this.on(actionTypes.TRIP_CREATED, tripStarted)
    // assume updates will succeed (it will be rolled back on err)
    this.on(actionTypes.TRIP_UPDATING, tripUpdated)
    this.on(actionTypes.TRIP_DELETING, tripEnded)
    this.on(actionTypes.LOCATION_RECIEVED, addLocation)
    this.on(actionTypes.CLEAR_ERRORS, clearErrors)

    this.on(actionTypes.TRIP_CREATE_ERRORS, tripCreateFailed)
    this.on(actionTypes.TRIP_UPDATE_ERRORS, tripUpdateFailed)
  }
})

function tripStarting(state, { id }) {
  return state.mergeIn(getters.trip, {
    id: id,
    status: statuses.starting,
  })
}

function tripStarted(state, trip) {
  return state.mergeIn(getters.trip, {
    secret: trip.secret,
    status: statuses.started,
  })
}

function tripUpdated(state, { remainingMinutes }) {
  return state.setIn(getters.remainingMinutes, remainingMinutes)
}

function tripEnded(state, trip) {
  return initialState
}

function addLocation(state, location) {
  return state.updateIn(getters.positions, positions => positions.push(location)) 
}

function tripCreateFailed(state, { errors }) {
  state = state.setIn(getters.status, statuses.ended) 
  return state.mergeIn(getters.tripErrors, errors) 
}

function tripUpdateFailed(state, { originalTrip, errors }) {
  state = state.setIn(getters.remainingTime, originalTrip.remainingTime) 
  return state.mergeIn(getters.tripErrors, errors) 
}

function clearErrors(state) {
  return initialState
}
