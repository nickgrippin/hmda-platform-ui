jest.unmock('../../src/js/actions/fetchEachEdit.js')
jest.unmock('../../src/js/constants')
import * as types from '../../src/js/constants'
import fetchEachEdit from '../../src/js/actions/fetchEachEdit.js'

import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import postVerify from '../../src/js/api/api'

postVerify.mockImplementation(() => Promise.resolve({status: {code: 8, message: 'postverify'}}))
const mockStore = configureMockStore([thunk])

describe('fetchEachEdit', () => {
  it('checks for http errors', () => {
    expect(fetchEachEdit()).toBe(true)
    expect(fetchEachEdit({httpStatus: 401})).toBe(true)
    expect(fetchEachEdit({})).toBe(false)
    expect(fetchEachEdit({httpStatus: 200})).toBe(false)
  })
})
