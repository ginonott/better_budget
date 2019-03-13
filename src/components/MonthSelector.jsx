import React, {Component} from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { Dropdown } from 'semantic-ui-react';
import STATUSES from '../constants/status';
import { changeDate } from '../reducers/transactions.action';
class MonthSelector extends Component {
    constructor(props) {
        super(props);

        this.state = {
            year: new Date().getFullYear()
        }
    }

    dateChanged = (_, {value}) => {
        this.props.changeDate(new Date(this.state.year, value, 1));
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

        const years = new Array(new Date().getFullYear() - 2017).fill(0).map((_, indx) => 2018 + indx).map(year => ({
            key: year,
            value: year,
            text: year
        }));

        return (
            <React.Fragment>
                <Dropdown loading={this.props.loading} onChange={this.dateChanged} value={this.props.selectedDate} selection options={months}/>
                <span style={{width: '1rem'}}/>
                <Dropdown onChange={(_, {value}) => {
                    this.setState({year: value}, () => {
                        this.dateChanged(null, {value: this.props.selectedDate})
                    });
                }} value={this.state.year} selection options={years}/>
            </React.Fragment>
        );
    }
}

export default connect(state => ({
    selectedDate: state.transactions.selectedDate.getMonth(),
    loading: state.transactions.status === STATUSES.STARTED
}), dispatch => ({
    changeDate: date => {
        dispatch(changeDate(date));
    }
}))(MonthSelector);