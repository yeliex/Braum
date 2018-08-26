import * as React from 'react';
import * as ReactDom from 'react-dom';
import './style/index.less';

import('./routers').then(({default: App}) => {
  ReactDom.render((
    <App />
  ), window.document.getElementById('react-root'));
});
