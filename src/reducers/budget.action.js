import firebase from 'firebase/app';
import { asyncAction } from './async.action';
import { BUDGETS } from '../constants/database';

const firestore = firebase.firestore();

export const BUDGET_TYPES = {
    GET_MONTHLY_BUDGET: 'GET_MONTHLY_BUDGET',
    SET_BUDGET: 'SET_BUDGET',
}

/**
 *
 * @param {number} year - the year in the form of an int, retrieved from date.getFullYear()
 * @param {number} month - the month in the form of an int, retrieved from date.getMonth()
 */
export const getMonthlyBudget = (year, month) => dispatch => {
    asyncAction(dispatch, BUDGET_TYPES.GET_MONTHLY_BUDGET, async () => {
        if (year !== undefined && month !== undefined) {
            const key = `b${String(year)}-${String(month + 1).padStart(2, '0')}`;

            const monthlyBudget = await firestore.collection(BUDGETS).doc(key).get();

            if (monthlyBudget.exists) {
                return monthlyBudget.data();
            }
        }

        const defaultBudget = await firestore.collection(BUDGETS).doc('default').get();

        if (defaultBudget.exists) {
            return defaultBudget.data();
        }

        throw new Error('Error retrieving budget!');
    });
}

export const setMonthlyBudget = (budget, year, month) => async dispatch => {
    asyncAction(dispatch, BUDGET_TYPES.SET_MONTHLY_BUDGET, async () => {
        if (Number.isNaN(Number(budget.income))) {
            throw new Error('Income is not a number!');
        }

        if (Number.isNaN(Number(budget.savingsGoal))) {
            throw new Error('Savings is not a number!');
        }

        if (!budget.categoryBudgets) {
            throw new Error('Invalid category budgets!');
        }

        if (year !== undefined && month !== undefined) {
            const key = `b${String(year)}-${String(month + 1).padStart(2, '0')}`;
            await firestore.collection(BUDGETS).doc(key).set(budget);
        } else {
            await firestore.collection(BUDGETS).doc('default').set(budget);
        }

        return {
            msg: 'Successfully set budget!'
        }
    });

    getMonthlyBudget(year, month);
}