export const loadImage = async (imageId) => {
  return `${process.env.REACT_APP_DIRECTUS_URL}/assets/${imageId}`;
};
