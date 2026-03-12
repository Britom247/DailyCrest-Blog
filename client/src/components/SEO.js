import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SEO = ({ 
  title, 
  description, 
  keywords,
  image,
  publishedTime,
  modifiedTime,
  author,
  type = 'website',
  schema // Optional custom schema
}) => {
  const location = useLocation();
  const siteTitle = 'DailyCrest';
  const siteUrl = process.env.REACT_APP_SITE_URL || 'https://dailycrest.com';
  const defaultDescription = 'Your Daily Peak of Knowledge - Insights on technology, business, and personal growth.';
  const defaultImage = `${siteUrl}/og-image.jpg`;
  
  // Construct URLs
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const metaDescription = description || defaultDescription;
  const metaImage = image || defaultImage;
  const metaUrl = `${siteUrl}${location.pathname}`;
  const metaAuthor = author || 'DailyCrest Team';
  const metaKeywords = keywords || 'technology, business, growth, insights, blog, Nigeria, learning, personal development';

  // Generate structured data (JSON-LD)
  const generateStructuredData = () => {
    if (schema) return schema;

    const baseSchema = {
      "@context": "https://schema.org",
      "@type": type === 'article' ? "Article" : "WebSite",
      "name": fullTitle,
      "description": metaDescription,
      "url": metaUrl,
      "image": metaImage,
      "author": {
        "@type": "Person",
        "name": metaAuthor
      },
      "publisher": {
        "@type": "Organization",
        "name": siteTitle,
        "logo": {
          "@type": "ImageObject",
          "url": `${siteUrl}/logo512.png`
        }
      }
    };

    if (type === 'article' && publishedTime) {
      return {
        ...baseSchema,
        "@type": "Article",
        "datePublished": publishedTime,
        "dateModified": modifiedTime || publishedTime,
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": metaUrl
        }
      };
    }

    return baseSchema;
  };

  const structuredData = generateStructuredData();

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />
      <meta name="author" content={metaAuthor} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="English" />
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />
      <meta name="twitter:site" content="@dailycrest" />
      <meta name="twitter:creator" content="@dailycrest" />

      {/* Article Meta */}
      {type === 'article' && (
        <>
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          <meta property="article:author" content={metaAuthor} />
          <meta property="article:section" content="Technology" />
          <meta property="article:tag" content={metaKeywords} />
        </>
      )}

      {/* Canonical URL */}
      <link rel="canonical" href={metaUrl} />

      {/* Alternate URLs for different languages/regions */}
      <link rel="alternate" href={metaUrl} hreflang="en" />
      <link rel="alternate" href={metaUrl} hreflang="x-default" />

      {/* Favicon */}
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />

      {/* Robots */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default SEO;