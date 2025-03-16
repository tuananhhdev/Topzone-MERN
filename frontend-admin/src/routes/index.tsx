import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import NotFound from '../pages/NotFound';
import ProductsList from '../pages/Products/ProductsList';
import ProductAdd from '../pages/Products/ProductAdd';
import ProductEdit from '../pages/Products/ProductEdit';
import CategoriesList from '../pages/Category/CategoriesList';
import AddCategory from '../pages/Category/AddCategory';
import EditCategory from '../pages/Category/EditCategory';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminLayout from '../Layout/AdminLayout';
import BrandList from '../pages/Brand/BrandList';
import AddBrand from '../pages/Brand/AddBrand';
import EditBrand from '../pages/Brand/EditBrand';

const queryClient = new QueryClient();

const AppRoutes: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <Router>
      <Routes>
        {/* Các route chung cho AdminLayout */}
        <Route path="/" element={<AdminLayout />}>
          {/* Trang chủ của Admin */}
          <Route index element={<Dashboard />} />
          {/* Route cho Product */}
          <Route path="product">
            <Route path="list" element={<ProductsList />} />
            <Route path="add" element={<ProductAdd />} />
            <Route path="edit/:id" element={<ProductEdit />} />
          </Route>
          {/* Route cho Category */}
          <Route path="category">
            <Route path="list" element={<CategoriesList />} />
            <Route path="add" element={<AddCategory />} />
            <Route path="edit/:slug" element={<EditCategory />} />
          </Route>
          {/* Route cho Brand */}
          <Route path="brand">
            <Route path="list" element={<BrandList />} />
            <Route path="add" element={<AddBrand />} />
            <Route path="edit/:slug" element={<EditBrand />} />
          </Route>
        </Route>
        {/* Route không thuộc layout */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  </QueryClientProvider>
);

export default AppRoutes;
