'use strict'

import { Store, toImmutable } from 'nuclear-js'

import getters from '../getters'
import statuses from '../statuses'

import {
  TRIP_STARTING,
  TRIP_UPDATING,
  TRIP_DELETING,
  TRIP_CREATED,
  TRIP_CREATE_ERRORS,
  TRIP_UPDATE_ERRORS,
  CLEAR_ERRORS,
  LOCATION_RECIEVED,
} from '../action-types'
import {
  TRIP_UPDATED,
  TRIP_DELETED,
} from '../../api/action-types'

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
    this.on(TRIP_STARTING, tripStarting)
    this.on(TRIP_CREATED, tripStarted)
    // assume updates will succeed (it will be rolled back on err)
    this.on(TRIP_UPDATING, tripUpdated)
    this.on(TRIP_DELETING, tripEnded)
    this.on(LOCATION_RECIEVED, addLocation)
    this.on(CLEAR_ERRORS, clearErrors)

    this.on(TRIP_CREATE_ERRORS, tripCreateFailed)
    this.on(TRIP_UPDATE_ERRORS, tripUpdateFailed)
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
  state.updateIn(getters.positions, positions => positions.push(location)) 
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
