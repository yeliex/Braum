import * as React from 'react';
import { Layout } from 'antd';
import { connect } from 'react-redux';
import Header from '../header';
import SideMenu from '../side-menu';

const Store = require('store-decorator').default();

interface BaseLayoutProps {
  visible?: boolean;
}

interface BaseLayoutState {

}

export interface ChildProps {
  collapse: boolean;
  onCollapse: () => void;
}

export interface ChildState {

}

@connect(({side}) => {
  return side;
})
export default class BaseLayout extends React.Component<BaseLayoutProps, BaseLayoutState> {
  constructor(props) {
    super(props);

  }

  handleToggle = () => {
    Store.side.toggle();
  };


  render() {
    return (
      <Layout>
        <SideMenu onCollapse={this.handleToggle} collapse={this.props.visible} />
        <Layout>
          <Layout.Header style={{padding: 0}}>
            <Header onCollapse={this.handleToggle} collapse={this.props.visible} />
          </Layout.Header>
          <Layout.Content>
          {this.props.children}
          </Layout.Content>
          <Layout.Footer>
            <div />
          </Layout.Footer>
        </Layout>
      </Layout>
    );
  }
}
