import React, {Component} from 'react';
import { Menu, Header } from 'semantic-ui-react';

export default class NavbarMenu extends Component {
    render() {
        return(
            <Menu>
                <Menu.Item>
                    <strong>Racheal and Gino's Budget</strong>
                </Menu.Item>
                <Menu.Item>
                    Coming Soon...
                </Menu.Item>
            </Menu>
        )
    }
}