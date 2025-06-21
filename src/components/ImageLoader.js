// src/components/ImageLoader.js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import getImageById from '../hooks/getImageById';

const ImageLoader = ({ imageId, altText, style }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const url = await getImageById(imageId); // Ensure this function returns the correct URL
        setImageUrl(url);
      } catch (err) {
        setError('Failed to load image');
      }
    };

    if (imageId) {
      fetchImage();
    }
  }, [imageId]);

  if (error) return <div>{error}</div>;
  if (!imageUrl) return <div>Loading...</div>;

  return <img src={imageUrl} alt={altText} style={style} />;
};

ImageLoader.propTypes = {
  imageId: PropTypes.string.isRequired,
  altText: PropTypes.string.isRequired,
  style: PropTypes.object,
};

export default ImageLoader;
