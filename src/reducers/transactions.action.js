import STATUSES from '../constants/status';
import { TRANSACTIONS } from '../constants/database';
import firebase from 'firebase';
import { getDateRange } from '../util';
import {asyncAction} from './async.action';

const db = firebase.firestore();

export const TRANSACTION_TYPES = {
    'LOAD_TRANSACTIONS': 'LOAD_TRANSACTIONS',
    'ADD_TRANSACTION': 'ADD_TRANSACTION',
    'REMOVE_TRANSACTION': 'REMOVE_TRANSACTION',
    'CHANGE_DATE': 'CHANGE_DATE',
    'SET_TRANSACTION_ADDER': 'SET_TRANSACTION_ADDER',
    'SET_TAG_FILTER': 'SET_TAG_FILTER'
};

/**
 *
 * @param {Date} from - the beginning range
 * @param {Date} to - the ending range
 */
async function getTransactions({from, to}) {
    const transactionsQuerySnapshot = await db.collection(TRANSACTIONS)
        .where('date', '>=', from)
        .where('date', '<=', to)
        .get();

    const transactions = [];
    transactionsQuerySnapshot.forEach(snapshot => {
        const transaction = snapshot.data();
        transaction.id = snapshot.id;
        transactions.push(transaction);
    });

    return transactions.map((t) => ({...t, date: t.date.toDate()}));
}

export const loadTransactions = ({from, to}) => async dispatch => {
    asyncAction(dispatch, TRANSACTION_TYPES.LOAD_TRANSACTIONS, async () => {
        const transactions = await getTransactions({from, to}) || [];

        return {
            from, to, transactions
        }
    });
}

async function addTransactionToDB(transaction) {
    if (transaction.id) {
        await db.collection(TRANSACTIONS).doc(transaction.id).set(transaction);
    } else {
        await db.collection(TRANSACTIONS).doc().set(transaction);
    }

    return {
        result: 'Successfully upserted transaction'
    };
}

export const addTransaction = transaction => async dispatch => {
    if (transaction.name.length < 1 || transaction.date === 'Invalid Date' || transaction.cost === 0) {
        dispatch({
            type: '',
            payload: {
                error: new Error('Invalid date, name, or cost. Please fix either of them and try again.')
            },
            meta: {
                status: STATUSES.FAILED
            }
        });
    } else {
        await asyncAction(dispatch, TRANSACTION_TYPES.ADD_TRANSACTION, addTransactionToDB.bind(null, transaction));
    }


};

async function deleteTransaction(transactionId) {
    await db.collection(TRANSACTIONS).doc(transactionId).delete();

    return {
        transactionId
    };
}

export const removeTransaction = transactionId => async dispatch => {
    await asyncAction(dispatch, TRANSACTION_TYPES.REMOVE_TRANSACTION, deleteTransaction.bind(null, transactionId));
};

export const changeDate = selectedDate => async dispatch => {
    dispatch({
        type: TRANSACTION_TYPES.CHANGE_DATE,
        payload: {selectedDate}
    });
    dispatch(loadTransactions(getDateRange(selectedDate)));
}

export const setTransactionAdder = transactionAdderDiff => {
    return {
        type: TRANSACTION_TYPES.SET_TRANSACTION_ADDER,
        payload: transactionAdderDiff
    };
}

export const setTagFilter = (tag = 'All') => ({
    type: TRANSACTION_TYPES.SET_TAG_FILTER,
    payload: tag
})