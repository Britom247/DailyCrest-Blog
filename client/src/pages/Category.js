import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPosts } from '../services/api';
import moment from 'moment';
import Avatar from '../components/Avatar';

const Category = () => {
  const { category } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const data = await getPosts(currentPage, category, '', activeSearch);
        setPosts(data.posts);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [currentPage, category, activeSearch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setActiveSearch(searchInput.trim());
  };

  const clearSearch = () => {
    setSearchInput('');
    setActiveSearch('');
    setCurrentPage(1);
  };

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="container">
      <h1 style={{ margin: '2rem 0' }}>{category} Articles</h1>
      <form
        onSubmit={handleSearchSubmit}
        className="blog-search-bar"
      >
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder={`Search ${category} posts...`}
          className="blog-search-input"
        />
        <button type="submit" className="blog-search-btn blog-search-btn-primary">
          Search
        </button>
        {activeSearch && (
          <button type="button" onClick={clearSearch} className="blog-search-btn blog-search-btn-secondary">
            Clear
          </button>
        )}
      </form>

      {activeSearch && (
        <p className="blog-search-meta" style={{ marginTop: '-0.5rem' }}>
          Showing results for: <strong>{activeSearch}</strong>
        </p>
      )}

      <div className="posts-grid">
        {posts.map(post => {
          const authorName = post.authorName || post.author?.name || 'Admin';
          return (
          <Link to={`/post/${post.slug}`} key={post._id} style={{ textDecoration: 'none' }}>
            <article className="post-card">
              <div 
                className="post-card-image" 
                style={{ backgroundImage: `url(${post.featuredImage || 'https://via.placeholder.com/400x220'})` }}
              >
                <span className="post-card-category">{post.categories[0]}</span>
              </div>
              <div className="post-card-content">
                <h2 className="post-card-title">{post.title}</h2>
                <p className="post-card-excerpt">{post.excerpt}</p>
                <div className="post-card-meta">
                  <div className="post-card-author">
                    <Avatar src={post.author?.avatar} name={authorName} size={30} />
                    <span>{authorName}</span>
                  </div>
                  <span>{moment(post.publishedAt).format('MMM D, YYYY')}</span>
                </div>
              </div>
            </article>
          </Link>
        );
        })}
      </div>

      {!loading && posts.length === 0 && (
        <p style={{ margin: '2rem 0', textAlign: 'center' }}>
          No posts found{activeSearch ? ` for "${activeSearch}"` : ''} in {category}.
        </p>
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', margin: '3rem 0' }}>
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Category;
