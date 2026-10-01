import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';

function Navbar() {
  return (
    <AppBar position="static" sx={{ backgroundColor: '#3E2723' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LibraryBooksIcon />
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            Book Library
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/"
            sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' } }}
          >
            Home
          </Button>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/search"
            sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' } }}
          >
            Search
          </Button>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/library"
            sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' } }}
          >
            My Library
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;