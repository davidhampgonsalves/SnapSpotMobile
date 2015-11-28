'use strict'

import './src/auto-mock-off'

// Polyfill fetch for node
import fetch from 'node-fetch'
window.fetch = fetch

global.__DEV__ = true;
