import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Segment, Button } from 'semantic-ui-react';
import { removeAlert } from "../reducers/alerts.action";

export const Alert = ({ msg, id, type, removeAlert }) => (
    <Segment className={`alert ${type.toLowerCase()}`}>
        {removeAlert ?
            <div className="alert-heading">
                <Button icon="close" onClick={removeAlert.bind(null, id)} className={`alert-close-btn ${type.toLowerCase()}`} />
            </div>
            : null
        }
        <div className={`alert-body ${type.toLowerCase()}`}>
            <p>{msg}</p>
        </div>
    </Segment>
);

class AlertCenter extends Component {
    render() {
        if (this.props.alerts.length === 0) {
            return null;
        }

        return (
            <React.Fragment>
                {this.props.alerts.map(alert => <Alert key={alert.id} {...alert} removeAlert={this.props.removeAlert} />)}
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => ({
    alerts: state.alerts.alerts
});

const mapDispatchToProps = dispatch => ({
    removeAlert: id => {
        dispatch(removeAlert(id))
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(AlertCenter);