import * as React from 'react';
import { Layout } from 'antd';
import { ChildState, ChildProps } from '../layout';
import Style from './index.less';
import Menu from './menu';

interface SideMenuProps extends ChildProps {
}

interface SideMenuState extends ChildState {

}

export default class SideMenu extends React.Component<SideMenuProps, SideMenuState> {
  render() {
    return (
      <Layout.Sider
        trigger={null}
        collapsible
        breakpoint="lg"
        collapsed={!this.props.collapse}
        onCollapse={this.props.onCollapse}
        width={256}
      >
        <div className={Style.logo}>
          <img />
          <h1>Braum</h1>
        </div>
        <Menu />
      </Layout.Sider>
    );
  }
}
