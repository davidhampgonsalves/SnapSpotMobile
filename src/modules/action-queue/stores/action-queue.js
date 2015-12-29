'use strict'

import { Store, toImmutable } from 'nuclear-js'
import actionTypes from '../action-types'
import getters from '../getters'


const initialState = toImmutable({
  actionQueue: []
})

export default Store({
  getInitialState() {
    return initialState
  },

  initialize() {
    this.on(actionTypes.QUEUE_CHANGE, queueChange)
  }
})

function queueChange(state, queue) {
  const descriptions = queue.filter((action) => !action.complete).map((action) => action.description)
  return state.setIn(getters.queue, toImmutable(descriptions))
}
