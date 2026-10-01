import React, { useState } from 'react';
import { Container, Typography, Grid, Box, Button, Tabs, Tab } from '@mui/material';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useNavigate } from 'react-router-dom';
import BookCard from '../components/BookCard';

function Library() {
  const [savedBooks, setSavedBooks] = useLocalStorage('myLibrary', []);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  const handleFilterChange = (event, newValue) => {
    setFilter(newValue);
  };

  const filteredBooks = savedBooks.filter((book) => {
    if (filter === 'all') return true;
    if (filter === 'favorites') return book.isFavorite;
    return book.status === filter;
  });

  return (
    <Box sx={{ backgroundColor: '#FDFBF7', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
        
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2C1810', mb: 1 }}>
            My Saved Library
          </Typography>
          <Typography variant="body1" sx={{ color: '#665C54' }}>
            Manage and view all your favorite books stored in one place.
          </Typography>
        </Box>

        {/* Tabs */}
        {savedBooks.length > 0 && (
          <Tabs 
            value={filter} 
            onChange={handleFilterChange} 
            centered
            sx={{ 
              mb: 4, 
              borderBottom: '1px solid #EAE0D5',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: '600',
                color: '#665C54',
                fontSize: '0.95rem',
                px: 3.5,
                mx: 0.5,
                '&.Mui-selected': {
                  color: '#3E2723',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#3E2723',
                height: '3px',
                borderRadius: '3px 3px 0 0',
              }
            }}
          >
            <Tab label="All Books" value="all" />
            <Tab label="Want to Read" value="want-to-read" />
            <Tab label="Reading" value="reading" />
            <Tab label="Finished" value="finished" />
            <Tab label="Favorites" value="favorites" />
          </Tabs>
        )}

        {/* Empty State */}
        {savedBooks.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Typography variant="h6" sx={{ color: '#2C1810', mb: 2, fontWeight: '600' }}>
              Your library is empty.
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/search')}
              sx={{ 
                backgroundColor: '#3E2723', 
                color: '#fff', 
                borderRadius: '4px',
                px: 4,
                py: 1.2,
                textTransform: 'none',
                fontWeight: '600',
                boxShadow: 'none',
                '&:hover': { 
                  backgroundColor: '#2C1810',
                  boxShadow: 'none' 
                } 
              }}
            >
              Explore Books
            </Button>
          </Box>
        ) : filteredBooks.length === 0 ? (
          <Typography variant="body1" sx={{ mt: 4, textAlign: 'center', color: '#665C54' }}>
            No books found in this category.
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {filteredBooks.map((book, index) => {
              return (
                <Grid item xs={12} sm={6} md={3} key={book.key || index} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <BookCard 
                    book={book} 
                    onRemove={(bookKey) => {
                      const updatedBooks = savedBooks.filter((b) => b.key !== bookKey);
                      setSavedBooks(updatedBooks);
                    }} 
                    onFavoriteToggle={() => {
                      const latestLibrary = JSON.parse(localStorage.getItem('myLibrary')) || [];
                      setSavedBooks(latestLibrary);
                    }}
                  />
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>
    </Box>
  );
}

export default Library;