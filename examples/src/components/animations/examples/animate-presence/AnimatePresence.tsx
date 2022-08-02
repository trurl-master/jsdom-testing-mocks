import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

enum Presence {
  HIDDEN,
  IN_DOM,
  VISIBLE,
}

const AnimatePresence = ({ children }: { children: ReactNode | undefined }) => {
  const [presence, setPresence] = useState(Presence.HIDDEN);
  const ref = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }

    if (presence === Presence.IN_DOM) {
      const animation = ref.current.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        500
      );

      animation.addEventListener('finish', () => {
        setPresence(Presence.VISIBLE);
      });
    }
  }, [presence]);

  useEffect(() => {
    if (presence === Presence.HIDDEN && children) {
      setPresence(Presence.IN_DOM);
    }
  }, [presence, children]);

  return presence !== Presence.HIDDEN ? (
    <div ref={ref}>
      {children}
      {presence === Presence.VISIBLE && <div>Done!</div>}
    </div>
  ) : null;
};

const AnimationsReadme1 = () => {
  const [isShown, setIsShown] = useState(false);

  return (
    <div>
      <AnimatePresence>{isShown && <div>Hehey!</div>}</AnimatePresence>
      <button
        onClick={() => {
          setIsShown(true);
        }}
      >
        Show
      </button>
    </div>
  );
};

export default AnimationsReadme1;
