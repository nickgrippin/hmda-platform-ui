import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import LoadingIcon from './LoadingIcon.jsx'
import ErrorWarning from './ErrorWarning.jsx'
import RefileButton from '../containers/RefileButton.jsx'
import { ordinal } from '../utils/date.js'
import Alert from './Alert.jsx'
import * as STATUS from '../constants/statusCodes.js'
import 'uswds'

const defaultSubmission = {
  status: {
    code: STATUS.CREATED,
    message: 'not started',
    description: 'You may begin your filing process by selecting the "Begin Filing" button below.'
  }
}
export const renderStatus = (
  institutionId,
  filing,
  submission = defaultSubmission,
  onDownloadClick
) => {
  const statusCode = submission.status.code
  const period = filing.period
  const filingStatus = filing.status.code
  let messageClass

  if (statusCode === STATUS.CREATED) {
    messageClass = 'text-secondary'
  }

  if (statusCode > STATUS.CREATED) {
    messageClass = 'text-primary'
  }

  if (
    statusCode === STATUS.PARSED_WITH_ERRORS ||
    statusCode === STATUS.VALIDATED_WITH_ERRORS
  ) {
    messageClass = 'text-secondary'
  }

  if (statusCode === STATUS.SIGNED) {
    messageClass = 'text-green'
  }

  // failed submission
  if (statusCode === STATUS.FAILED) {
    messageClass = 'text-secondary'
  }

  return (
    <section className="status">
      <p className="status-desc">
        Current filing status is{' '}
        <strong className={messageClass}>{submission.status.message}</strong>.{' '}
        {submission.status.description}
      </p>
      {
        filingStatus === 3 && statusCode !== STATUS.SIGNED
        ? <p className="usa-text-small">You have previously submitted a HMDA file and are in the process of refiling. If you do not complete your current refiling process, your original submission will be accepted for the current filing period.</p>
        : null
      }
      {statusCode > STATUS.CREATED
        ? <p className="usa-text-small">
            <a
              href="#"
              onClick={e => {
                e.preventDefault()
                onDownloadClick(institutionId, period, submission.id.sequenceNumber)
              }}
            >
              Download edit report
            </a>
          </p>
        : null}
    </section>
  )
}

export const renderViewButton = (status, institutionId, period) => {

  const code = status ? status.code : STATUS.CREATED
  let buttonText = 'View current filing'

  if(code === STATUS.CREATED){
    buttonText = 'Begin filing'
  }else if(code === STATUS.SIGNED){
    buttonText = 'View completed filing'
  }

  return (
    <Link
      className="status-button usa-button"
      to={`/${institutionId}/${period}`}
    >
      {buttonText}
    </Link>
  )
}

export const renderRefileButton = (status, filing) => {
  if (!status) return null
  if (
    status.code === STATUS.PARSED_WITH_ERRORS ||
    status.code > STATUS.VALIDATING
  ) {
    return (
      <RefileButton
        id={filing.institutionId}
        filing={filing.period}
        code={status.code}
        isLink={true}
        isSmall={true}
      />
    )
  } else {
    return null
  }
}

export const renderPreviousSubmissions = (
  submissions,
  onDownloadClick,
  institutionId,
  period
) => {
  if (!submissions.length) return
  const previousSubmissions = submissions.slice(1)
  if (!previousSubmissions.length) return
  return (
    <section className="previous-submissions">
      <ul className="usa-accordion-bordered">
        <li>
          <button
            className="usa-accordion-button"
            aria-expanded="false"
            aria-controls={`submissions-${institutionId}`}
          >
            Previous filings for current filing period
          </button>
          <div id={`submissions-${institutionId}`} className="usa-accordion-content">
            <ol reversed className="usa-text-small">
              {previousSubmissions.map((submission, i) => {
                // render the end date if it was signed
                const date = (submission.status.code === STATUS.SIGNED)
                  ? ordinal(new Date(submission.end))
                  : ordinal(new Date(submission.start))

                // render a link if validted with errors
                if (submission.status.code === STATUS.VALIDATED_WITH_ERRORS) {
                  return (
                    <li className="edit-report" key={i}>
                      <strong>{submission.status.message}</strong> on {date}.{'\u00a0'}
                      <a
                        href="#"
                        onClick={e => {
                          e.preventDefault()
                          onDownloadClick(
                            institutionId,
                            period,
                            submission.id.sequenceNumber
                          )
                        }}
                      >
                        Download edit report
                      </a>
                    </li>
                  )
                }

                // other statuses contain no edits
                return (
                  <li className="edit-report" key={i}>
                    <strong>{submission.status.message}</strong> on {date}.
                  </li>
                )
              })}
            </ol>
          </div>
        </li>
      </ul>
    </section>
  )
}

