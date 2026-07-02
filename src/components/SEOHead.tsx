import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  author?: string;
  publishedTime?: string;
  tags?: string[];
}

const DEFAULT_TITLE = 'TMQ – A Minimalist Writing & Poetry Platform';
const DEFAULT_DESCRIPTION = 'A minimalist sanctuary for writers and poets. Create, refine, and share your work in an environment designed for focus.';
const DEFAULT_IMAGE = 'https://lovable.dev/opengraph-image-p98pqg.png';

export function SEOHead({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  author,
  publishedTime,
  tags = [],
}: SEOHeadProps) {
  const fullTitle = title ? `${title} | TMQ` : DEFAULT_TITLE;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      {url && <meta property="og:url" content={url} />}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Article specific */}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && tags.length > 0 && (
        <meta property="article:tag" content={tags.join(', ')} />
      )}
      
      {/* Canonical URL */}
      {url && <link rel="canonical" href={url} />}
    </Helmet>
  );
}
