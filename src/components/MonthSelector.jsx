import React, {Component} from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { Dropdown } from 'semantic-ui-react';
import STATUSES from '../constants/status';
import { changeDate } from '../reducers/transactions.action';
class MonthSelector extends Component {
    dateChanged = (_, {value}) => {
        this.props.changeDate(moment(value, 'MMM YYYY').toDate());;
    }

    render() {
        const format = 'MMM YYYY';
        const months = [];

        let month = moment().month(8).date(1).year(2018);

        for (; month.isBefore(moment()); month = month.add(1, 'month')) {
            const text = month.format(format);
            months.push({
                key: text,
                value: text,
                text
            });
        }

        return (
            <Dropdown loading={this.props.loading} onChange={this.dateChanged} value={moment(this.props.selectedDate).format(format)} selection options={months}/>
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