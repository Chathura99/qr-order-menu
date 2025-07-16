export const getImageById = async (imageId) => {
  const url = `${process.env.REACT_APP_DIRECTUS_URL}/assets/${imageId}?width=300&quality=50`;
  console.log(url);
  return url;
};

export default getImageById;
