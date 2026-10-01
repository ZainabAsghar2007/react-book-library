import React, { useState, useEffect, useRef } from 'react';
import { Container, TextField, Box, Grid, Typography, CircularProgress, Button, Alert, Paper, List, ListItem, ListItemIcon, ListItemText, IconButton, InputAdornment, Pagination } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import HistoryIcon from '@mui/icons-material/History';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { searchBooks } from '../services/openLibraryApi';
import { useDebounce } from '../hooks/useDebounce';
import BookCard from '../components/BookCard';

const ITEMS_PER_PAGE = 20;

const CATEGORIES = [
  { name: 'Fiction', query: 'subject:fiction' },
  { name: 'Mystery', query: 'subject:mystery' },
  { name: 'Fantasy', query: 'subject:fantasy' },
  { name: 'Science Fiction', query: 'subject:science_fiction' },
  { name: 'History', query: 'subject:history' },
  { name: 'Poetry', query: 'subject:poetry' },
  { name: 'Biography', query: 'subject:biography' },
  { name: 'Self Help', query: 'subject:self_help' },
];

function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const initialQuery = searchParams.get('q') || '';
  const initialPage = parseInt(searchParams.get('page')) || 1;

  const getDisplayQuery = (q) => {
    const matched = CATEGORIES.find(cat => cat.query === q);
    return matched ? matched.name : q;
  };

  const [query, setQuery] = useState(getDisplayQuery(initialQuery));
  const [page, setPage] = useState(initialPage);
  
  const [allBooks, setAllBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('recentSearches')) || [];
    return [...new Set(saved)];
  });
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const searchBarRef = useRef(null);

  const isCategoryQuery = CATEGORIES.some(cat => cat.name.toLowerCase() === query.trim().toLowerCase());
  const debouncedQuery = useDebounce(isCategoryQuery ? '' : query, 300);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedQuery.trim() || isCategoryQuery) {
        setSuggestions([]);
        return;
      }
      try {
        const data = await searchBooks({ q: debouncedQuery, limit: 10 });
        const titles = (data.docs || [])
          .map(book => book.title)
          .filter(title => typeof title === 'string' && title.trim() !== '');
        
        setSuggestions([...new Set(titles)].slice(0, 6));
      } catch (err) {
        console.error(err);
        setSuggestions([]);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery, isCategoryQuery]);

  const fetchResults = async (targetQuery) => {
    if (!targetQuery.trim()) return;
    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const data = await searchBooks({
        q: targetQuery,
        limit: 100,
      });
      
      const validBooks = (data.docs || []).filter((book) => book.cover_i);
      setAllBooks(validBooks);
    } catch (err) {
      console.error(err);
      setError('Network error or failed to fetch books. Please check your internet connection.');
      setAllBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const q = searchParams.get('q');
    const p = parseInt(searchParams.get('page')) || 1;

    if (q) {
      setQuery(getDisplayQuery(q));
      setPage(p);
      fetchResults(q);
    }
  }, [searchParams]);

  const getApiQuery = (inputQuery) => {
    const trimmed = inputQuery.trim();
    const matched = CATEGORIES.find(cat => cat.name.toLowerCase() === trimmed.toLowerCase());
    return matched ? matched.query : trimmed;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    setIsFocused(false);
    const apiQuery = getApiQuery(trimmedQuery);

    const filteredHistory = recentSearches.filter(
      item => item.toLowerCase() !== trimmedQuery.toLowerCase()
    );
    let updatedHistory = [trimmedQuery, ...filteredHistory];
    if (updatedHistory.length > 5) updatedHistory = updatedHistory.slice(0, 5);
    
    setRecentSearches(updatedHistory);
    localStorage.setItem('recentSearches', JSON.stringify(updatedHistory));

    setSearchParams({ q: apiQuery, page: 1 });
  };

  const handleSelectSuggestion = (searchTerm) => {
    setQuery(searchTerm);
    setIsFocused(false);
    const apiQuery = getApiQuery(searchTerm);

    const filteredHistory = recentSearches.filter(
      item => item.toLowerCase() !== searchTerm.toLowerCase()
    );
    let updatedHistory = [searchTerm, ...filteredHistory];
    if (updatedHistory.length > 5) updatedHistory = updatedHistory.slice(0, 5);
    
    setRecentSearches(updatedHistory);
    localStorage.setItem('recentSearches', JSON.stringify(updatedHistory));

    setSearchParams({ q: apiQuery, page: 1 });
  };

  const handleDeleteItem = (e, termToDelete) => {
    e.stopPropagation(); 
    const updatedHistory = recentSearches.filter(item => item !== termToDelete);
    setRecentSearches(updatedHistory);
    localStorage.setItem('recentSearches', JSON.stringify(updatedHistory));
  };

  const handleClearHistory = (e) => {
    e.preventDefault();
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    const apiQuery = getApiQuery(query);
    setSearchParams({ q: apiQuery, page: value });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const currentBooks = allBooks.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(allBooks.length / ITEMS_PER_PAGE);

  const isQueryEmpty = !query.trim();
  const showDropdown = isFocused && ((isQueryEmpty && recentSearches.length > 0) || (!isQueryEmpty && suggestions.length > 0 && !isCategoryQuery));

  return (
    <Box sx={{ backgroundColor: '#FDFBF7', minHeight: '100vh', py: 5 }}>
      <Container maxWidth="lg">
        
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" sx={{ fontWeight: '800', color: '#2C1810', letterSpacing: '-0.5px', mb: 1 }}>
            Library Explorer
          </Typography>
          <Typography variant="body1" sx={{ color: '#665C54', fontSize: '1.05rem' }}>
            Discover millions of books, authors, and categories instantly.
          </Typography>
        </Box>
        
        <Box component="form" onSubmit={handleSearch} sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
          <Box 
            sx={{ 
              position: 'relative', 
              width: '100%',
              maxWidth: '950px',
              display: 'flex',
              alignItems: 'stretch',
              borderRadius: '50px',
              border: '2px solid #E6DCD0',
              backgroundColor: '#fff',
              overflow: 'visible',
              boxShadow: '0 4px 20px rgba(44, 24, 16, 0.03)',
              transition: 'all 0.2s ease',
              '&:hover': { borderColor: '#D97706' },
              '&:focus-within': { borderColor: '#3E2723', boxShadow: '0 4px 25px rgba(62, 39, 35, 0.08)' },
            }} 
            ref={searchBarRef}
          >
            <TextField
              fullWidth
              autoComplete="off"
              placeholder="Search by title, author, or ISBN..."
              variant="standard"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsFocused(true);
              }}
              onFocus={() => setIsFocused(true)}
              InputProps={{
                disableUnderline: true,
                startAdornment: (
                  <InputAdornment position="start" sx={{ pl: 3 }}>
                    <SearchIcon sx={{ color: '#8C7A6B', fontSize: '1.25rem' }} />
                  </InputAdornment>
                ),
                endAdornment: query && (
                  <InputAdornment position="end" sx={{ pr: 1 }}>
                    <IconButton 
                      size="small" 
                      onClick={() => setQuery('')}
                      edge="end"
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiInputBase-root': {
                  height: '100%',
                  py: 1.7,
                  px: 1,
                  fontSize: '1.02rem',
                }
              }}
            />

            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: '#3E2723',
                color: '#fff',
                borderRadius: '0 48px 48px 0',
                px: 5.5,
                textTransform: 'none',
                fontWeight: '600',
                fontSize: '1.02rem',
                boxShadow: 'none',
                flexShrink: 0,
                '&:hover': {
                  backgroundColor: '#2C1810',
                  boxShadow: 'none',
                }
              }}
            >
              Search
            </Button>

            {showDropdown && (
              <Paper 
                elevation={4} 
                sx={{ 
                  position: 'absolute', 
                  top: 'calc(100% + 10px)', 
                  left: 0, 
                  right: 0, 
                  zIndex: 99, 
                  borderRadius: '20px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #EAE0D5',
                  overflow: 'hidden',
                  boxShadow: '0 10px 30px rgba(44, 24, 16, 0.08)'
                }}
              >
                {isQueryEmpty && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2.5, py: 1.5, backgroundColor: '#FAF6F0', borderBottom: '1px solid #F0E6E0' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: '700', color: '#3E2723', fontSize: '0.85rem' }}>
                      RECENT SEARCHES
                    </Typography>
                    <Button 
                      size="small" 
                      onClick={handleClearHistory}
                      sx={{ fontSize: '0.75rem', color: '#D97706', textTransform: 'none', padding: 0, minWidth: 'auto', fontWeight: '600', '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' } }}
                    >
                      Clear all
                    </Button>
                  </Box>
                )}

                <List dense sx={{ py: 1 }}>
                  {isQueryEmpty && recentSearches.map((term, index) => (
                    <ListItem 
                      key={index} 
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelectSuggestion(term)}
                      sx={{ '&:hover': { backgroundColor: 'rgba(62, 39, 35, 0.04)' }, py: 1.2, px: 2.5, cursor: 'pointer' }}
                    >
                      <ListItemIcon sx={{ minWidth: '36px' }}>
                        <HistoryIcon fontSize="small" sx={{ color: '#8C7A6B' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={term} 
                        primaryTypographyProps={{ style: { fontSize: '0.95rem', color: '#2C1810', fontWeight: '500' } }} 
                      />
                      <IconButton 
                        size="small" 
                        onClick={(e) => handleDeleteItem(e, term)}
                        sx={{ color: '#A09080', '&:hover': { color: '#D97706' } }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </ListItem>
                  ))}

                  {!isQueryEmpty && suggestions.map((term, index) => {
                    const isInHistory = recentSearches.some(item => item.toLowerCase() === term.toLowerCase());
                    return (
                      <ListItem 
                        key={index} 
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelectSuggestion(term)}
                        sx={{ '&:hover': { backgroundColor: 'rgba(62, 39, 35, 0.04)' }, py: 1.2, px: 2.5, cursor: 'pointer' }}
                      >
                        <ListItemIcon sx={{ minWidth: '36px' }}>
                          {isInHistory ? (
                            <HistoryIcon fontSize="small" sx={{ color: '#8C7A6B' }} />
                          ) : (
                            <SearchIcon fontSize="small" sx={{ color: '#8C7A6B' }} />
                          )}
                        </ListItemIcon>
                        <ListItemText 
                          primary={term} 
                          primaryTypographyProps={{ style: { fontSize: '0.95rem', color: '#2C1810', fontWeight: '500' } }} 
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </Paper>
            )}
          </Box>
        </Box>

        {!hasSearched && (
          <Box sx={{ mt: 2, mb: 5 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: '700', color: '#2C1810', mb: 0.7 }}>
                Explore Books
              </Typography>
              <Typography variant="body2" sx={{ color: '#665C54' }}>
                Not sure what to read? Start exploring.
              </Typography>
            </Box>

            <Grid container spacing={2} justifyContent="center">
              {CATEGORIES.map((category) => (
                <Grid item xs={6} sm={4} md={3} key={category.name}>
                  <Button
                    fullWidth
                    onClick={() => {
                      setQuery(category.name);
                      setSearchParams({ q: category.query, page: 1 });
                    }}
                    sx={{
                      py: 2.2,
                      borderRadius: '16px',
                      backgroundColor: '#FFF',
                      border: '1px solid #E6DCD0',
                      color: '#3E2723',
                      fontWeight: '600',
                      textTransform: 'none',
                      boxShadow: '0 4px 14px rgba(44, 24, 16, 0.03)',
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        backgroundColor: '#FAF6F0',
                        borderColor: '#D97706',
                        transform: 'translateY(-3px)',
                        boxShadow: '0 6px 20px rgba(217, 119, 6, 0.12)',
                      }
                    }}
                  >
                    {category.name}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <CircularProgress sx={{ color: '#3E2723' }} />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
            {error}
          </Alert>
        )}

        {!loading && !error && hasSearched && currentBooks.length === 0 && (
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 6, fontSize: '1.1rem' }}>
            No books found matching your query. Try searching for something else!
          </Typography>
        )}

        <Grid container spacing={3} sx={{ mt: 1 }}>
          {currentBooks.map((book, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <BookCard book={book} />
            </Grid>
          ))}
        </Grid>

        {/* Client-side Pagination */}
        {!loading && hasSearched && totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6, mb: 4 }}>
            <Pagination 
              count={totalPages} 
              page={page} 
              onChange={handlePageChange} 
              color="primary"
              siblingCount={1}
              boundaryCount={1}
              sx={{
                '& .MuiPaginationItem-root': {
                  color: '#2C1810',
                  fontWeight: '600',
                  '&.Mui-selected': {
                    backgroundColor: '#3E2723',
                    color: '#ffffff',
                    '&:hover': {
                      backgroundColor: '#2C1810',
                    },
                  },
                },
              }}
            />
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default Search;