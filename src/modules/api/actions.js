'use strict'

const reactor = require('../../reactor')
import actionTypes from './action-types'
const deviceActionTypes = require('../device/action-types')
import trip from '../trip/index'

var API_HOST = 'http://192.241.229.86:9000'

exports.createTrip = function createTrip({id, remainingMinutes}, success, failure) {
  var url = API_HOST + "/v1/trips/" + id
  var params = {
    "remaining-minutes": remainingMinutes,
  }

  fetch(url, {
    method: "POST", 
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  })
  .then((resp) => resp.json())
  .then((resp) => {
    if(resp && !resp.hasOwnProperty("errors")) {
      success(resp.secret)
      return
    }

    console.warn('create-trip', url, resp)
    failure(resp.warns)
  })
  .catch((error) => {
    console.warn('create-trip', url, error)
    //TODO: need to pass back error types so can support api error and network error
    reactor.dispatch(deviceActionTypes.NETWORK_ERROR, {errors: error})
    failure(error)
  })
}

exports.updateTrip = function updateTrip(trip, remainingMinutes) {
  var url = API_HOST + "/v1/trips/" + trip.id
  var params = {
    id: trip.id,
    secret: trip.secret,
    "remaining-minutes": remainingMinutes,
  }

  fetch(url, {
    method: "PUT", 
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  })
  .then((resp) => resp.json())
  .then((resp) => {
    if(resp.hasOwnProperty("errors")) {
      console.warn('update-trip', url, resp)
      reactor.dispatch(actionTypes.TRIP_UPDATE_ERRORS, { originalTrip: trip, errors: resp.warns })
      return
    }

    reactor.dispatch(actionTypes.TRIP_UPDATED, {remainingMinutes: remainingMinutes})
  })
  .catch((error) => {
    console.warn('update-trip', url, error)
    reactor.dispatch(deviceActionTypes.NETWORK_ERROR, {errors: errors})
  })
}

exports.deleteTrip = function deleteTrip({trip}, success, failure) {
  var url = API_HOST + "/v1/trips/" + trip.id
  var params = {
    id: trip.id,
    secret: trip.secret,
  }

  fetch(url, {
    method: "DELETE", 
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  })
  .then((resp) => resp.json())
  .then((resp) => {
    if(resp && !resp.hasOwnProperty("errors")) {
      success(trip)
      return
    }

    console.warn('delete-trip: ', url, resp)
    failure(resp.warns)
  })
  .catch((error) => {
    console.warn('delete-trip: ', url, error)
    reactor.dispatch(deviceActionTypes.NETWORK_ERROR, {errors: errors})
  })
}

exports.addLocation = function addLocation({trip, location}, success, failure) {
  const url = API_HOST + "/v1/trips/" + trip.id + "/positions"
  const params = {
    secret: trip.secret,
    lat: location.coords.latitude,
    lon: location.coords.longitude,
  }

  fetch(url, {
    method: "POST", 
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params)
  })
  .then((resp) => resp.json())
  .then((resp) => {
    if(resp && !resp.hasOwnProperty("errors")) {
      success()
      return
    }

    failure(resp.warns)
  })
  .catch((error) => {
    console.warn('add-location', url, error)
    reactor.dispatch(deviceActionTypes.NETWORK_ERROR, resp.warns)
  })
}
