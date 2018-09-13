import React, { Component } from 'react';
import { Menu } from 'semantic-ui-react';
import MonthSelector from './MonthSelector';

export default class NavbarMenu extends Component {
    render() {
        return (
            <Menu stackable>
                <Menu.Item onClick={() => { window.location.hash = ''; }} icon="home" />
                <Menu.Item borderless position="right">
                    <MonthSelector />
                </Menu.Item>
            </Menu>
        )
    }
}