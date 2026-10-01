import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Search from './pages/Search';
import Library from './pages/Library';
import BookDetails from './pages/BookDetails';

function NotFound() {
  return(
    <Box sx={{ textAlign: 'center', mt: 8 }}>
      <Typography variant='h4' sx={{ fontWeight: 'bold', mb: 2, color: '#3E2723' }}>
        404 - Page Not Found
      </Typography>
      
      <Typography variant='body1' sx={{ color: '#5C4033' }}>
        The page you are looking for does not exist.
      </Typography>
    </Box>
  )
}

function App() {
  return (
    <Router>
      <Box sx={{ backgroundColor: '#FDFBF7', minHeight: '100vh' }}>
        <Navbar />
        <Routes>
          <Route path='/' element={<Home/>} />
          <Route path='/search' element={<Search/>} />
          <Route path='/book/:id' element={<BookDetails />} />
          <Route path='/library' element={<Library/>} />
          <Route path='*' element={<NotFound/>} />
        </Routes>
      </Box>
    </Router>
  );
}

export default App;