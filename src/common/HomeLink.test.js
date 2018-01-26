jest.unmock('./HomeLink.jsx')

import HomeLink from './HomeLink.jsx'
import Wrapper from '../../test-resources/Wrapper.js'
import React from 'react'
import ReactDOM from 'react-dom'
import TestUtils from 'react-dom/test-utils'

describe('HomeLink', () => {
  const homeLink = TestUtils.renderIntoDocument(
    <Wrapper>
      <HomeLink />
    </Wrapper>
  )
  const linkNode = ReactDOM.findDOMNode(homeLink)

  it('renders the link into the document', () => {
    expect(linkNode).toBeDefined()
  })

  it('renders the link into the document', () => {
    expect(linkNode.textContent).toEqual('Home')
  })
})