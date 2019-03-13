import React, { Component } from 'react';
import './App.css';
import budgetReducer from './reducers/app.reducer';
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import {Provider, connect} from 'react-redux';
import TransactionView from './components/TransactionView';
import AddTransaction from './components/AddTransaction';
import NavbarMenu from './components/NavbarMenu';
import AlertCenter from './components/AlertCenter';
import Login from './components/Login';
import {checkAuth} from './reducers/auth.action';
import firebase from 'firebase';
import BudgetView from './components/BudgetView';
import BulkImport from './components/BulkImport';
import _ from 'lodash';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  budgetReducer,
  composeEnhancers(
    applyMiddleware(thunk)
  )
);

class LoggedInApp extends Component {
  render() {
    return (
      <React.Fragment>
        <NavbarMenu/>
        <AddTransaction/>
        <BulkImport/>
        <BudgetView/>
        <TransactionView/>
      </React.Fragment>
    )
  }
}

class LoggedOutApp extends Component {
  render() {
    return (
      <React.Fragment>
        <Login/>
      </React.Fragment>
    )
  }
}

class Auth extends Component {
  /**
   * @param {number} point - between 0 to 1
   */
  interperolate = (fromRGB, toRGB, point) => {
    const {r: fromR, g: fromG, b: fromB} = fromRGB;
    const {r: toR, g: toG, b: toB} = toRGB;
    const deltaR = (toR - fromR) * point;
    const deltaG = (toG - fromG) * point;
    const deltaB = (toB - fromB) * point;

    return {r: fromR + deltaR, g: fromG + deltaG, b: fromB + deltaB};
  }
  componentDidMount() {
    document.body.style.backgroundColor = `rgb(240, 255, 240)`;

    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.props.checkAuth();
      }
    });

    let ticking = false;
    window.addEventListener('scroll', _.throttle(() => {
      let lastKnownScroll = window.scrollY;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          const maxHeight = document.body.scrollHeight;
          const percentThrough = lastKnownScroll / maxHeight;
          // rgb(181,255,181)
          const rgb = this.interperolate({
            r: 240,
            g: 255,
            b: 240
          }, {
            r: 181,
            g: 255,
            b: 181
          }, percentThrough);
          document.body.style.backgroundColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
          ticking = false;
        });

        ticking = true;
      }
    }, 50));
  }

  render() {
    return (
      this.props.user.loggedIn ? <LoggedInApp/> : <LoggedOutApp/>
    );
  }
}

const AuthConnected = connect(state => ({
  user: state.user
}), {
  checkAuth
})(Auth);

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <div className="App">
          <AlertCenter/>
          <AuthConnected/>
        </div>
      </Provider>
    );
  }
}

export default App;
