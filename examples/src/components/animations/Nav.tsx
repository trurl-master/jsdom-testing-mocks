import styles from './Nav.module.css';

const Nav = () => {
  return (
    <nav className={styles.nav}>
      <ul className={styles.list}>
        <li>
          <a href="/animations/in-view">Motion One InView</a>
        </li>
      </ul>
    </nav>
  );
};

export default Nav;
