import React from 'react';
import { Col, Row, Card, Typography, Table } from 'antd';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useTranslation } from 'react-i18next';

// Đăng ký các thành phần cần thiết
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Dữ liệu tạm thời
const chartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  datasets: [
    {
      label: 'Revenue',
      data: [1500, 2000, 1800, 2200, 2400, 2100, 3000],
      fill: false,
      backgroundColor: '#007bff',
      borderColor: '#007bff',
    },
  ],
};

const ProductDashboard: React.FC = () => {
  const { t } = useTranslation();

  const statsData = [
    // {
    //     icon: <LinkedinOutlined style={{ fontSize: 32, color: '#0077b5' }} />,
    //     title: "Amazing mates",
    //     count: "9.3k",
    // },
    // {
    //     icon: <YoutubeOutlined style={{ fontSize: 32, color: '#ff0000' }} />,
    //     title: "Lessons Views",
    //     count: "24k",
    // },
    // {
    //     icon: <InstagramOutlined style={{ fontSize: 32, color: '#e4405f' }} />,
    //     title: "New subscribers",
    //     count: "608",
    // },
    // {
    //     icon: <TikTokOutlined style={{ fontSize: 32, color: '#000' }} />,
    //     title: "Stream audience",
    //     count: "2.5k",
    // },
    { icon: '📈', count: '1,234', title: 'Analytics' },
    { icon: '🛒', count: '567', title: 'Orders' },
    { icon: '💼', count: '89', title: 'Clients' },
    { icon: '⭐', count: '123', title: 'Reviews' },
  ];

  const tableData = [
    {
      key: '1',
      name: 'Product A',
      price: '$20',
      category: 'Category 1',
      stock: 'In Stock',
    },
    {
      key: '2',
      name: 'Product B',
      price: '$35',
      category: 'Category 2',
      stock: 'Out of Stock',
    },
    {
      key: '3',
      name: 'Product C',
      price: '$15',
      category: 'Category 3',
      stock: 'In Stock',
    },
  ];

  const tableColumns = [
    {
      title: 'Product Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
    },
  ];

  return (
    <>

      <div style={{ padding: '24px' }}>
        <Typography.Title level={3}>
          {t('menu.dashboard.title')}
        </Typography.Title>

        {/* Thống kê tổng quan */}
        <Row
          gutter={[16, 16]}
          style={{ marginBottom: '24px', display: 'flex', flexWrap: 'wrap' }}
        >
          {statsData.map((item, index) => (
            <Col key={index} xs={24} sm={12} md={6} style={{ display: 'flex' }}>
              <Card
                bordered={false}
                style={{
                  flex: 1, // Đảm bảo các Card giãn đều
                  textAlign: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  borderRadius: '12px',
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>
                  {item.icon}
                </div>
                <h2 style={{ margin: 0 }}>{item.count}</h2>
                <p style={{ color: '#888' }}>{item.title}</p>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Biểu đồ và bảng */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '24px',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}
        >
          <Card
            bordered={false}
            style={{
              // flex: 1,
              // boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              // borderRadius: '12px',
              // minWidth: '300px',
              flex: 1,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              borderRadius: '12px',
              minWidth: '300px', // Đảm bảo card không quá hẹp
              height: '100%', // Đảm bảo chiều cao card đồng đều
            }}
          >
            <Typography.Title level={4}>Revenue Chart</Typography.Title>
            <Line data={chartData} />
          </Card>
          <Card
            bordered={false}
            style={{
              flex: 1,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              borderRadius: '12px',
              minWidth: '300px',
            }}
          >
            <Typography.Title level={4}>Product List</Typography.Title>
            <Table
              dataSource={tableData}
              columns={tableColumns}
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </div>
      </div>
    </>
  );
};

export default ProductDashboard;
