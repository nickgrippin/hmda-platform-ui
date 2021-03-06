import { fetch } from './fetch.js'

export function getInstitutions() {
  return fetch({ pathname: '/institutions' })
}

export function getInstitution(id) {
  return fetch({ pathname: `/institutions/${id}` })
}

export function createSubmission(id, filing) {
  return fetch({
    pathname: `/institutions/${id}/filings/${filing}/submissions`,
    method: 'POST'
  })
}

export function getFiling(id, filing) {
  return fetch({ pathname: `/institutions/${id}/filings/${filing}` })
}

export function getLatestSubmission() {
  return fetch({ submission: 'latest' })
}

export function getEdits() {
  return fetch({ suffix: '/edits' })
}

export function getEdit(pathObj) {
  return fetch({ suffix: `/edits/${pathObj.edit}` })
}

export function getCSV(pathObj) {
  pathObj.suffix = pathObj.suffix ? pathObj.suffix : '/edits/csv'
  pathObj.params = { format: 'csv' }
  return fetch(pathObj)
}

export function getIRSCSV(pathObj) {
  pathObj.suffix = pathObj.suffix ? pathObj.suffix : '/irs/csv'
  pathObj.params = { format: 'csv' }
  return fetch(pathObj)
}

export function postVerify(type, verified) {
  return fetch({
    suffix: `/edits/${type}`,
    method: 'POST',
    body: { verified: verified }
  })
}

export function getIRS() {
  return fetch({ suffix: '/irs' })
}

export function getSummary() {
  return fetch({ suffix: '/summary' })
}

export function getSignature() {
  return fetch({ suffix: '/sign' })
}

export function getParseErrors() {
  return fetch({ suffix: '/parseErrors' })
}

export function postUpload(body) {
  return fetch({
    method: 'POST',
    body: body
  })
}

export function postSignature(signed) {
  return fetch({
    suffix: '/sign',
    method: 'POST',
    body: { signed: signed }
  })
}