export const getInstitutionFromFiling = (institutions, filing) => {
  for (let i = 0; i < institutions.length; i++) {
    if (institutions[i].id === filing.institutionId) return institutions[i]
  }
  return null
}

export default class Institution extends Component {
  render() {
    const institutions = this.props.institutions
    const makeNewSubmission = this.props.makeNewSubmission

    return (
      <main id="main-content" className="usa-grid Institutions">
        {this.props.error ? <ErrorWarning error={this.props.error} /> : null}
        <div className="usa-width-one-half">
          <header className="InstitutionsHeader">
            <h1>Institutions</h1>
            {this.props.filingPeriod
              ? <h2>Filing Period {this.props.filingPeriod}</h2>
              : null}
          </header>
          {this.props.filings.isFetching || this.props.submission.isFetching
            ? <div className="usa-grid-full">
                <LoadingIcon />
              </div>
            : this.props.filings.fetched && this.props.filings.filings.length === 0
              ? <div className="usa-grid-full">
                <Alert type="error">
                  <p>
                    There is a problem with your filing. Please contact <a href="mailto:hmdahelp@cfpb.gov">HMDA Help</a>.
                  </p>
                </Alert>
                </div>
              : this.props.filings.filings.map((filingObj, i) => {
                  const filing = filingObj.filing
                  const submission = this.props.submission.id &&
                    this.props.submission.id.institutionId === filing.institutionId
                    ? this.props.submission
                    : filingObj.submissions[0]
                  const status = submission && submission.status
                  const institution = getInstitutionFromFiling(
                    institutions,
                    filing
                  )

                  if (!institution) return
                  return (
                    <div key={i} className="usa-grid-full">
                      <section className="institution">
                        <div className="current-status">
                          <h3>{institution.name} - {institution.id}</h3>
                          {renderStatus(
                            institution.id,
                            filing,
                            submission,
                            this.props.onDownloadClick
                          )}

                          {renderViewButton(
                            status,
                            filing.institutionId,
                            filing.period
                          )}

                          {renderRefileButton(status, filing)}
                        </div>

                        {renderPreviousSubmissions(
                          filingObj.submissions,
                          this.props.onDownloadClick,
                          institution.id,
                          filing.period
                        )}
                      </section>
                    </div>
                  )
                })}

          <Alert type="info">
            <p>If you are planning to file on behalf of more than one financial institution, contact <a href="mailto:hmdahelp@cfpb.gov">hmdahelp@cfpb.gov</a>.</p>
          </Alert>
        </div>
        <aside className="usa-width-one-half">
          <p>
            The Institutions page provides a summary of institutions for which
            you are authorized to file HMDA data. The filing status is displayed
            under the institution name.
          </p>
          <p>
            Select the &quot;Begin filing&quot; button to begin your HMDA
            filing. Your work will be saved as you progress through the various
            edit categories. If you need to complete the filing at a later time,
            logout of the HMDA Platform prior to reviewing the next category of
            edits. When you are ready to continue with the filing process, login
            and select the &quot;View Current Filing&quot; button for your
            institution.
          </p>
          <p>
            If you already started or submitted a HMDA filing and need to upload
            a new HMDA file, select the &quot;Upload a new file&quot; button.
            You will restart the process beginning with file format analysis.
            Any previously completed filings will not be overridden until all
            edits have been cleared and/or verified and the HMDA file has been
            submitted.
          </p>
          <p>
            The edit report for previous submissions can be downloaded in csv
            format. Please note that an edit report will not be available if the
            HMDA file did not have any outstanding quality edits or macro
            quality edits.
          </p>
        </aside>
      </main>
    )
  }
}

Institution.propTypes = {
  params: PropTypes.object,
  filings: PropTypes.object,
  institutions: PropTypes.array,
  makeNewSubmission: PropTypes.func,
  onDownloadClick: PropTypes.func
}
