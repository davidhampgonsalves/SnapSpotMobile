'use strict'

import reactor from '../../reactor'
import actions from './actions'
import actionTypes from './action-types'
import getters from './getters'
import statuses from './statuses'
import store from './stores/trip'

reactor.registerStores({
  'trip': store
})

export default { actions, getters, actionTypes, statuses }
