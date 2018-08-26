import * as React from 'react';
import { Icon } from 'antd';
import { HeaderSearch, NoticeIcon } from 'ant-design-pro';
import { Link } from 'react-router-dom';
import { ChildProps, ChildState } from '../layout';
import Style from './index.less';

interface HeaderProps extends ChildProps {

}

interface HeaderState extends ChildState {

}

export default class Header extends React.Component<HeaderProps, HeaderState> {
  render() {
    return (
      <div className={Style.header}>
        <Icon
          className="trigger"
          type={this.props.collapse ? 'menu-unfold' : 'menu-fold'}
          onClick={this.props.onCollapse}
        />
        <div className="right">
          <HeaderSearch
            defaultOpen
            placeholder="输入traceId/spanId/actionId搜索"
          />
          <Link target="_blank" to="/help">
            <Icon type="question-circle-o" />
          </Link>
          <NoticeIcon>
            <NoticeIcon.Tab title="报警">

            </NoticeIcon.Tab>
            <NoticeIcon.Tab title="通知">

            </NoticeIcon.Tab>
          </NoticeIcon>
        </div>
      </div>
    );
  }
}
