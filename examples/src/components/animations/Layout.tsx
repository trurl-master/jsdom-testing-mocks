import { Outlet } from 'react-router-dom';
import Nav from './Nav';

import styles from './Layout.module.css';

export const Layout = () => {
  return (
    <div className={styles.container}>
      <aside>
        <Nav />
      </aside>
      <main>
        <Outlet />
      </main>
    </div>
  );
};
