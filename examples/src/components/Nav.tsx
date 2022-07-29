import * as React from 'react';
import { Link } from 'react-router-dom';

const Nav = (): React.ReactElement => (
  <nav>
    <ul
      style={{
        listStyleType: 'none',
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
      }}
    >
      <li>
        <Link to="/intersection-observer">Intersection Observer</Link>
      </li>
      <li>
        <Link to="/resize-observer/do-i-fit">Resize Observer: do I fit?</Link>
      </li>
      <li>
        <Link to="/resize-observer/print-my-size">
          Resize Observer: print my size
        </Link>
      </li>
      <li>
        <Link to="/viewport">Viewport</Link>
      </li>
      <li>
        <Link to="/viewport-deprecated">Viewport (old)</Link>
      </li>
      <li>
        <Link to="/animations">Animations</Link>
      </li>
    </ul>
  </nav>
);

export default Nav;
