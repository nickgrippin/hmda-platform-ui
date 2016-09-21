import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { fetchSummary } from '../actions'
import Summary from '../components/Summary.jsx'

class SummaryContainer extends Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.props.dispatch(fetchSummary())
  }

  render() {
    return <Summary {...this.props} />
  }
}

function mapStateToProps(state) {
  const {
    isFetching,
    respondent,
    file
  } = state.app.summary || {
    isFetching: true,
    respondent: {},
    file: {}
  }

  return {
    isFetching,
    respondent,
    file
  }
}

export default connect(mapStateToProps)(SummaryContainer)
