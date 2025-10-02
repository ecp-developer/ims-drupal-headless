import React, { useState, useEffect } from 'react';
import { fetchContent } from '../services/api';
import type { DrupalNode, ContentType } from '../types/drupal';

interface Props {
  contentType: ContentType;
}

const ContentList: React.FC<Props> = ({ contentType }) => {
  const [content, setContent] = useState<DrupalNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        const response = await fetchContent(contentType);
        setContent(response.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [contentType]);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <span>Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="content-list">
      {content.length === 0 ? (
        <p className="empty-state">
          No {contentType} found.
        </p>
      ) : (
        content.map((item) => (
          <div key={item.id} className="content-item">
            <h4>{item.attributes.title}</h4>
            {item.attributes.body && (
              <div 
                className="content-body"
                dangerouslySetInnerHTML={{ __html: item.attributes.body.processed }} 
              />
            )}
            <div className="content-meta">
              <span className="badge">
                {contentType}
              </span>
              <span className="content-date">
                {new Date(item.attributes.created).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ContentList;
