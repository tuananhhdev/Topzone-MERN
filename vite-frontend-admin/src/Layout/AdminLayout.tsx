import React, { useState } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import {
  Button,
  Layout,
  Menu,
  theme,
  Avatar,
  Dropdown,
  Space,
  MenuProps,
  ConfigProvider,
} from 'antd';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import logo from '../assets/img/logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThLarge } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import useTitle from '../hooks/useTitle';
import { TbBrandAppgallery } from 'react-icons/tb';
import brandImg from '../assets/img/brand-image.png';
const { Header, Sider, Content } = Layout;

const AdminLayout: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English');
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const { t, i18n } = useTranslation();

  const titles: { [key: string]: string } = {
    vn: 'Topzone - Bảng Điều Khiển',
    en: 'Topzone - Dashboard',
  };

  useTitle(titles[selectedLanguage] || 'Topzone - Dashboard');

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setSelectedLanguage(lang === 'en' ? 'English' : 'Vietnamese');
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const menuItems: MenuProps['items'] = [
    {
      key: '1',
      icon: <UserOutlined />,
      label: <Link to="/profile">{t('header.profile')}</Link>,
    },
    {
      key: '2',
      icon: <SettingOutlined />,
      label: <Link to="/settings">{t('header.settings')}</Link>,
    },
    {
      type: 'divider',
    },
    {
      key: '3',
      icon: <LogoutOutlined />,
      label: <span onClick={() => handleLogout()}>{t('header.logout')}</span>,
    },
  ];

  const EnglishIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 32 32"
    >
      <rect x="1" y="4" width="30" height="24" rx="4" ry="4" fill="#fff"></rect>
      <path
        d="M1.638,5.846H30.362c-.711-1.108-1.947-1.846-3.362-1.846H5c-1.414,0-2.65,.738-3.362,1.846Z"
        fill="#a62842"
      ></path>
      <path
        d="M2.03,7.692c-.008,.103-.03,.202-.03,.308v1.539H31v-1.539c0-.105-.022-.204-.03-.308H2.03Z"
        fill="#a62842"
      ></path>
      <path fill="#a62842" d="M2 11.385H31V13.231H2z"></path>
      <path fill="#a62842" d="M2 15.077H31V16.923000000000002H2z"></path>
      <path fill="#a62842" d="M1 18.769H31V20.615H1z"></path>
      <path
        d="M1,24c0,.105,.023,.204,.031,.308H30.969c.008-.103,.031-.202,.031-.308v-1.539H1v1.539Z"
        fill="#a62842"
      ></path>
      <path
        d="M30.362,26.154H1.638c.711,1.108,1.947,1.846,3.362,1.846H27c1.414,0,2.65-.738,3.362-1.846Z"
        fill="#a62842"
      ></path>
      <path d="M5,4h11v12.923H1V8c0-2.208,1.792-4,4-4Z" fill="#102d5e"></path>
      <path
        d="M27,4H5c-2.209,0-4,1.791-4,4V24c0,2.209,1.791,4,4,4H27c2.209,0,4-1.791,4-4V8c0-2.209-1.791-4-4-4Zm3,20c0,1.654-1.346,3-3,3H5c-1.654,0-3-1.346-3-3V8c0-1.654,1.346-3,3-3H27c1.654,0,3,1.346,3,3V24Z"
        opacity=".15"
      ></path>
      <path
        d="M27,5H5c-1.657,0-3,1.343-3,3v1c0-1.657,1.343-3,3-3H27c1.657,0,3,1.343,3,3v-1c0-1.657-1.343-3-3-3Z"
        fill="#fff"
        opacity=".2"
      ></path>
      <path
        fill="#fff"
        d="M4.601 7.463L5.193 7.033 4.462 7.033 4.236 6.338 4.01 7.033 3.279 7.033 3.87 7.463 3.644 8.158 4.236 7.729 4.827 8.158 4.601 7.463z"
      ></path>
      <path
        fill="#fff"
        d="M7.58 7.463L8.172 7.033 7.441 7.033 7.215 6.338 6.989 7.033 6.258 7.033 6.849 7.463 6.623 8.158 7.215 7.729 7.806 8.158 7.58 7.463z"
      ></path>
      <path
        fill="#fff"
        d="M10.56 7.463L11.151 7.033 10.42 7.033 10.194 6.338 9.968 7.033 9.237 7.033 9.828 7.463 9.603 8.158 10.194 7.729 10.785 8.158 10.56 7.463z"
      ></path>
      <path
        fill="#fff"
        d="M6.066 9.283L6.658 8.854 5.927 8.854 5.701 8.158 5.475 8.854 4.744 8.854 5.335 9.283 5.109 9.979 5.701 9.549 6.292 9.979 6.066 9.283z"
      ></path>
      <path
        fill="#fff"
        d="M9.046 9.283L9.637 8.854 8.906 8.854 8.68 8.158 8.454 8.854 7.723 8.854 8.314 9.283 8.089 9.979 8.68 9.549 9.271 9.979 9.046 9.283z"
      ></path>
      <path
        fill="#fff"
        d="M12.025 9.283L12.616 8.854 11.885 8.854 11.659 8.158 11.433 8.854 10.702 8.854 11.294 9.283 11.068 9.979 11.659 9.549 12.251 9.979 12.025 9.283z"
      ></path>
      <path
        fill="#fff"
        d="M6.066 12.924L6.658 12.494 5.927 12.494 5.701 11.799 5.475 12.494 4.744 12.494 5.335 12.924 5.109 13.619 5.701 13.19 6.292 13.619 6.066 12.924z"
      ></path>
      <path
        fill="#fff"
        d="M9.046 12.924L9.637 12.494 8.906 12.494 8.68 11.799 8.454 12.494 7.723 12.494 8.314 12.924 8.089 13.619 8.68 13.19 9.271 13.619 9.046 12.924z"
      ></path>
      <path
        fill="#fff"
        d="M12.025 12.924L12.616 12.494 11.885 12.494 11.659 11.799 11.433 12.494 10.702 12.494 11.294 12.924 11.068 13.619 11.659 13.19 12.251 13.619 12.025 12.924z"
      ></path>
      <path
        fill="#fff"
        d="M13.539 7.463L14.13 7.033 13.399 7.033 13.173 6.338 12.947 7.033 12.216 7.033 12.808 7.463 12.582 8.158 13.173 7.729 13.765 8.158 13.539 7.463z"
      ></path>
      <path
        fill="#fff"
        d="M4.601 11.104L5.193 10.674 4.462 10.674 4.236 9.979 4.01 10.674 3.279 10.674 3.87 11.104 3.644 11.799 4.236 11.369 4.827 11.799 4.601 11.104z"
      ></path>
      <path
        fill="#fff"
        d="M7.58 11.104L8.172 10.674 7.441 10.674 7.215 9.979 6.989 10.674 6.258 10.674 6.849 11.104 6.623 11.799 7.215 11.369 7.806 11.799 7.58 11.104z"
      ></path>
      <path
        fill="#fff"
        d="M10.56 11.104L11.151 10.674 10.42 10.674 10.194 9.979 9.968 10.674 9.237 10.674 9.828 11.104 9.603 11.799 10.194 11.369 10.785 11.799 10.56 11.104z"
      ></path>
      <path
        fill="#fff"
        d="M13.539 11.104L14.13 10.674 13.399 10.674 13.173 9.979 12.947 10.674 12.216 10.674 12.808 11.104 12.582 11.799 13.173 11.369 13.765 11.799 13.539 11.104z"
      ></path>
      <path
        fill="#fff"
        d="M4.601 14.744L5.193 14.315 4.462 14.315 4.236 13.619 4.01 14.315 3.279 14.315 3.87 14.744 3.644 15.44 4.236 15.01 4.827 15.44 4.601 14.744z"
      ></path>
      <path
        fill="#fff"
        d="M7.58 14.744L8.172 14.315 7.441 14.315 7.215 13.619 6.989 14.315 6.258 14.315 6.849 14.744 6.623 15.44 7.215 15.01 7.806 15.44 7.58 14.744z"
      ></path>
      <path
        fill="#fff"
        d="M10.56 14.744L11.151 14.315 10.42 14.315 10.194 13.619 9.968 14.315 9.237 14.315 9.828 14.744 9.603 15.44 10.194 15.01 10.785 15.44 10.56 14.744z"
      ></path>
      <path
        fill="#fff"
        d="M13.539 14.744L14.13 14.315 13.399 14.315 13.173 13.619 12.947 14.315 12.216 14.315 12.808 14.744 12.582 15.44 13.173 15.01 13.765 15.44 13.539 14.744z"
      ></path>
    </svg>
  );

  const VietnameseIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 32 32"
    >
      <rect
        x="1"
        y="4"
        width="30"
        height="24"
        rx="4"
        ry="4"
        fill="#c93728"
      ></rect>
      <path
        d="M27,4H5c-2.209,0-4,1.791-4,4V24c0,2.209,1.791,4,4,4H27c2.209,0,4-1.791,4-4V8c0-2.209-1.791-4-4-4Zm3,20c0,1.654-1.346,3-3,3H5c-1.654,0-3-1.346-3-3V8c0-1.654,1.346-3,3-3H27c1.654,0,3,1.346,3,3V24Z"
        opacity=".15"
      ></path>
      <path
        d="M27,5H5c-1.657,0-3,1.343-3,3v1c0-1.657,1.343-3,3-3H27c1.657,0,3,1.343,3,3v-1c0-1.657-1.343-3-3-3Z"
        fill="#fff"
        opacity=".2"
      ></path>
      <path
        fill="#ff5"
        d="M18.008 16.366L21.257 14.006 17.241 14.006 16 10.186 14.759 14.006 10.743 14.006 13.992 16.366 12.751 20.186 16 17.825 19.249 20.186 18.008 16.366z"
      ></path>
    </svg>
  );

  const languageMenu = (
    <Menu onClick={({ key }) => changeLanguage(key)}>
      <Menu.Item key="en">
        <Space onClick={() => changeLanguage('en')}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <EnglishIcon /> {t('actions.english')}
          </span>
        </Space>
      </Menu.Item>
      <Menu.Item key="vi">
        <Space onClick={() => changeLanguage('vi')}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <VietnameseIcon /> {t('actions.vietnamese')}
          </span>
        </Space>
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout className="h-full">
      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{ overflow: 'auto' }}
        className="max-h-full bg-[#000]"
      >
        {/* Logo section */}
        <div
          style={{
            height: '80px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: '40px', // Thêm padding trên cho logo
            paddingBottom: '40px', // Thêm padding dưới cho logo
            transition: 'all 0.3s ease',
          }}
        >
          <Link to={'/'}>
            <img
              src={logo} // Đường dẫn logo
              alt="Admin Panel Logo"
              style={{
                width: collapsed ? '80px' : '120px', // Thu nhỏ logo khi sidebar thu gọn
                height: 'auto',
                transition: 'width 0.3s ease', // Thêm hiệu ứng thu nhỏ logo
              }}
            />
          </Link>
        </div>
        <ConfigProvider
        // theme={{
        //   token: {
        //     colorBgMenuItemSelected: '#444', // Màu mục được chọn
        //     colorBgMenuItemHover: '#333', // Màu khi hover
        //     colorPrimary: '#000', // Màu chủ đạo (nền menu)
        //     colorText: '#fff', // Màu chữ
        //   },
        // }}
        >
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={['1']}
            style={{
              backgroundColor: '#000', // Màu nền menu
              color: '#fff', // Màu chữ
            }}
            items={[
              {
                key: '1',
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    className="size-6"
                    width="18" // Kích thước rộng
                    height="18" // Kích thước cao
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                    />
                  </svg>
                ),
                label: <Link to="/">{t('menu.dashboard.title')}</Link>,
              },

              {
                key: '2',
                icon: <ShoppingCartOutlined />,
                label: t('menu.products.title'),
                children: [
                  {
                    key: '2-1',
                    label: (
                      <Link to="/product/list">{t('menu.products.list')}</Link>
                    ), // Điều hướng tới trang danh sách sản phẩm
                  },
                  {
                    key: '2-2',
                    label: (
                      <Link to="/product/add">{t('menu.products.add')}</Link>
                    ), // Điều hướng tới trang thêm sản phẩm
                  },
                ],
              },
              {
                key: '3',
                icon: <FontAwesomeIcon icon={faThLarge} />,
                label: t('menu.categories.title'),
                children: [
                  {
                    key: '3-1',
                    label: (
                      <Link to="/category/list">
                        {t('menu.categories.list')}
                      </Link>
                    ), // Điều hướng tới trang danh sách sản phẩm
                  },
                  {
                    key: '3-2',
                    label: (
                      <Link to="/category/add">{t('menu.categories.add')}</Link>
                    ), // Điều hướng tới trang thêm sản phẩm
                  },
                ],
              },
              {
                key: '4',
                icon: <TbBrandAppgallery className="size-6" />,
                label: t('menu.brand.title'),
                children: [
                  {
                    key: '4-1',
                    label: <Link to="/brand/list">{t('menu.brand.list')}</Link>,
                  },
                  {
                    key: '4-2',
                    label: <Link to="/brand/add">{t('menu.brand.add')}</Link>,
                  },
                ],
              },
            ]}
          />
        </ConfigProvider>
      </Sider>

      {/* Main Layout */}
      <Layout>
        {/* Header */}
        <Header
          style={{
            padding: '0 16px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            margin: '24px 16px',
            borderRadius: borderRadiusLG,
          }}
        >
          {/* Button Toggle Sidebar */}
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
            }}
          />

          {/* Right Content: Language Switch + Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
            {/* Dropdown for Language Switch */}
            <Dropdown overlay={languageMenu} trigger={['hover']}>
              <Button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                }}
              >
                {/* Icon SVG của bạn */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  style={{
                    width: '1.5rem',
                    height: '1.5rem',
                    marginRight: '0.5rem',
                  }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802"
                  />
                </svg>
                {selectedLanguage}
              </Button>
            </Dropdown>

            {/* Avatar Dropdown */}
            <Dropdown
              menu={{ items: menuItems }}
              trigger={['hover']}
              placement="bottomRight"
            >
              <Space
                style={{
                  cursor: 'pointer',
                  alignItems: 'center',
                  display: 'flex',
                }}
              >
                <Avatar
                  size="large"
                  style={{
                    backgroundColor: '#87d068',
                  }}
                  icon={<UserOutlined />}
                />
              </Space>
            </Dropdown>
          </div>
        </Header>

        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            flex: '1 1 auto',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
