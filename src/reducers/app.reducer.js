import STATUSES from "../constants/status";
import { TRANSACTION_TYPES } from "./transactions.action";
import { ALERT_SEVERITY, ALERT_TYPES } from "./alerts.action";
import { AUTH_TYPES } from './auth.action';
import { BUDGET_TYPES } from "./budget.action";

// utilities
function memoizeIt(fn) {
    const memoizedValues = {};

    return (...args) => {
        const key = args.reduce((str, arg) => `${str}|${JSON.stringify(arg)}`, '');

        if (memoizedValues[key] !== undefined) {
            return memoizedValues[key];
        }

        const retVal = fn(...args);
        memoizedValues[key] = retVal;

        return retVal;
    };
}

const editDistance = memoizeIt(function(s1, s1Length, s2, s2Length) {
  let cost = 0;

  /* base case: empty strings */
  if (s1Length === 0) return s2Length;
  if (s2Length === 0) return s1Length;

  /* test if last characters of the strings match */
  if (s1[s1Length - 1] === s2[s2Length - 1]) {
      cost = 0;
  } else {
      cost = 1;
  }

  /* return minimum of delete char from s, delete char from t, and delete char from both */
  return Math.min(
    editDistance(s1, s1Length - 1, s2, s2Length    ) + 1,
    editDistance(s1, s1Length    , s2, s2Length - 1) + 1,
    editDistance(s1, s1Length - 1, s2, s2Length - 1) + cost);
});

function areStringsAlike(s1, s2) {
    return (1 / editDistance(s1.toUpperCase(), s1.length, s2.toUpperCase(), s2.length)) >= 0.75;
}

function isSameDate(d1, d2) {
    return d1.getDate() === d2.getDate()
        && d1.getMonth() === d2.getMonth()
        && d1.getYear() === d2.getYear();
}

function isSimilarTransactionTo(transaction, transactions) {
    const similarTransactions = transactions.reduce((similarTransactions, t) => {
        // For hard matches (ie, the name matches perfectly, the price matches perfectly)
        if (transaction.name === t.name) {
            return [...similarTransactions, t];
        }

        if (transaction.cost === t.cost) {
            return [...similarTransactions, t];
        }

        const similarities = [
            areStringsAlike(transaction.name, t.name),
            areStringsAlike(transaction.description, t.description),
            isSameDate(transaction.date, t.date),
            transaction.cost === t.cost,
            transaction.tags[0] === t.tags[0]
        ];

        const similaritiesCnt = similarities.reduce((cnt, cur) => cur ? cnt + 1 : cnt, 0);

        if (similaritiesCnt >= 3) {
            return [...similarTransactions, t];
        }

        return similarTransactions;
    }, []);

    return similarTransactions;
}

const defaultState = Object.freeze({
    tags: [
        'Drinks', 'Restaurants', 'Snacks',
        'Pets', 'Bills', 'Home', 'Laundry',
        'Health', 'Groceries', 'Entertainment',
        'Clothing', 'Gifts'
    ],
    alerts: {
        alerts: []
    },
    transactions: {
        transactionsById: {},
        status: STATUSES.NOT_STARTED,
        selectedDate: new Date(),
        tagFilter: 'All',
        error: null
    },
    transactionAdder: {
        transaction: {
            name: '',
            description: '',
            date: new Date(),
            cost: 0,
            tags: []
        },
        status: STATUSES.NOT_STARTED,
        error: null,
        similarTransactions: []
    },
    user: {
        loggedIn: false,
        profile: {}
    },
    budget: {
        monthlyBudget: {
            categoryBudgets: {},
            savingsGoal: 0,
            income: 0
        },
        loading: STATUSES.NOT_STARTED
    }
});

