import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navigation from '../components/Navigation';

const Layout = ({ children }) => {
  const location = useLocation();
  const [hideHeader, setHideHeader] = useState(false);

  useEffect(() => {
    setHideHeader(location.pathname === '/login' || location.pathname === '/register');
  }, [location.pathname]);
  return (
    <>
      {}
      {!hideHeader && <Navigation />}
      {children}
    </>
  );
};

export default Layout;
