import React, {Component} from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { Dropdown } from 'semantic-ui-react';
import STATUSES from '../constants/status';
import { changeDate } from '../reducers/transactions.action';
class MonthSelector extends Component {
    dateChanged = (_, {value}) => {
        this.props.changeDate(new Date(this.props.selectedDate.getFullYear(), value, 1));
    }

    render() {
        const months = new Array(12)
            .fill(0)
            .map((_, indx) => indx)
            .map(month => ({
                key: 'month-' + month,
                value: month,
                text: `${moment(new Date(new Date().getFullYear(), month, 1)).format('MMMM')}`
            }));

        return (
            <Dropdown loading={this.props.loading} onChange={this.dateChanged} value={this.props.selectedDate.getMonth()} selection options={months}/>
        );
    }
}

export default connect(state => ({
    selectedDate: state.transactions.selectedDate,
    loading: state.transactions.status === STATUSES.STARTED
}), dispatch => ({
    changeDate: date => {
        dispatch(changeDate(date));
    }
}))(MonthSelector);