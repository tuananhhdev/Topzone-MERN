import React from "react";
import { Card, Row, Col, Table } from "antd";
import RevenueChart from "../components/RevenueChart";

const Dashboard: React.FC = () => {
  const productData = [
    { id: 1, name: "Product A", price: "$100", stock: 20 },
    { id: 2, name: "Product B", price: "$200", stock: 15 },
    { id: 3, name: "Product C", price: "$300", stock: 10 },
  ];

  const productColumns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Price", dataIndex: "price", key: "price" },
    { title: "Stock", dataIndex: "stock", key: "stock" },
  ];

  return (
    <div>
      <h2>Dashboard</h2>

      {/* Product Table */}
      <Card title="Product List" bordered={false} style={{ marginBottom: 16 }}>
        <Table dataSource={productData} columns={productColumns} rowKey="id" />
      </Card>

      {/* Revenue Chart */}
      <Card title="Revenue Chart" bordered={false}>
        <RevenueChart />
      </Card>
    </div>
  );
};

export default Dashboard;
