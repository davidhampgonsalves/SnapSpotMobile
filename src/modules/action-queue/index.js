'use strict'

import reactor from '../../reactor'
import actions from './actions'
import getters from './getters'
import Action from './action'
import store from './stores/action-queue'


reactor.registerStores({
  'actionQueue': store
})

export default { actions, getters, Action }
