import React from 'react';
import ProductDashboard from '../components/ProductDashboard';
import useTitle from '../hooks/useTitle';

const Dashboard: React.FC = () => {
  useTitle('Topzone - Dashboard');

  return (
    <>
      <ProductDashboard />
    </>
  );
};

export default Dashboard;
