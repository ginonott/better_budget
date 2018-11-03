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
  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.props.checkAuth();
      }
    });
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
