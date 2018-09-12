import STATUSES from "../constants/status";
import { TRANSACTION_TYPES } from "./transactions.action";
import { ALERT_SEVERITY, ALERT_TYPES } from "./alerts.action";
import {AUTH_TYPES} from './auth.action';
import { BUDGET_TYPES } from "./budget.action";

const defaultState = Object.freeze({
    tags: ['Drinks', 'Restaurants', 'Snacks', 'Pets', 'Bills', 'Home', 'Laundry', 'Health', 'Groceries', 'Entertainment'],
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
        error: null
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
    switch(action.type) {
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
            let newState = {...state};

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
            return {...state};
        }
    }
}

function transactionAdderReducer(state = defaultState.transactionAdder, action) {
    switch(action.type) {
        case TRANSACTION_TYPES.ADD_TRANSACTION: {
            if (action.meta.status === STATUSES.FAILED) {
                return {
                    ...state,
                    status: action.meta.status,
                    error: action.payload.error
                }
            }

            if (action.meta.status === STATUSES.FINISHED) {
                return Object.assign(defaultState.transactionAdder, {status: action.meta.status, date: state.date});
            }

            return {
                ...state,
                status: action.meta.status,
                error: null
            }
        }

        case TRANSACTION_TYPES.SET_TRANSACTION_ADDER: {
            return {
                ...state,
                transaction: {
                    ...state.transaction,
                    ...action.payload
                }
            }
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
            return {...state};
        }
    }
}

function alertReducer(state = defaultState.alerts, action) {
    const newState = {...state};

    if (action && action.meta && action.meta.status === STATUSES.FAILED) {
        newState.alerts = [{
                msg: action.payload.error.message,
                expires: Date.now() + 60000,
                id: Math.floor(Math.random() * 10000000),
                type: ALERT_SEVERITY.DANGER
            }, ...state.alerts];
    }

    switch(action.type) {
        case ALERT_TYPES.REMOVE_ALERT: {
            newState.alerts = state.alerts.filter(alert => alert.id !== action.payload.alertId);
            return newState;
        }

        default: {
            return {...newState};
        }
    }
}

function authReducer(state = defaultState.user, action) {
    switch(action.type) {
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
            return {...defaultState.user};
        }

        default: {
            return {...state};
        }
    }
}

function monthlyBudgetReducer(state = defaultState.budget, action) {
    switch(action.type) {
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
            return {...state};
        }
    }
}

function budgetReducer(state = defaultState, action) {
    const newState = {...state};

    return {
        ...newState,
        alerts: alertReducer(state.alerts, action),
        transactions: transactionReducer(state.transactions, action),
        transactionAdder: transactionAdderReducer(state.transactionAdder, action),
        user: authReducer(state.user, action),
        budget: monthlyBudgetReducer(state.budget, action)
    }
}

export default budgetReducer;


