import { REQUEST_FILING,RECEIVE_FILING,CLEAR_FILINGS,RECEIVE_FILINGS } from '../constants'

const defaultFilings = {
  filings: [],
  isFetching: false,
}

/*
 * Populate a list with data on every filing period for each institution
 * When an filing data for an institution is received, it is added to the list
 * When clear filings is dispatched, empty the list
 */
export default (state = defaultFilings, action) => {
  switch (action.type) {
  case REQUEST_FILING:
    return {
      ...state,
      isFetching: true
    }
  case RECEIVE_FILING:
    return {
      ...state,
      filings: [...state.filings, action.filing]
    }
  case CLEAR_FILINGS:
    return defaultFilings
  case RECEIVE_FILINGS:
      return {
        ...state,
        isFetching: false
      }
  default:
    return state
  }
}