import { api } from 'boot/axios';

export const getImageIds = async () => {
  const response = await api.get('/images');
  return response.data;
};

export const createImageVector = async (imageBinary) => {
  const formData = new FormData();
  formData.append('file', imageBinary);
  const response = await api.post('/images', formData);
  return response.data;
};

export const compareImageToOthers = async (imageId) => {
  const response = await api.get(`/images/${imageId}/comparison`);
  return response.data;
};

export const IMAGE_HOSTING_URL = 'http://localhost:8000/static/images/';
