import { createBrowserHistory } from 'history';
import { applyMiddleware, compose } from 'redux';
import { routerMiddleware, connectRouter } from 'connected-react-router';
import Store, { combine, create } from 'store-decorator';

import app from './app';
import sideMenu from './side-menu';

const models = {
  app,
  sideMenu
};

combine(models);

export const history = createBrowserHistory();

const composeEnhancer: typeof compose = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const initialState = (window as any).__INITIAL_STATE__ || {};

create(
  (reducer) => connectRouter(history)(reducer),
  initialState,
  composeEnhancer(
    applyMiddleware(routerMiddleware(history))
  )
);

export default Store();
