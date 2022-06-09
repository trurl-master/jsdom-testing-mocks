import * as React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

const Nav = (): React.ReactElement => (
  <nav>
    <ul
      style={{
        listStyleType: 'none',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <li style={{ marginRight: '2em' }}>
        <Link to="/intersection-observer">Intersection Observer</Link>
      </li>
      <li style={{ marginRight: '2em' }}>
        <Link to="/resize-observer/do-i-fit">Resize Observer: do I fit?</Link>
      </li>
      <li style={{ marginRight: '2em' }}>
        <Link to="/resize-observer/print-my-size">
          Resize Observer: print my size
        </Link>
      </li>
      <li style={{ marginRight: '2em' }}>
        <Link to="/viewport">Viewport</Link>
      </li>
      <li>
        <Link to="/viewport-deprecated">Viewport (old)</Link>
      </li>
    </ul>
  </nav>
);

export default Nav;
