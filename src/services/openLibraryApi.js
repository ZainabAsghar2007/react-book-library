const BASE_URL = 'https://openlibrary.org';

export async function searchBooks(params, signal) {
  const queryParams = typeof params === 'string' ? { q: params } : params;
  const url = new URL(`${BASE_URL}/search.json`);

  if (queryParams.q) url.searchParams.append('q', queryParams.q);
  if (queryParams.page) url.searchParams.append('page', queryParams.page);
  
  const limit = queryParams.limit || 20;
  url.searchParams.append('limit', limit);

  const response = await fetch(url.toString(), { signal });

  if (!response.ok) {
    throw new Error('Failed to fetch books from API');
  }

  const data = await response.json();

  // Sirf woh books rakhein jinke paas cover maujood ho
  const filteredDocs = (data.docs || []).filter((book) => book.cover_i);

  return {
    docs: filteredDocs,
    numFound: data.num_found || 0,
  };
}

export async function getBookDetails(id) {
  const response = await fetch(`${BASE_URL}/works/${id}.json`);

  if (!response.ok) {
    throw new Error('Failed to fetch book details');
  }

  return await response.json();
}