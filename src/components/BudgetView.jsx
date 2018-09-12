import React, {Component} from 'react';
import {connect} from 'react-redux';
import { Segment, Statistic, Divider, Button, Loader, Container } from 'semantic-ui-react';
import { getMonthlyBudget } from '../reducers/budget.action';
import STATUSES from '../constants/status';

function getBudgetBreakdown(transactionsById) {
    const budgetBreakdown = {
        totalSpent: 0,
        spentByCategory: {
            Uncategorized: 0
        }
    };

    let transactions = Object.values(transactionsById);
    transactions.forEach(transaction => {
        budgetBreakdown.totalSpent += transaction.cost;

        if (transaction.tags.length < 1) {
            budgetBreakdown.spentByCategory.Uncategorized += transaction.cost;
        } else {
            transaction.tags.forEach(tag => {
                if (!budgetBreakdown.spentByCategory[tag]) {
                    budgetBreakdown.spentByCategory[tag] = 0;
                }

                budgetBreakdown.spentByCategory[tag] += transaction.cost;
            });
        }
    });

    return budgetBreakdown;
}

class EditBudget extends Component {

}

const EditBudgetConnected = connect()(EditBudget);

class BudgetView extends Component {
    componentDidMount() {
        const year = this.props.selectedDate.getFullYear();
        const month = this.props.selectedDate.getMonth();
        this.props.loadMonthlyBudget(year, month);
    }
    render() {
        if (this.props.loading === STATUSES.STARTED) {
            return (
                <Segment>
                    <Loader active={true}/>
                </Segment>
            )
        }

        if (this.props.loading === STATUSES.FAILED) {
            return (
                <Segment>
                    <Container>
                        <p>There was an error fetching the budget. Please reload the page and try again.</p>
                    </Container>
                </Segment>
            )
        }

        const moneyRemaining = this.props.budget.income - this.props.budget.savingsGoal - this.props.budgetBreakdown.totalSpent;
        const {totalSpent} = this.props.budgetBreakdown;
        return (
            <Segment>
                <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around'}}>
                    <Statistic size="small">
                        <Statistic.Value>${this.props.budget.income.toFixed(2)}</Statistic.Value>
                        <Statistic.Label>Income</Statistic.Label>
                    </Statistic>
                    <Statistic size="small">
                        <Statistic.Value>${this.props.budget.savingsGoal.toFixed(2)}</Statistic.Value>
                        <Statistic.Label>Savings Goal</Statistic.Label>
                    </Statistic>
                    <Statistic size="small">
                        <Statistic.Value style={{color: '#721c24'}}>
                            ${totalSpent.toFixed(2)}
                        </Statistic.Value>
                        <Statistic.Label>Total Spent</Statistic.Label>
                    </Statistic>
                    <Statistic size="small">
                        <Statistic.Value style={{color: moneyRemaining > 0 ? 'seagreen' : 'red'}}>
                            ${moneyRemaining.toFixed(2)}
                        </Statistic.Value>
                        <Statistic.Label>Money Remaining</Statistic.Label>
                    </Statistic>
                </div>
                <Divider/>
                <div>
                    {Object.entries(this.props.budgetBreakdown.spentByCategory)
                        .sort(([tag1, cost1],[tag2, cost2]) => cost2 - cost1)
                        .map(([tag, cost]) => {
                        const colors = {
                            low: {color: 'seagreen', background: 'darkseagreen'},
                            medium: {color: '#856404', background: '#fff3cd'},
                            high: {color: '#721c24', background: '#f5c6cb'}
                        }

                        const costPercent = totalSpent === 0 ? 0 : ((cost/totalSpent) * 100);

                        const color = costPercent >= 66 ? colors.high
                                      : costPercent >= 33 ? colors.medium
                                      : colors.low;
                        return (
                            <div style={{width: '100%', marginBottom: '1rem', height: '3rem', display: 'flex', flexDirection: 'row'}} className="budget-category">
                                <div className="budget-name" style={{width: '20%', margin: 'auto', textOverflow: 'ellipsis'}}>
                                    <strong>{tag}</strong>
                                </div>
                                <div className="budget-bar" style={{width: '80%', display: 'flex', flexDirection: 'row'}}>
                                    <div style={{
                                        height: "100%",
                                        textAlign: 'right',
                                        color: color.color,
                                        background: color.background,
                                        width: `${totalSpent === 0 ? 0 : (costPercent)}%`,
                                        display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            paddingRight: '1rem',
                                        }}>
                                        <strong>{costPercent > 80 ? `$${cost.toFixed(2)} (${costPercent.toFixed(0)}%)` : null}</strong>
                                    </div>
                                    <div style={{
                                            color: color.color,
                                            height: "100%",
                                            background: "white",
                                            textAlign: 'left',
                                            width: `${totalSpent === 0 ? 0 : (100 - costPercent)}%`,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            paddingLeft: '1rem',
                                        }}>
                                        <strong>
                                            {costPercent <= 80 ? `$${cost.toFixed(2)} (${costPercent.toFixed(0)}%)` : null}
                                        </strong>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
                <Divider/>
                <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', paddingBottom: '12px'}}>
                    <Button> Edit Default Budget </Button>
                    <Button> Edit Monthly Budget </Button>
                </div>
            </Segment>
        )
    }
}

export default connect(state => ({
    budget: state.budget.monthlyBudget,
    selectedDate: state.transactions.selectedDate,
    budgetBreakdown: getBudgetBreakdown(state.transactions.transactionsById),
    loading: state.budget.loading
}), dispatch => ({
    loadMonthlyBudget: (year, month) => {
        dispatch(getMonthlyBudget(year, month));
    }
}))(BudgetView);