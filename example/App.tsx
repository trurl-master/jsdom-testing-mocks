import * as React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import Nav from './Nav';

import GlobalObserver from './intersection-observer/global-observer/GlobalObserver';
import MeasureParent from './resize-observer/measure-parent/MeasureParent';
import PrintMySize from './resize-observer/print-my-size/PrintMySize';
import CustomUseMedia from './viewport/custom-use-media/CustomUseMedia';

export default function App() {
  return (
    <BrowserRouter>
      <div>
        <Nav />
        <Switch>
          <Route path="/intersection-observer" component={GlobalObserver} />
          <Route path="/viewport" component={CustomUseMedia} />
          <Route path="/resize-observer/do-i-fit" component={MeasureParent} />
          <Route
            path="/resize-observer/print-my-size"
            component={PrintMySize}
          />
        </Switch>
      </div>
    </BrowserRouter>
  );
}
