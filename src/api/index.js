import { api } from 'boot/axios';

export const fetchImageIds = async () => {
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

export const fetchCurrentModel = async () => {
  const response = await api.get('/current_model');
  return response.data;
};

export const fetchModels = async () => {
  const response = await api.get('/models');
  return response.data;
};

export const setCurrentModel = async (modelId) => {
  const response = await api.put(`/current_model/${modelId}`);
  return response.data;
};

export const IMAGE_HOSTING_URL = 'http://0.0.0.0:8000/static/images/';
