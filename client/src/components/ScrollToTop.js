import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    // useLayoutEffect runs synchronously after DOM mutations but before paint
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;