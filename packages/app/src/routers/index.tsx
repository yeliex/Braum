import * as React from 'react';
import { ConnectedRouter } from 'connected-react-router';
import { Provider } from 'react-redux';
import { Route, Link, Switch } from 'react-router-dom';
import { Exception } from 'ant-design-pro';
import Store, { history } from '../models';
import Layout from '../components/layout';

history.listen((location: any) => {
  console.log(location);
  // const {match} = location;
  // Store.app.path({path: match.path || '/'});
});

const a = (props) => {
  return (
    <div>
      asd
    </div>
  );
};

const Routers = () => {
  return (
    <Provider store={Store}>
      <ConnectedRouter history={history}>
        <Switch>
          <Route path="/">
            <Switch>
              <Layout>
                <Switch>
                  <Route exact path="/" component={a} />
                  <Route>
                    <Exception linkElement={Link} type="404" />
                  </Route>
                </Switch>
              </Layout>
            </Switch>
          </Route>
        </Switch>
      </ConnectedRouter>
    </Provider>
  );
};

export default Routers;
