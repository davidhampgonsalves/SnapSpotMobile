'use strict'

import { Store, toImmutable } from 'nuclear-js'
import { QUEUE_CHANGE } from '../action-types'
import getters from '../getters'


const initialState = toImmutable({
  actionQueue: []
})

export default Store({
  getInitialState() {
    return initialState
  },

  initialize() {
    this.on(QUEUE_CHANGE, queueChange)
  }
})

function queueChange(state, queue) {
  return state.setIn(getters.queue, queue.filter((action) => !action.complete).map((action) => action.description))
}
