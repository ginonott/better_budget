import React, { Component } from 'react';
import { Input, Segment, Button, Dropdown, Checkbox, Table } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { addTransaction, setTransactionAdder, loadTransactions } from '../reducers/transactions.action';
import STATUSES from '../constants/status';
import moment from 'moment';
import { getDateRange, isDateBefore } from '../util';
import { Alert } from './AlertCenter';
import { TransactionRow } from './TransactionView';
import {throttle} from 'lodash';

class AddTransaction extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showReoccuring: false,
            reoccursOn: 'Day'
        }
    }

    setReoccuring = showReoccuring => {
        this.setState({ showReoccuring })

        if (showReoccuring && isDateBefore(this.props.transaction.date, new Date())) {
            this.props.setTransactionAdderState({
                date: new Date()
            });
        }
    }

    setOccursOn = (_, { value }) => {
        this.setState({ reoccursOn: value });
    }

    onInputChange = throttle((prop, _, { value }) => {
        if (prop === 'date') {
            value = moment(value, 'YYYY-MM-DD').toDate();

            if (this.state.showReoccuring && isDateBefore(value, new Date())) {
                value = new Date();
            }
        }

        if (prop === 'cost') {
            value = Number(value);
        }

        if (prop === 'tags') {
            if (value === '') {
                value = []
            } else {
                value = [value];
            }
        }

        this.props.setTransactionAdderState({
            [prop]: value
        });
    });

    createTransaction = () => {
        if ((!this.props.transaction.id || this.props.transaction.id !== '') && this.state.showReoccuring) {
            const reoccuringTransaction = {
                ...this.props.transaction,
                reoccursOn: {
                    every: this.state.reoccursOn,
                    startingDate: this.props.transaction.date
                }
            }
            this.props.addTransaction(reoccuringTransaction);
            this.setReoccuring(false);
        } else {
            this.props.addTransaction(this.props.transaction);
            this.props.loadTransactions(this.props.selectedDate);
        }
    }

    renderReoccuringTransaction = () => {
        const options = ['Day', 'Week', 'Month'].map(x => ({ key: x, value: x, text: x }));
        const date = moment(this.props.transaction.date).format('MMMM Do');

        return (
            <React.Fragment>
                <br />
                <div>
                    <span>Reoccurs every </span>
                    <span><Dropdown inline onChange={this.setOccursOn} value={this.state.reoccursOn} options={options} /> </span>
                    <span>starting on <strong>{date}</strong> </span>
                </div>
                <br />
            </React.Fragment>
        )
    }

    renderSimilarTransactionsWarning = () => {
        return (
            <div>
                <Alert removeAlert={null} type="info" msg="This transaction may already exist. See below for similar transactions"/>
                <div className="transaction-peek">
                    <Table>
                        <Table.Body>
                            {this.props.similarTransactions.map(t =>
                                <TransactionRow
                                    key={t.id}
                                    transaction={t}
                                    removeTransaction={() => null}
                                    setDeleteStatus={() => null}
                                    editTransaction={() => null}
                                    deleting={false}
                                    readOnly={true}
                                    noTools={true}
                                />
                            )}
                        </Table.Body>
                    </Table>
                </div>
            </div>
        )
    };

    render() {
        const tagOptions = ['', ...this.props.tagOptions.sort((t1, t2) => t1 >= t2)].map(tag => (
            { key: tag, value: tag, text: tag === '' ? 'None' : tag }
        ));

        const {
            id = '',
            name,
            description,
            cost,
            date,
            tags
        } = this.props.transaction;

        return (
            <Segment className="transaction-adder" id="add-trans">
                <div className="transaction-adder-form">
                    <Input placeholder="Name..."
                        value={name}
                        onChange={this.onInputChange.bind(null, 'name')} />
                    <Input placeholder="Description..."
                        value={description}
                        onChange={this.onInputChange.bind(null, 'description')} />
                    <Input label="$" type="number" placeholder={Number(0).toFixed(2)}
                        value={cost === 0 ? '' : cost}
                        onChange={this.onInputChange.bind(null, 'cost')} />
                    <Input type="date" value={moment(date).format('YYYY-MM-DD')}
                        onChange={this.onInputChange.bind(null, 'date')} />
                    <Dropdown fluid search selection options={tagOptions} placeholder="Tags..."
                        value={tags[0] || ''}
                        onChange={this.onInputChange.bind(null, 'tags')} />
                    <div className="reoccuring-cb">
                    </div>
                </div>
                {this.props.similarTransactions.length > 0 ? this.renderSimilarTransactionsWarning() : null}
                {this.state.showReoccuring && id === '' ? this.renderReoccuringTransaction() : null}
                <br />
                <div>
                    <Button loading={this.props.status === STATUSES.STARTED} onClick={this.createTransaction}>
                        {id.length > 0 ? 'Save' : 'Add'} Transaction
                    </Button>
                    {id !== '' ? (
                        <Button onClick={this.props.setTransactionAdderState.bind(null, {
                            id: '',
                            name: '',
                            description: '',
                            cost: 0,
                            date,
                            tags: []
                        })}>
                            Cancel Edit
                        </Button>
                    ) : null}
                    {id === '' ? (
                        <Checkbox label="Reoccuring" checked={this.state.showReoccuring} onChange={(e, data) => { this.setReoccuring(data.checked) }} />
                    ) : null}
                </div>
            </Segment>
        )
    }
}

const mapStateToProps = state => ({
    tagOptions: state.tags,
    status: state.transactionAdder.status,
    transaction: state.transactionAdder.transaction,
    selectedDate: state.transactions.selectedDate,
    similarTransactions: state.transactionAdder.similarTransactions
});

const mapDispatchToProps = dispatch => ({
    addTransaction: (transaction) => {
        dispatch(addTransaction(transaction));
    },
    setTransactionAdderState: transactionAdderDiff => {
        dispatch(setTransactionAdder(transactionAdderDiff));
    },
    loadTransactions: date => {
        dispatch(loadTransactions(getDateRange(date)));
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(AddTransaction);