function transactionReducer(state = defaultState.transactions, action) {
    switch (action.type) {
        case TRANSACTION_TYPES.LOAD_TRANSACTIONS: {
            if (action.meta.status === STATUSES.FAILED) {
                return {
                    ...state,
                    status: action.meta.status,
                    error: action.payload.error
                }
            }

            if (action.meta.status === STATUSES.FINISHED) {
                return {
                    ...state,
                    status: action.meta.status,
                    transactionsById: {
                        ...action.payload.transactions.reduce((col, t) => {
                            col[t.id] = t;
                            return col;
                        }, {})
                    }
                }
            }

            return {
                ...state,
                status: action.meta.status,
                error: null
            }
        }

        case TRANSACTION_TYPES.REMOVE_TRANSACTION: {
            let newState = { ...state };

            if (action.meta.status === STATUSES.FINISHED) {
                delete newState.transactionsById[action.payload.transactionId];
            }

            return newState;
        }

        case TRANSACTION_TYPES.CHANGE_DATE: {
            return {
                ...state,
                selectedDate: action.payload.selectedDate
            }
        }

        case TRANSACTION_TYPES.SET_TAG_FILTER: {
            return {
                ...state,
                tagFilter: action.payload
            }
        }

        default: {
            return { ...state };
        }
    }
}

function transactionAdderReducer(state = defaultState.transactionAdder, action, wholeState = defaultState) {
    switch (action.type) {
        case TRANSACTION_TYPES.ADD_TRANSACTION: {
            if (action.meta.status === STATUSES.FAILED) {
                return {
                    ...state,
                    status: action.meta.status,
                    error: action.payload.error
                }
            }

            if (action.meta.status === STATUSES.FINISHED) {
                return Object.assign(defaultState.transactionAdder, { status: action.meta.status, date: state.date });
            }

            return {
                ...state,
                status: action.meta.status,
                error: null
            }
        }

        case TRANSACTION_TYPES.SET_TRANSACTION_ADDER: {
            const newTransaction = {
                ...state.transaction,
                ...action.payload
            };

            return {
                ...state,
                transaction: newTransaction,
                similarTransactions: isSimilarTransactionTo(
                    newTransaction,
                    Object.values(wholeState.transactions.transactionsById)
                )
            };
        }

        case TRANSACTION_TYPES.CHANGE_DATE: {
            const newDate = new Date(state.transaction.date);
            newDate.setMonth(action.payload.selectedDate.getMonth())
            return {
                ...state,
                transaction: {
                    ...state.transaction,
                    date: newDate
                }
            }
        }

        default: {
            return { ...state };
        }
    }
}

function alertReducer(state = defaultState.alerts, action) {
    const newState = { ...state };

    if (action && action.meta && action.meta.status === STATUSES.FAILED) {
        newState.alerts = [{
            msg: action.payload.error.message,
            expires: Date.now() + 60000,
            id: Math.floor(Math.random() * 10000000),
            type: action.payload.severity || ALERT_SEVERITY.DANGER
        }, ...state.alerts];
    }

    switch (action.type) {
        case ALERT_TYPES.REMOVE_ALERT: {
            newState.alerts = state.alerts.filter(alert => alert.id !== action.payload.alertId);
            return newState;
        }

        default: {
            return { ...newState };
        }
    }
}

function authReducer(state = defaultState.user, action) {
    switch (action.type) {
        case AUTH_TYPES.LOGIN: {
            if (action.meta.status === STATUSES.FAILED) {
                return {
                    ...state,
                    loggedIn: false,
                    profile: {}
                }
            }

            if (action.meta.status === STATUSES.FINISHED) {
                return {
                    ...state,
                    loggedIn: action.payload !== null,
                    profile: action.payload || {}
                }
            }

            return {
                ...state,
                loggedIn: false,
                profile: {}
            }
        }

        case AUTH_TYPES.LOGOUT: {
            return { ...defaultState.user };
        }

        default: {
            return { ...state };
        }
    }
}

function monthlyBudgetReducer(state = defaultState.budget, action) {
    switch (action.type) {
        case BUDGET_TYPES.GET_MONTHLY_BUDGET: {
            if (action.meta.status === STATUSES.FAILED) {
                return {
                    ...defaultState.budget
                };
            }

            if (action.meta.status === STATUSES.STARTED) {
                return {
                    ...state,
                    loading: action.meta.status
                }
            }

            return {
                ...state,
                loading: action.meta.status,
                monthlyBudget: action.payload
            }
        }

        default: {
            return { ...state };
        }
    }
}

function budgetReducer(state = defaultState, action) {
    return {
        ...state,
        alerts: alertReducer(state.alerts, action),
        transactions: transactionReducer(state.transactions, action),
        transactionAdder: transactionAdderReducer(state.transactionAdder, action, state),
        user: authReducer(state.user, action),
        budget: monthlyBudgetReducer(state.budget, action),
    };
}

export default budgetReducer;


