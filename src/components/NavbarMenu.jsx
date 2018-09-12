import React, {Component} from 'react';
import { Menu } from 'semantic-ui-react';
import MonthSelector from './MonthSelector';

export default class NavbarMenu extends Component {
    render() {
        return(
            <Menu stackable>
                <Menu.Item onClick={() => 0} icon="home"/>
                <Menu.Item onClick={() => 0} name="Budgets"/>
                <Menu.Item onClick={() => 0} name="Settings"/>
                <Menu.Item borderless position="right">
                    <MonthSelector/>
                </Menu.Item>
            </Menu>
        )
    }
}