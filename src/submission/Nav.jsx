import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import {
  PARSED_WITH_ERRORS,
  VALIDATING,
  VALIDATED,
  SIGNED
} from '../constants/statusCodes.js'

export default class EditsNav extends Component {
  constructor(props) {
    super(props)
    this.handleScroll = this.handleScroll.bind(this)
    this.state = {
      fixed: false,
      headerHeight: 0,
      editsNavHeight: 0
    }
    this.navMap = {
      upload: {
        isReachable: () => true,
        isErrored: () => this.props.code === PARSED_WITH_ERRORS,
        isCompleted: () => this.props.code > VALIDATING,
        errorClass: 'error',
        errorText: 'uploaded with formatting errors',
        completedText: 'uploaded',
        link: 'upload'
      },
      'syntactical & validity edits': {
        isReachable: () =>
          this.props.editsFetched && this.navMap.upload.isCompleted(),
        isErrored: () => this.props.syntacticalValidityEditsExist,
        isCompleted: () =>
          this.navMap['syntactical & validity edits'].isReachable() &&
          !this.props.syntacticalValidityEditsExist,
        errorClass: 'warning-exclamation',
        errorText: 'syntactical & validity edits found',
        completedText: 'no syntactical & validity edits',
        link: 'syntacticalvalidity'
      },
      'quality edits': {
        isReachable: () =>
          this.navMap['syntactical & validity edits'].isCompleted(),
        isErrored: () => !this.props.qualityVerified,
        isCompleted: () =>
          this.navMap['quality edits'].isReachable() &&
          this.props.qualityVerified,
        errorClass: 'warning-question',
        errorText: 'quality edits found',
        completedText: 'quality edits verified',
        link: 'quality'
      },
      'macro quality edits': {
        isReachable: () => this.navMap['quality edits'].isCompleted(),
        isErrored: () => !this.props.macroVerified,
        isCompleted: () =>
          this.navMap['macro quality edits'].isReachable() &&
          this.props.macroVerified,
        errorClass: 'warning-question',
        errorText: 'macro quality edits found',
        completedText: 'macro quality edits verified',
        link: 'macro'
      },
      submission: {
        isReachable: () => this.props.code >= VALIDATED,
        isErrored: () => false,
        isCompleted: () => this.props.code === SIGNED,
        completedText: 'submitted',
        link: 'submission'
      }
    }
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll)
    const header = document.getElementById('header')
    const userHeading = document.getElementById('userHeading')
    const editsNav = document.getElementById('editsNav')
    if (!header || !userHeading || !editsNav) return
    this.setState({
      headerHeight: header.clientHeight + userHeading.clientHeight,
      editsNavHeight: editsNav.clientHeight
    })
  }

  componentDidUpdate() {
    const currentHeight = document.getElementById('editsNav').clientHeight
    if (this.state.editsNavHeight !== currentHeight) {
      this.setState({
        editsNavHeight: currentHeight
      })
    }
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
  }

  handleScroll() {
    const state = this.state
    if (window.scrollY >= state.headerHeight) {
      if (!state.fixed) this.setState({ fixed: true })
    } else {
      if (state.fixed) this.setState({ fixed: false })
    }
  }

  renderNavItem(name, i) {
    const { page, base, code } = this.props
    const navItem = this.navMap[name]
    let step = i + 1

    if (navItem.isReachable() || code >= VALIDATED) {
      const completed =
        navItem.isCompleted() || (name !== 'submission' && code >= VALIDATED)
      const errored = navItem.isErrored()
      const renderedName = errored
        ? navItem.errorText
        : completed ? navItem.completedText : name

      let navClass = errored
        ? navItem.errorClass
        : completed ? 'complete' : 'active'

      if (navClass !== 'active') step = null
      if (navClass === 'warning-exclamation') step = '!'
      if (navClass === 'warning-question') step = '?'

      if (navItem.link === page) navClass = `${navClass} current`

      return (
        <li className={navClass} key={i}>
          <Link
            className="usa-nav-link"
            to={`${base}/${navItem.link}`}
          >
            <div className="step">{step}</div>
            {renderedName}
          </Link>
        </li>
      )
    } else {
      return (
        <li key={i}>
          <div className="step">{step}</div>
          {name}
        </li>
      )
    }
  }

  render() {
    const wrapperHeight = { height: `${this.state.editsNavHeight}px` }
    const fixed = this.state.fixed ? 'EditsNav-fixed' : ''
    return (
      <section style={wrapperHeight}>
        <nav className={`EditsNav ${fixed}`} id="editsNav">
          <ul className="usa-nav-primary">
            {Object.keys(this.navMap).map((name, i) => {
              return this.renderNavItem(name, i)
            })}
          </ul>
          <hr className="nav-bg" />
        </nav>
      </section>
    )
  }
}

EditsNav.propTypes = {
  page: PropTypes.string.isRequired,
  base: PropTypes.string.isRequired,
  code: PropTypes.number.isRequired,
  syntacticalValidityEditsExist: PropTypes.bool.isRequired,
  qualityVerified: PropTypes.bool.isRequired,
  macroVerified: PropTypes.bool.isRequired,
  editsFetched: PropTypes.bool.isRequired
}
