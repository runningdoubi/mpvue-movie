import * as types from './mutation-types'

export default {
  [types.SET_CURRENT_MOVIE] (state, currentMovie) {
    state.currentMovie = currentMovie
  }
}
