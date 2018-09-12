import React, {Component} from 'react';
import {Input, Segment, Button, Dropdown } from 'semantic-ui-react';
import {connect} from 'react-redux';
import { addTransaction, setTransactionAdder, loadTransactions } from '../reducers/transactions.action';
import STATUSES from '../constants/status';
import moment from 'moment';
import {getDateRange} from '../util';

class AddTransaction extends Component {
    onInputChange = (prop, _, {value}) => {
        if (prop === 'date') {
            value = moment(value, 'YYYY-MM-DD').toDate();
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
    }

    createTransaction = () => {
        this.props.addTransaction(this.props.transaction);
        this.props.loadTransactions(this.props.selectedDate);
    }

    render() {
        const tagOptions = ['', ...this.props.tagOptions.sort((t1, t2) => t1 >= t2)].map(tag => (
            {key: tag, value: tag, text: tag === '' ? 'None' : tag}
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
                        onChange={this.onInputChange.bind(null, 'name')}/>
                    <Input placeholder="Description..."
                        value={description}
                        onChange={this.onInputChange.bind(null, 'description')}/>
                    <Input label="$" type="number" placeholder={Number(0).toFixed(2)}
                        value={cost === 0 ? '' : cost}
                        onChange={this.onInputChange.bind(null, 'cost')}/>
                    <Input type="date" value={moment(date).format('YYYY-MM-DD')}
                        onChange={this.onInputChange.bind(null, 'date')}/>
                    <Dropdown fluid search selection options={tagOptions} placeholder="Tags..."
                        value={tags[0] || ''}
                        onChange={this.onInputChange.bind(null, 'tags')}/>
                </div>
                <br/>
                <div>
                    <Button loading={this.props.status === STATUSES.STARTED} onClick={this.createTransaction}>
                        {id.length > 0 ? 'Save' : 'Add'} Transaction
                    </Button>
                    {id.length > 0 ? (
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
                    ): null}
                </div>
            </Segment>
        )
    }
}

const mapStateToProps = state => ({
    tagOptions: state.tags,
    status: state.transactionAdder.status,
    transaction: state.transactionAdder.transaction,
    selectedDate: state.transactions.selectedDate
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