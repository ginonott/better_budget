import { asyncAction } from "./async.action";
import STATUSES from '../constants/status';
import firebase from 'firebase';

export const AUTH_TYPES = {
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT'
}

export const login = (username, password) => dispatch => {
    asyncAction(dispatch, AUTH_TYPES.LOGIN, async () => {
        await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).then(() => {
            return firebase.auth().signInWithEmailAndPassword(username, password);
        });

        return firebase.auth().currentUser;
    });
}

export const logout = () => dispatch => {
    asyncAction(dispatch, AUTH_TYPES.LOGOUT, firebase.auth().signOut);
}

export const checkAuth = () => {
    return {
        type: AUTH_TYPES.LOGIN,
        payload: firebase.auth().currentUser,
        meta: {
            status: STATUSES.FINISHED
        }
    }
}