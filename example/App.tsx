import * as React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import Nav from './Nav';

import GlobalObserver from './intersection-observer/global-observer/GlobalObserver';
import MeasureParent from './resize-observer/measure-parent/MeasureParent';
import PrintMySize from './resize-observer/print-my-size/PrintMySize';
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
          <Route path="/resize-observer/do-i-fit">
            <MeasureParent />
          </Route>
          <Route path="/resize-observer/print-my-size">
            <PrintMySize />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}
