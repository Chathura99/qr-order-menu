export const getImageById = async (imageId) => {
  const url = `${process.env.REACT_APP_DIRECTUS_URL}/assets/${imageId}`;
  console.log(url);
  return url;
};

export default getImageById;
