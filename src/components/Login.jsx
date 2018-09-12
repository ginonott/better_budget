import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Segment, Header, Container, Input, Button} from 'semantic-ui-react';
import {login} from '../reducers/auth.action';

class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {
            username: '',
            password: ''
        };
    };

    componentDidMount() {
        document.addEventListener('keyup', this.keyPress);
    }

    componentWillUnmount() {
        document.removeEventListener('keyup', this.keyPress)
    }

    keyPress = e => {
        e.key === 'Enter' ? this.loginPressed() : null;
    }

    setUsername = (e, {value: username}) => {
        this.setState({
            username
        })
    };

    setPassword = (e, {value: password}) => {
        this.setState({
            password
        });
    }

    loginPressed = () => {
        this.props.login(this.state.username, this.state.password);
    }

    render() {
        return (
            <Segment style={{maxWidth: '24rem', alignSelf: 'center'}}>
                <Header>Racheal and Gino's Budget</Header>
                <Container style={{display: 'flex', flexDirection: 'column'}}>
                    <Input placeholder="Username" value={this.state.username} onChange={this.setUsername}/>
                    <br/>
                    <Input placeholder="Password" value={this.state.password} onChange={this.setPassword} type="password"/>
                    <br/>
                    <Button onClick={this.loginPressed}>Login</Button>
                </Container>
            </Segment>
        )
    }
}

export default connect(() => ({}), dispatch => ({
    login: (username, password) => {
        dispatch(login(username, password));
    }
}))(Login);