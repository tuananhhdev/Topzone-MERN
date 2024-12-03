import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminLayout from '../Layout/AdminLayout';
import Dashboard from '../pages/Dashboard';
import Users from '../pages/User';
import NotFound from '../pages/NotFound';
import ProductsList from '../pages/Products/ProductsList';
import ProductAdd from '../pages/Products/ProductAdd';
import ProductEdit from '../pages/Products/ProductEdit';
import Category from '../pages/Category/Category';


const AppRoutes: React.FC = () => (
    <Router>
        <Routes>
            <Route path="/" element={<AdminLayout />}>
                {/* Các route con sử dụng chung layout */}
                <Route index element={<Dashboard />} />
                <Route path="users" element={<Users />} />
                <Route path="products">
                    <Route path="list" element={<ProductsList />} />
                    <Route path="add" element={<ProductAdd />} />
                    <Route path="edit" element={<ProductEdit />} />
                </Route>
                <Route path='category' element={<Category />} />
            </Route>
            {/* Route không thuộc layout */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    </Router>
);

export default AppRoutes;
