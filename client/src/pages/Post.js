import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPostBySlug, getRelatedPostsBySlug } from '../services/api';
import { Helmet } from 'react-helmet-async';
import moment from 'moment';
import { FaFacebookF, FaLinkedinIn, FaWhatsapp, FaLink, FaInstagram } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import Avatar from '../components/Avatar';
import SEO from '../components/SEO';
import Comments from '../components/Comments';

const Post = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const data = await getPostBySlug(slug);
        setPost(data);
        const related = await getRelatedPostsBySlug(slug, 3);
        setRelatedPosts(related);
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) return <div className="spinner"></div>;
  if (!post) return <div>Post not found</div>;

  const shareUrl = typeof window !== 'undefined'
    ? window.location.href
    : `${process.env.REACT_APP_SITE_URL || 'http://localhost:3000'}/post/${post.slug}`;
  const displayAuthorName = post.authorName || post.author?.name || 'Admin';
  const shareTitle = encodeURIComponent(post.title);
  const shareLink = encodeURIComponent(shareUrl);

  const shareTargets = [
    {
      key: 'facebook',
      name: 'Facebook',
      icon: <FaFacebookF />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${shareLink}`
    },
    {
      key: 'twitter',
      name: 'Twitter',
      icon: <FaXTwitter />,
      href: `https://twitter.com/intent/tweet?url=${shareLink}&text=${shareTitle}`
    },
    {
      key: 'linkedin',
      name: 'LinkedIn',
      icon: <FaLinkedinIn />,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${shareLink}`
    },
    {
      key: 'instagram',
      name: 'Instagram',
      icon: <FaInstagram />,
      href: `https://www.instagram.com/?url=${shareLink}`
    },
    {
      key: 'whatsapp',
      name: 'WhatsApp',
      icon: <FaWhatsapp />,
      href: `https://wa.me/?text=${shareTitle}%20${shareLink}`
    }
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  return (
    <>
      <SEO 
        title={post.title}
        description={post.excerpt}
        keywords={post.tags?.join(', ')}
        image={post.featuredImage}
        publishedTime={post.publishedAt}
        modifiedTime={post.updatedAt}
        author={displayAuthorName}
        type="article"
      />
      <Helmet>
        <title>{post.title} | DailyCrest</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        {post.featuredImage && <meta property="og:image" content={post.featuredImage} />}
      </Helmet>

      <div className="container">
        <article>
          <header className="post-header">
            <h1 className="post-title">{post.title}</h1>
            <div className="post-meta">
              <span>By {displayAuthorName}</span>
              <span>{moment(post.publishedAt).format('MMMM D, YYYY')}</span>
              <span>{post.readTime} min read</span>
            </div>
          </header>

          {post.featuredImage && (
            <img 
              src={post.featuredImage} 
              alt={post.title}
              className="post-featured-image"
            />
          )}

          <div 
            className="post-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
            <h3 style={{ marginBottom: '1rem' }}>Share this post</h3>
            <div className="share-actions">
              {shareTargets.map(target => (
                <a
                  key={target.name}
                  href={target.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`share-btn share-btn-${target.key}`}
                  aria-label={target.name}
                  title={target.name}
                >
                  <span className="share-icon">{target.icon}</span>
                  <span className="share-label">{target.name}</span>
                </a>
              ))}

              <button
                type="button"
                onClick={handleCopyLink}
                className="share-btn share-btn-copy"
                aria-label={copied ? 'Link copied' : 'Copy post link'}
                title={copied ? 'Link copied' : 'Copy Link'}
              >
                <span className="share-icon"><FaLink /></span>
                <span className="share-label">{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div style={{ marginTop: '3rem', padding: '2rem 0', borderTop: '1px solid #eee' }}>
              <h3>Tags:</h3>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                {post.tags.map(tag => (
                  <span 
                    key={tag}
                    style={{
                      background: '#f0f0f0',
                      padding: '0.3rem 1rem',
                      borderRadius: '20px',
                      fontSize: '0.9rem'
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Author Bio */}
          {post.author?.bio && (
            <div style={{ 
              background: '#f5f7fa', 
              padding: '2rem', 
              borderRadius: '12px',
              margin: '2rem 0' 
            }}>
              <h3>About the Author</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                <Avatar src={post.author.avatar} name={post.author.name} size={60} />
                <div>
                  <h4>{post.author.name}</h4>
                  <p>{post.author.bio}</p>
                </div>
              </div>
            </div>
          )}

          {relatedPosts.length > 0 && (
            <section className="related-posts-section">
              <h3>Related Posts</h3>
              <div className="related-posts-grid">
                {relatedPosts.map(related => (
                  <Link
                    key={related._id}
                    to={`/post/${related.slug}`}
                    className="related-post-card"
                  >
                    <div className="related-post-image-wrap">
                      <img
                        src={related.featuredImage || 'https://via.placeholder.com/320x180'}
                        alt={related.title}
                        className="related-post-image"
                      />
                    </div>
                    <div className="related-post-content">
                      <h4>{related.title}</h4>
                      <p>{related.excerpt}</p>
                      <small>{moment(related.publishedAt).format('MMM D, YYYY')}</small>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Comments section */}
          <Comments postId={post._id} postTitle={post.title} />
        </article>
      </div>
    </>
  );
};

export default Post;
