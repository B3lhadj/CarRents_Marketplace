
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './Navbar';

const Layout = ({ setThemeMode }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar setThemeMode={setThemeMode} />
      <Box component="main" sx={{ flexGrow: 1, mt: 8, p: 2 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
