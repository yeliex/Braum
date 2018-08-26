import { createElement, Component } from 'react';
import { Menu, Icon } from 'antd';
import { omit } from 'lodash';
import { resolve } from 'path';
import assert from 'assert';
import { Link } from 'react-router-dom';
import menus from './menus';

interface ItemProps {
  disabled?: boolean;
  path: string;

  [key: string]: any;
}

const renderMenus = (list, prefix: string[] = []) => {
  return list.map((item) => {
    assert(item.path, 'MenuItem.path is required');
    const path = resolve(...prefix, item.path);
    return createElement(SideMenuItem, {
      key: path,
      path,
      disabled: item.disabled,
      icon: item.icon,
      title: item.title,
      prefix: [...prefix, item.path]
    }, item.children);
  });
};

class SideMenuItem extends Component<ItemProps> {
  renderProps = () => {
    const props: any = {
      key: this.props.path,
      ...omit(this.props, ['title', 'children'])
    };
    if (this.props.children) {
      props.title = this.renderTitle();
    }
    return props;
  };

  renderIcon = () => {
    if (this.props.icon) {
      return createElement(Icon, {
        key: 'icon',
        type: this.props.icon
      });
    }
    return null;
  };

  renderTitle = () => {
    return createElement(Link, {
      to: this.props.path
    }, [
      this.renderIcon(),
      createElement('span', {
        key: 'title'
      }, this.props.title)
    ]);
  };

  renderChildren = () => {
    if (this.props.children) {
      return renderMenus(this.props.children, this.props.prefix);
    }
    return this.renderTitle();
  };

  renderComponent = () => {
    if (this.props.children) {
      return Menu.SubMenu;
    }
    return Menu.Item;
  };

  render() {
    return createElement(this.renderComponent(), this.renderProps(), this.renderChildren());
  }
}

export default class SideMenu extends Component {
  render() {
    return createElement(Menu, {
      theme: 'dark'
    }, renderMenus(menus));
  }
}
