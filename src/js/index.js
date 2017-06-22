import React from 'react'
import { render } from 'react-dom'
import 'babel-polyfill'
import { createStore, combineReducers, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import thunkMiddleware from 'redux-thunk'
import createLogger from 'redux-logger'
import { Router, Route, browserHistory, IndexRoute, applyRouterMiddleware } from 'react-router'
import useScroll from 'react-router-scroll/lib/useScroll';
import { syncHistoryWithStore, routerReducer } from 'react-router-redux'
import createOidcMiddleware, { createUserManager, OidcProvider, reducer } from 'redux-oidc'
import oidc from 'oidc-client'
import fetch from 'isomorphic-fetch'

import AppContainer from './containers/App.jsx'
import oidcCallback from './containers/oidcCallback.jsx'
import HomeContainer from './containers/Home.jsx'
import InstitutionContainer from './containers/Institutions.jsx'
import SubmissionContainer from './containers/Submission.jsx'
import SubmissionRouter from './containers/SubmissionRouter.jsx'
import UserManager from './utils/UserManager.js'
import { setUserManager } from './utils/redirect.js'

import appReducer from './reducers'

fetch('/env.json').then(res => {
  return res.json()
}).then(envJson => {
  window.HMDA_ENV = {}
  Object.keys(envJson).forEach(key => window.HMDA_ENV[key] = envJson[key])

  const userManager = UserManager()
  setUserManager(userManager)

  const oidcMiddleware = createOidcMiddleware(userManager, () => true, false, '/oidc-callback')
  const loggerMiddleware = createLogger({collapsed: true})
  const middleware = [thunkMiddleware, oidcMiddleware]

  if(process.env.NODE_ENV !== 'production'){
    oidc.Log.logger = console
    middleware.push(loggerMiddleware)
  }

  const store = createStore(
    combineReducers(
      {
        app: appReducer,
        routing: routerReducer,
        oidc: reducer
      }
    ),
    applyMiddleware(...middleware)
  )

  const history = syncHistoryWithStore(browserHistory, store)

  history.listen((location) => {
    if(process.env.NODE_ENV !== 'production'){
      console.log(JSON.parse(localStorage.getItem('hmdaHistory')))
      console.log(`The current URL is ${location.pathname}${location.search}${location.hash}`)
    }
    localStorage.setItem('hmdaHistory', JSON.stringify(location))
  })

  render(
    <Provider store={store}>
      <OidcProvider store={store} userManager={userManager}>
        <Router
          history={history}
          render={applyRouterMiddleware(useScroll())}>
          <Route path="/" component={AppContainer}>
            <IndexRoute component={HomeContainer}/>
            <Route path="/oidc-callback" component={oidcCallback}/>
            <Route path="/institutions" component={InstitutionContainer}/>
            <Route path="/:institution/:filing" component={SubmissionRouter}/>
            <Route path="/:institution/:filing/*" component={SubmissionRouter}/>
          </Route>
        </Router>
      </OidcProvider>
    </Provider>,
    document.getElementById('app')
  );
})
.catch(err => console.error('Error fetching connection information', err))
