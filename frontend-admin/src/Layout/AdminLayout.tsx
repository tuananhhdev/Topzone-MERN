import React, { useState } from "react";
import { MenuFoldOutlined, MenuUnfoldOutlined, HomeOutlined, UserOutlined, SettingOutlined, LogoutOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { Button, Layout, Menu, theme, Avatar, Dropdown, Space, MenuProps } from "antd";
import { Link, Outlet } from "react-router-dom";
import logo from '../assets/img/logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThLarge } from '@fortawesome/free-solid-svg-icons';

const { Header, Sider, Content } = Layout;

const AdminLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();


    const menuItems: MenuProps["items"] = [
        {
            key: "1",
            icon: <UserOutlined />,
            label: <Link to="/profile">Profile</Link>, // Link đến trang Profile
        },
        {
            key: "2",
            icon: <SettingOutlined />,
            label: <Link to="/settings">Settings</Link>, // Link đến trang Settings
        },
        {
            type: "divider", // Dòng phân cách
        },
        {
            key: "3",
            icon: <LogoutOutlined />,
            label: <span onClick={() => console.log("Logout")}>Logout</span>, // Hành động Logout
        },
    ];

    return (
        <Layout className="h-screen" >
            {/* Sidebar */}
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                style={{ overflow: "auto" }}
                className="max-h-full"
            >
                {/* Logo section */}
                <div
                    style={{
                        height: "64px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "16px",
                        paddingTop: "30px",  // Thêm padding trên cho logo
                        paddingBottom: "30px", // Thêm padding dưới cho logo
                        transition: "all 0.3s ease",
                    }}
                >
                    <img
                        src={logo}  // Đường dẫn logo
                        alt="Admin Panel Logo"
                        style={{
                            width: collapsed ? "80px" : "120px",  // Thu nhỏ logo khi sidebar thu gọn
                            height: "auto",
                            transition: "width 0.3s ease", // Thêm hiệu ứng thu nhỏ logo
                        }}
                    />
                </div>

                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={["1"]}
                    items={[
                        {
                            key: "1",
                            icon: <HomeOutlined />,
                            label: <Link to="/">Dashboard</Link>,
                        },

                        {
                            key: "2",
                            icon: <ShoppingCartOutlined />,
                            label: "Products",
                            children: [
                                {
                                    key: "2-1",
                                    label: <Link to="/products/list">Product List</Link>, // Điều hướng tới trang danh sách sản phẩm
                                },
                                {
                                    key: "2-2",
                                    label: <Link to="/products/add">Add Product</Link>, // Điều hướng tới trang thêm sản phẩm
                                },
                                {
                                    key: "2-3",
                                    label: <Link to="/products/edit">Edit Product</Link>, // Điều hướng tới trang thêm sản phẩm
                                },
                            ],
                        },
                        {
                            key: "3",
                            icon: <FontAwesomeIcon icon={faThLarge} />,
                            label: <Link to={"/category"}>
                                Category
                            </Link>,
                        },
                    ]}
                />
            </Sider>

            {/* Main Layout */}
            <Layout>
                {/* Header */}
                <Header
                    style={{
                        padding: "0 16px",
                        background: colorBgContainer,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        margin: "24px 16px", // Thêm margin giống Content
                        borderRadius: borderRadiusLG, // Áp dụng borderRadius nếu cần thiết
                    }}
                >
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            fontSize: "16px",
                        }}
                    />
                    {/* Avatar with dropdown */}
                    <Dropdown
                        menu={{ items: menuItems }}
                        trigger={['hover']} // Hiển thị khi click
                        placement="bottomRight"
                    >
                        <Space
                            style={{
                                cursor: "pointer",
                                alignItems: "center",
                                display: "flex",
                            }}
                        >
                            <Avatar
                                size="large"
                                style={{
                                    backgroundColor: "#87d068",
                                }}
                                icon={<UserOutlined />}
                            />
                            {/* <span>Admin</span> */}
                        </Space>
                    </Dropdown>
                </Header>

                {/* Content */}
                <Content
                    style={{
                        margin: "24px 16px",  // Giữ margin giống Header
                        padding: 24,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                        flex: "1 1 auto",
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;
