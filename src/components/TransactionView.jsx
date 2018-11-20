import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Segment, Table, Label, Button, Divider, Dropdown } from 'semantic-ui-react';
import moment from 'moment';
import { removeTransaction, changeDate, setTransactionAdder, loadTransactions, setTagFilter } from '../reducers/transactions.action';
import { getDateRange } from '../util';
import PropTypes from 'prop-types';

export class TransactionRow extends Component {
    static propTypes = {
        transaction: PropTypes.shape({
            id: PropTypes.string,
            name: PropTypes.string,
            description: PropTypes.string,
            cost: PropTypes.number
        }),

        readOnly: PropTypes.bool,
        deleting: PropTypes.bool,
        noTools: PropTypes.bool
    }

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
                {!this.props.noTools ?
                    <Table.Cell>
                            <div style={{ display: 'flex', flexDirection: 'row' }}>
                                <Button icon="pencil" disabled={this.props.readOnly} onClick={this.props.editTransaction.bind(null, this.props.transaction)} />
                                <Button loading={this.props.deleting}
                                    disabled={this.props.readOnly}
                                    style={{ color: 'red' }} icon="trash" onClick={() => {
                                        this.props.removeTransaction(this.props.transaction.id);
                                        this.props.setDeleteStatus(this.props.transaction.id);
                                    }} />
                            </div>
                    </Table.Cell>
                : null}
            </Table.Row>
        )
    }
}

const HEADERS = ["Purchased On", "Transaction Name", "Description", "Cost", "Tags", "Actions"];

class TransactionView extends Component {
    constructor(props) {
        super(props);

        this.state = {
            deletingTransactions: [],
            sortBy: HEADERS[0]
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

    tagFilterChanged = (e, { value }) => {
        this.props.setTagFilter(value);
    }

    sortByChanged = (e, { value }) => {
        this.setState({
            sortBy: value
        });
    }

    render() {
        const tagOptions = ['All', 'Uncategorized', ...this.props.tags.sort((t1, t2) => t1 >= t2)].map(t => ({
            key: t,
            value: t,
            text: t
        }));

        const sorts = HEADERS.slice(0, 4);

        const sortByOptions = sorts.map(h => ({
            key: h,
            value: h,
            text: h
        }));

        const sortedTransactions = this.props.transactions.sort((t1, t2) => {
            let property = {
                [HEADERS[0]]: 'date',
                [HEADERS[1]]: 'name',
                [HEADERS[2]]: 'description',
                [HEADERS[3]]: 'cost',
            }[this.state.sortBy];

            switch(property) {
                case 'date': {
                    return t2.date.getTime() - t1.date.getTime();
                }
                case 'name':
                case 'description': {
                    if (t1[property] < t2[property]) {
                        return -1;
                    } else if (t1[property] > t2[property]) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
                case 'cost': {
                    return t1[property] - t2[property];
                }
            }
        });

        return (
            <Segment id="transactions" className="transaction-view">
                <div className="transaction-header">
                    <span>
                        Showing <Dropdown onChange={this.tagFilterChanged} value={this.props.tagFilter} inline options={tagOptions} />
                        &nbsp;&nbsp;
                        Sort By <Dropdown onChange={this.sortByChanged} value={this.state.sortBy} inline options={sortByOptions}/>
                    </span>
                    <Button loading={this.props.loading} icon="refresh" onClick={this.props.loadTransactions.bind(null, getDateRange(this.props.selectedDate))} />
                </div>
                <Divider />
                <div className="transaction-list">
                    <Table striped>
                        <Table.Header>
                            <Table.Row>
                                {HEADERS.map(n => (
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
    selectedDate: state.transactions.selectedDate,
    edittingTransaction: state.transactionAdder.transaction.id,
    tagFilter: state.transactions.tagFilter,
    tags: state.tags,
    loading: state.transactions.status === 'STARTED'
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