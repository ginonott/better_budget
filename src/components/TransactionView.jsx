import React, {Component} from 'react';
import { connect } from 'react-redux';
import { Segment, Table, Label, Button, Divider, Dropdown} from 'semantic-ui-react';
import moment from 'moment';
import { removeTransaction, changeDate, setTransactionAdder, loadTransactions, setTagFilter } from '../reducers/transactions.action';
import STATUSES from '../constants/status';
import {getDateRange} from '../util';

class TransactionRow extends Component {
    render() {
        return (
            <Table.Row>
                {[moment(this.props.transaction.date).format('MM/DD'), this.props.transaction.name, this.props.transaction.description, `$${this.props.transaction.cost.toFixed(2)}`].map(n => (
                    <Table.Cell key={this.props.transaction.id + n}>
                        {n}
                    </Table.Cell>
                ))}
                <Table.Cell>
                    {this.props.transaction.tags.map(tag => (
                        <Label key={this.props.transaction.id + tag}>
                            {tag}
                        </Label>
                    ))}
                </Table.Cell>
                <Table.Cell>
                    <div style={{display: 'flex', flexDirection: 'row'}}>
                        <Button icon="pencil" disabled={this.props.readOnly} onClick={this.props.editTransaction.bind(null, this.props.transaction)}/>
                        <Button loading={this.props.deleting}
                            disabled={this.props.readOnly}
                            style={{color: 'red'}} icon="trash" onClick={() => {
                            this.props.removeTransaction(this.props.transaction.id);
                            this.props.setDeleteStatus(this.props.transaction.id);
                        }}/>
                    </div>
                </Table.Cell>
            </Table.Row>
        )
    }
}

class TransactionView extends Component {
    constructor(props) {
        super(props);

        this.state = {
            deletingTransactions: [],
        };
    }

    componentDidMount() {
        this.props.loadTransactions(getDateRange(this.props.selectedDate));
    }

    setDeleteStatus = id => {
        this.setState({
            deletingTransactions: [...this.state.deletingTransactions, id]
        });
    }

    editTransaction = transaction => {
        this.props.setTransactionAdder(transaction);
        window.location.hash = '#add-trans';
    }

    dateChanged = (e, {value}) => {
        this.props.changeDate(new Date(this.props.selectedDate.getFullYear(), value, 1));
    }

    tagFilterChanged = (e, {value}) => {
        this.props.setTagFilter(value);
    }

    render() {
        const months = new Array(12)
            .fill(0)
            .map((_, indx) => indx)
            .map(month => ({
                key: 'month-' + month,
                value: month,
                text: moment(new Date(new Date().getFullYear(), month, 1)).format('MMMM')
            }));

        const tagOptions = ['All', 'Uncategorized', ...this.props.tags.sort((t1, t2) => t1 >= t2)].map(t => ({
            key: t,
            value: t,
            text: t
        }));

        return (
            <Segment id="transactions" className="transaction-view">
                <div className="transaction-header">
                    <Dropdown loading={this.props.loading} onChange={this.dateChanged} value={this.props.selectedDate.getMonth()} selection options={months}/>
                    <Dropdown onChange={this.tagFilterChanged} value={this.props.tagFilter} selection options={tagOptions}/>
                </div>
                <Divider/>
                <div className="transaction-list">
                    <Table striped>
                        <Table.Header>
                            <Table.Row>
                                {["Purchased On", "Transaction Name", "Description", "Cost", "Tags", "Actions"].map(n => (
                                    <Table.HeaderCell key={n}>
                                        {n}
                                    </Table.HeaderCell>
                                ))}
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {this.props.transactions.length > 0 ? this.props.transactions
                                .filter(t => (
                                    (this.props.tagFilter === 'Uncategorized' && t.tags.length === 0)
                                    || this.props.tagFilter === 'All'
                                    || t.tags.includes(this.props.tagFilter)
                                ))
                                .sort((t1, t2) => (
                                    t2.date.getTime() - t1.date.getTime()
                                ))
                                .map(t => (
                                <TransactionRow
                                    key={t.id}
                                    transaction={t}
                                    deleting={this.state.deletingTransactions.includes(t.id)}
                                    removeTransaction={this.props.removeTransaction}
                                    setDeleteStatus={this.setDeleteStatus}
                                    editTransaction={this.editTransaction}
                                    readOnly={Boolean(this.props.edittingTransaction)}
                                    />
                            )) : (
                                <Table.Row>
                                    <Table.Cell width={6}>
                                       There doesn't appear to be any transactions... <span role="img" aria-label="pensive">🤔</span>
                                    </Table.Cell>
                                </Table.Row>
                            )}
                        </Table.Body>
                    </Table>
                </div>
            </Segment>
        )
    }
};

export default connect(state => ({
    transactions: Object.values(state.transactions.transactionsById),
    loading: state.transactions.status === STATUSES.STARTED,
    selectedDate: state.transactions.selectedDate,
    edittingTransaction: state.transactionAdder.transaction.id,
    tagFilter: state.transactions.tagFilter,
    tags: state.tags
}), dispatch => ({
    removeTransaction: id => {
        dispatch(removeTransaction(id));
    },
    changeDate: date => {
        dispatch(changeDate(date));
    },
    setTransactionAdder: transaction => {
        dispatch(setTransactionAdder(transaction));
    },
    loadTransactions: dateRange => {
        dispatch(loadTransactions(dateRange));
    },
    setTagFilter: tag => {
        dispatch(setTagFilter(tag));
    }
}))(TransactionView);