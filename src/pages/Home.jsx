import React, { useState, useEffect } from 'react';
import { Typography, Button, Container, Grid, Card, CardMedia, CardContent, Box, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import WhatshotIcon from '@mui/icons-material/Whatshot';

function Home() {
  const navigate = useNavigate();
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetching 8 popular classic books that have reliable covers
  useEffect(() => {
    fetch('https://openlibrary.org/search.json?q=classic&limit=12')
      .then((res) => res.json())
      .then((data) => {
        if (data.docs) {
          const booksWithCovers = data.docs.filter(book => book.cover_i && book.key).slice(0, 8);
          setFeaturedBooks(booksWithCovers);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching featured books:', err);
        setLoading(false);
      });
  }, []);

  const handleBookClick = (bookKey) => {
    const cleanId = bookKey.replace('/works/', '');
    navigate(`/book/${cleanId}`);
  };

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', pb: 8, backgroundColor: '#FDFBF7' }}>
      
      {/* Hero Section */}
      <Box 
        sx={{ 
          backgroundColor: '#FDF2E9',
          color: '#3E2723',
          pt: 10,
          pb: 10,
          px: 3,
          textAlign: 'center',
          borderBottomLeftRadius: '48px',
          borderBottomRightRadius: '48px',
          boxShadow: '0 15px 40px rgba(62, 39, 35, 0.08)',
          borderBottom: '2px solid #E6B89C'
        }}
      >
        <Container maxWidth="md">
          <Typography 
            variant="h2" 
            component="h1" 
            sx={{ 
              fontWeight: '800', 
              mb: 2.5, 
              color: '#2C1810', 
              letterSpacing: '-1.5px', 
              fontSize: { xs: '2.3rem', md: '3.5rem' },
              lineHeight: 1.2
            }}
          >
            Discover Your Next Favorite Book
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 4.5, 
              color: '#5C4033', 
              fontWeight: '400', 
              maxWidth: '620px', 
              mx: 'auto', 
              lineHeight: 1.6,
              fontSize: { xs: '1rem', md: '1.15rem' }
            }}
          >
            Explore millions of books via Open Library, read detailed descriptions, and curate your personal collection with ease.
          </Typography>
          
          <Button 
            variant="contained" 
            size="large" 
            endIcon={<ArrowForwardIcon />}
            sx={{ 
              backgroundColor: '#D97706', 
              color: '#ffffff',
              fontWeight: '700',
              '&:hover': { 
                backgroundColor: '#B45309',
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 30px rgba(217, 119, 6, 0.4)'
              }, 
              px: 5, 
              py: 1.8,
              fontSize: '1.05rem',
              borderRadius: '14px',
              textTransform: 'none',
              boxShadow: '0 8px 22px rgba(217, 119, 6, 0.3)',
              transition: 'all 0.2s ease-in-out'
            }}
            onClick={() => navigate('/search')}
          >
            Start Searching Books
          </Button>
        </Container>
      </Box>

      {/* Featured Books Section */}
      <Container maxWidth="lg" sx={{ mt: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, px: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ p: 1, backgroundColor: '#FEF3C7', borderRadius: '10px', display: 'flex' }}>
              <WhatshotIcon sx={{ color: '#D97706' }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: '800', color: '#2C1810', letterSpacing: '-0.5px' }}>
              Featured Books
            </Typography>
          </Box>
          <Button 
            variant="text" 
            endIcon={<ArrowForwardIcon sx={{ fontSize: '1rem !important' }} />}
            sx={{ 
              color: '#D97706', 
              fontWeight: 'bold', 
              textTransform: 'none',
              borderRadius: '8px',
              px: 2,
              '&:hover': { backgroundColor: '#FEF3C7' } 
            }}
            onClick={() => navigate('/search')}
          >
            Explore More
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress sx={{ color: '#D97706' }} />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {featuredBooks.map((book, index) => {
              const coverImg = `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;
              
              return (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card 
                    elevation={0}
                    onClick={() => handleBookClick(book.key)}
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      borderRadius: '16px',
                      border: '1px solid #e5e7eb',
                      backgroundColor: '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: '0 16px 30px rgba(62, 39, 35, 0.1)',
                        borderColor: '#D97706',
                        borderWidth: '1.5px',
                      }
                    }}
                  >
                    <Box 
                      sx={{ 
                        p: 3, 
                        display: 'flex', 
                        justifyContent: 'center', 
                        backgroundColor: '#FAFAF9', 
                        borderTopLeftRadius: '16px', 
                        borderTopRightRadius: '16px',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={coverImg}
                        alt={book.title}
                        sx={{ 
                          height: 200, 
                          width: 'auto', 
                          maxWidth: '100%', 
                          objectFit: 'contain',
                          boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                          borderRadius: '6px',
                          transition: 'transform 0.3s ease',
                          '&:hover': { transform: 'scale(1.03)' }
                        }}
                      />
                    </Box>
                    <CardContent 
                      sx={{ 
                        flexGrow: 1, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'space-between', 
                        p: 2.5, 
                        pb: '24px !important'
                      }}
                    >
                      <Box>
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            fontWeight: '700', 
                            fontSize: '0.95rem', 
                            mb: 1, 
                            color: '#2C1810',
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis', 
                            display: '-webkit-box', 
                            WebkitLineClamp: 1, 
                            WebkitBoxOrient: 'vertical' 
                          }}
                        >
                          {book.title}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#78716C',
                            fontSize: '0.85rem',
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis', 
                            display: '-webkit-box', 
                            WebkitLineClamp: 1, 
                            WebkitBoxOrient: 'vertical' 
                          }}
                        >
                          By {book.author_name ? book.author_name.join(', ') : 'Unknown'}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>
    </Box>
  );
}

export default Home;