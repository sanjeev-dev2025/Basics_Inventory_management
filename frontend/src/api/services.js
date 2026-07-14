import api from './axios';

// Auth Services
export const login = (credentials) => api.post('/token/', credentials);
export const getProfile = () => api.get('/profile/');

// Dashboard & Reports Services
export const getDashboardData = () => api.get('/dashboard/');
export const getDailyReport = () => api.get('/daily-report/');
export const getMonthlyProfit = () => api.get('/monthly-profit/');
export const getLast7DaysProfit = () => api.get('/last-7-days-profit/');
export const getDailyReportCSV = () => api.get('/daily-report-csv/', { responseType: 'blob' });
export const getMonthlyReportCSV = () => api.get('/monthly-report-csv/', { responseType: 'blob' });

// Products Services
export const getProducts = (params) => api.get('/product/', { params }); // params for page, search, ordering
export const getProduct = (id) => api.get(`/product/${id}/`);
export const createProduct = (data) => api.post('/product/', data);
export const updateProduct = (id, data) => api.put(`/product/${id}/`, data);
export const patchProduct = (id, data) => api.patch(`/product/${id}/`, data);
export const deleteProduct = (id) => api.delete(`/product/${id}/`);

// Categories Services
export const getCategories = (params) => api.get('/category/', { params });
export const getCategory = (id) => api.get(`/category/${id}/`);
export const createCategory = (data) => api.post('/category/', data);
export const updateCategory = (id, data) => api.put(`/category/${id}/`, data);
export const patchCategory = (id, data) => api.patch(`/category/${id}/`, data);
export const deleteCategory = (id) => api.delete(`/category/${id}/`);

// Brands Services
export const getBrands = (params) => api.get('/brand/', { params });
export const getBrand = (id) => api.get(`/brand/${id}/`);
export const createBrand = (data) => api.post('/brand/', data);
export const updateBrand = (id, data) => api.put(`/brand/${id}/`, data);
export const patchBrand = (id, data) => api.patch(`/brand/${id}/`, data);
export const deleteBrand = (id) => api.delete(`/brand/${id}/`);

// Sales Services
export const getSales = (params) => api.get('/sale/', { params });
export const getSale = (id) => api.get(`/sale/${id}/`);
export const createSale = (data) => api.post('/sale/', data);
export const getSaleItems = (params) => api.get('/sale_item/', { params });
export const createSaleItem = (data) => api.post('/sale_item/', data);
