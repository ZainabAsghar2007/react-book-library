import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Grid, Typography, Button, CircularProgress, Box, IconButton, Select, MenuItem, FormControl, InputLabel, Chip, Paper } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { getBookDetails } from '../services/openLibraryApi';
import { useLocalStorage } from '../hooks/useLocalStorage';

// Helper function to convert text to Title Case
const toTitleCase = (str) => {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

function BookDetails() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savedBooks, setSavedBooks] = useLocalStorage('myLibrary', []);

  useEffect(() => {
    async function fetchDetails() {
      try {
        setLoading(true);
        const data = await getBookDetails(id);
        setBook({ ...data, key: `/works/${id}` });
      } catch (err) {
        setError('Failed to load book details.');
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchDetails();
  }, [id]);

  const existingBook = savedBooks.find((b) => b.key === `/works/${id}`);
  const isAlreadySaved = Boolean(existingBook);
  const isFavorite = existingBook?.isFavorite || false;
  const currentStatus = existingBook?.status || '';

  const handleToggleLibrary = () => {
    if (isAlreadySaved) {
      setSavedBooks(savedBooks.filter((b) => b.key !== `/works/${id}`));
    } else {
      setSavedBooks([...savedBooks, { ...book, isFavorite: false, status: 'want-to-read' }]);
    }
  };

  const handleToggleFavorite = () => {
    if (!isAlreadySaved) {
      setSavedBooks([...savedBooks, { ...book, isFavorite: true, status: 'want-to-read' }]);
    } else {
      setSavedBooks(
        savedBooks.map((b) => (b.key === `/works/${id}` ? { ...b, isFavorite: !b.isFavorite } : b))
      );
    }
  };

  const handleStatusChange = (event) => {
    const newStatus = event.target.value;
    if (!isAlreadySaved) {
      setSavedBooks([...savedBooks, { ...book, isFavorite: false, status: newStatus }]);
    } else {
      setSavedBooks(
        savedBooks.map((b) => (b.key === `/works/${id}` ? { ...b, status: newStatus } : b))
      );
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress sx={{ color: '#3E2723' }} /></Box>;
  if (error) return <Typography color="error" sx={{ textAlign: 'center', mt: 8 }}>{error}</Typography>;
  if (!book) return null;

  const descriptionText = typeof book.description === 'string' 
    ? book.description 
    : book.description?.value || 'No description available for this book.';

  const coverId = book.covers?.[0];
  const coverUrl = coverId 
    ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` 
    : 'https://placehold.co/200x300?text=No+Cover';

  let displaySubjects = book.subjects ? book.subjects.slice(0, 6).map(toTitleCase) : [];

  return (
    <Box sx={{ backgroundColor: '#FDFBF7', minHeight: '100vh', py: 5 }}>
      <Container maxWidth="lg">
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 3, md: 4 }, 
            backgroundColor: '#ffffff', 
            borderRadius: '20px', 
            border: '1px solid #E6DCD0',
            boxShadow: '0 4px 20px rgba(44, 24, 16, 0.03)'
          }}
        >
          <Grid container spacing={4} alignItems="flex-start">
            {/* Left Column: Cover & Actions */}
            <Grid item xs={12} sm={4} md={3.5}>
              <Box sx={{ position: 'relative', textAlign: 'center', maxWidth: '240px', mx: 'auto' }}>
                <img 
                  src={coverUrl} 
                  alt={book.title} 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/200x300?text=No+Cover';
                  }}
                  style={{ 
                    width: '100%', 
                    height: 'auto',
                    maxHeight: '340px', 
                    objectFit: 'cover', 
                    borderRadius: '12px', 
                    boxShadow: '0 6px 16px rgba(44, 24, 16, 0.1)' 
                  }} 
                />
                <IconButton 
                  onClick={handleToggleFavorite} 
                  sx={{ 
                    position: 'absolute', 
                    top: 10, 
                    right: 10, 
                    backgroundColor: 'rgba(255,255,255,0.9)', 
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                    '&:hover': { backgroundColor: '#fff' } 
                  }}
                  size="small"
                >
                  {isFavorite ? <FavoriteIcon sx={{ color: '#D97706', fontSize: '1.2rem' }} /> : <FavoriteBorderIcon sx={{ color: '#44403C', fontSize: '1.2rem' }} />}
                </IconButton>
              </Box>

              <Box sx={{ maxWidth: '240px', mx: 'auto' }}>
                <Button 
                  fullWidth 
                  variant="contained" 
                  onClick={handleToggleLibrary}
                  sx={{ 
                    mt: 2.5,
                    py: 1.2,
                    borderRadius: '10px',
                    backgroundColor: isAlreadySaved ? 'transparent' : '#3E2723',
                    color: isAlreadySaved ? '#3E2723' : '#ffffff',
                    borderColor: '#3E2723',
                    border: isAlreadySaved ? '1.5px solid #3E2723' : 'none',
                    boxShadow: 'none',
                    '&:hover': { 
                      backgroundColor: isAlreadySaved ? 'rgba(62, 39, 35, 0.04)' : '#2C1810',
                      borderColor: '#2C1810',
                      boxShadow: 'none'
                    },
                    fontWeight: '600',
                    textTransform: 'none',
                    fontSize: '0.95rem'
                  }}
                >
                  {isAlreadySaved ? 'Remove from Library' : 'Add to Library'}
                </Button>

                {isAlreadySaved && (
                  <FormControl fullWidth size="small" sx={{ mt: 2 }}>
                    <InputLabel sx={{ '&.Mui-focused': { color: '#3E2723' } }}>Reading Status</InputLabel>
                    <Select
                      value={currentStatus}
                      label="Reading Status"
                      onChange={handleStatusChange}
                      sx={{
                        borderRadius: '10px',
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3E2723' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#D97706' },
                      }}
                    >
                      <MenuItem value="want-to-read">Want to Read</MenuItem>
                      <MenuItem value="reading">Reading</MenuItem>
                      <MenuItem value="finished">Finished</MenuItem>
                    </Select>
                  </FormControl>
                )}
              </Box>
            </Grid>

            {/* Right Column: Title, Subjects & Description */}
            <Grid item xs={12} sm={8} md={8.5}>
              <Typography variant="h4" sx={{ fontWeight: '800', mb: 2, color: '#2C1810', letterSpacing: '-0.5px', fontSize: { xs: '1.8rem', md: '2.2rem' } }}>
                {book.title}
              </Typography>

              {/* Theme-matched Monochromatic Subjects / Tags */}
              {displaySubjects.length > 0 && (
                <Box sx={{ mb: 3.5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {displaySubjects.map((subject, index) => (
                    <Chip 
                      key={index} 
                      label={subject} 
                      size="small"
                      sx={{ 
                        backgroundColor: '#F5EBE0', 
                        color: '#5C3D2E', 
                        fontWeight: '600',
                        fontSize: '0.8rem',
                        border: '1px solid #E6DCD0',
                        borderRadius: '8px',
                        px: 0.5
                      }} 
                    />
                  ))}
                </Box>
              )}

              <Box sx={{ borderTop: '1px solid #F0E6E0', pt: 2.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: '700', mb: 1, color: '#2C1810', display: 'flex', alignItems: 'center', gap: 1, fontSize: '1.05rem', textAlign: 'left' }}>
                  <MenuBookIcon sx={{ fontSize: '1.1rem', color: '#D97706' }} /> Description
                </Typography>
                <Box sx={{ maxWidth: '750px' }}>
                  <Typography variant="body2" sx={{ lineHeight: 2.1, color: '#554D45', whiteSpace: 'pre-line', fontSize: '0.98rem', textAlign: 'left' }}>
                    {descriptionText}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}

export default BookDetails;