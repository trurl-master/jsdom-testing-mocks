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
      <li>
        <Link to="/viewport">Viewport</Link>
      </li>
    </ul>
  </nav>
);

export default Nav;
