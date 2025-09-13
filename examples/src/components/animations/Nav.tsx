import styles from './Nav.module.css';

const Nav = () => {
  return (
    <nav className={styles.nav}>
      <ul className={styles.list}>
        <li>
          <a href="/animations/in-view">Motion One InView</a>
        </li>
        <li>
          <a href="/animations/animate-presence">AnimatePresence</a>
        </li>
        <li>
          <a href="/animations/scroll-timeline">ScrollTimeline API</a>
        </li>
        <li>
          <a href="/animations/view-timeline">ViewTimeline API</a>
        </li>
      </ul>
    </nav>
  );
};

export default Nav;
