import * as React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

import Nav from './Nav';

import GlobalObserver from './intersection-observer/global-observer/GlobalObserver';
import CustomUseMedia from './viewport/custom-use-media/CustomUseMedia';

export default function App() {
  return (
    <Router>
      <div>
        <Nav />
        <Switch>
          <Route path="/intersection-observer">
            <GlobalObserver />
          </Route>
          <Route path="/viewport">
            <CustomUseMedia />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}
