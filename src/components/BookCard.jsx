import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Button, Box, IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useNavigate } from 'react-router-dom';

function BookCard({ book, onRemove, onFavoriteToggle }) {
  const navigate = useNavigate();
  const workId = book.key ? book.key.replace('/works/', '') : '';

  const [isLibrary, setIsLibrary] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const library = JSON.parse(localStorage.getItem('myLibrary')) || [];
    const currentBook = library.find((b) => b.key === book.key);
    
    setIsLibrary(Boolean(currentBook));
    setIsFavorite(currentBook?.isFavorite || false);
  }, [book.key]);

  const handleToggleLibrary = () => {
    let library = JSON.parse(localStorage.getItem('myLibrary')) || [];
    if (isLibrary) {
      library = library.filter((b) => b.key !== book.key);
      if (onRemove) {
        onRemove(book.key);
      }
    } else {
      if (!library.some((b) => b.key === book.key)) {
        library.push({ ...book, isFavorite: isFavorite, status: 'want-to-read' });
      }
    }
    localStorage.setItem('myLibrary', JSON.stringify(library));
    setIsLibrary(!isLibrary);
  };

  const handleToggleFavorite = () => {
    let library = JSON.parse(localStorage.getItem('myLibrary')) || [];
    const existing = library.find((b) => b.key === book.key);

    if (existing) {
      library = library.map((b) => (b.key === book.key ? { ...b, isFavorite: !b.isFavorite } : b));
      setIsFavorite(!isFavorite);
    } else {
      library.push({ ...book, isFavorite: true, status: 'want-to-read' });
      setIsLibrary(true);
      setIsFavorite(true);
    }
    localStorage.setItem('myLibrary', JSON.stringify(library));

    if (onFavoriteToggle) {
      onFavoriteToggle();
    }
  };

  const getCoverUrl = () => {
    if (book.cover_i) {
      return `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;
    }
    return null;
  };

  const coverUrl = getCoverUrl();

  return (
    <Card 
      sx={{ 
        width: '210px',
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        backgroundColor: '#FFFDF9',
        border: '1px solid #E8DED0',
        boxShadow: '0 2px 8px rgba(60, 40, 25, 0.10)',
        position: 'relative',
        borderRadius: '4px',
        overflow: 'hidden'
      }}
    >
      
      {/* Heart Icon */}
      <IconButton 
        onClick={handleToggleFavorite} 
        sx={{ 
          position: 'absolute', 
          top: 8, 
          right: 8, 
          backgroundColor: 'rgba(255,255,255,0.85)',
          width: 34,
          height: 34,
          zIndex: 2,
          '&:hover': { backgroundColor: 'rgba(255,255,255,0.95)' }
        }}
        size="small"
      >
        {isFavorite ? <FavoriteIcon sx={{ color: '#D97706', fontSize: '1.2rem' }} /> : <FavoriteBorderIcon sx={{ fontSize: '1.2rem' }} />}
      </IconButton>

      {/* Book Cover */}
      {coverUrl ? (
        <Box
          component="img"
          src={coverUrl}
          alt={book.title}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
          sx={{ 
            width: '100%',
            height: '180px',
            objectFit: 'contain', 
            backgroundColor: '#F5F0E8',
            pt: 1.5
          }}
        />
      ) : (
        <Box 
          sx={{ 
            width: '100%',
            height: '180px',
            backgroundColor: '#F5F0E8', 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pt: 1.5
          }}
        >
          <MenuBookIcon sx={{ fontSize: '2.5rem', color: '#3E2723', mb: 0.5, opacity: 0.8 }} />
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#3E2723', 
              fontWeight: 600, 
              fontSize: '0.75rem',
              textAlign: 'center',
              lineHeight: 1.2
            }}
          >
            No Cover<br />Available
          </Typography>
        </Box>
      )}
      
      {/* Card Content */}
      <CardContent sx={{ flexGrow: 1, p: 1.5, pb: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Box>
          <Typography 
            variant="subtitle1" 
            component="div" 
            sx={{ 
              fontWeight: 'bold', 
              fontSize: '0.88rem', 
              lineHeight: 1.2, 
              mb: 0.8, 
              color: '#2C1810',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              height: '2.4em'
            }}
          >
            {book.title}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 0.5, 
              fontSize: '0.78rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {book.author_name ? book.author_name.join(', ') : (book.authors ? book.authors.map(a => a.name).join(', ') : 'Unknown Author')}
          </Typography>
        </Box>

        {book.first_publish_year && (
          <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.72rem', mt: 0.5 }}>
            Published: {book.first_publish_year}
          </Typography>
        )}
      </CardContent>
      
      {/* Action Buttons Section */}
      <Box sx={{ p: 1.5, pt: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Button 
          size="small" 
          variant={isLibrary ? "outlined" : "contained"} 
          onClick={handleToggleLibrary}
          sx={{ 
            backgroundColor: isLibrary ? 'transparent' : '#3E2723',
            color: isLibrary ? '#D97706' : '#ffffff',
            borderColor: isLibrary ? '#D97706' : '#3E2723',
            fontSize: '0.72rem',
            fontWeight: 600,
            py: 0.5,
            textTransform: 'none',
            '&:hover': { 
              backgroundColor: isLibrary ? 'rgba(217, 119, 6, 0.04)' : '#2C1810',
              borderColor: isLibrary ? '#D97706' : 'transparent'
            }
          }}
        >
          {isLibrary ? 'Remove from Library' : 'Add to Library'}
        </Button>

        {workId && (
          <Button 
            size="small" 
            variant="outlined" 
            onClick={() => navigate(`/book/${workId}`)}
            sx={{ 
              color: '#3E2723',
              borderColor: '#3E2723',
              fontSize: '0.72rem',
              fontWeight: 600,
              py: 0.5,
              textTransform: 'none',
              '&:hover': { 
                borderColor: '#2C1810',
                backgroundColor: 'rgba(62, 39, 35, 0.04)'
              }
            }}
          >
            View Details
          </Button>
        )}
      </Box>
    </Card>
  );
}

export default BookCard;