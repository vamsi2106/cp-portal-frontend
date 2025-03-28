import React, { useState } from 'react';
import { Layout, Menu, Dropdown, Avatar, Button } from 'antd';
import { Outlet, useLocation } from 'react-router-dom';
import { MenuOutlined, User } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { menuItems, profileMenu } from './config';

const { Header, Sider, Content } = Layout;

const MainLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    const { user } = useSelector((state: RootState) => state.auth);

    return (
        <Layout className="min-h-screen">
            <Sider
                theme="light"
                className="fixed left-0 top-0 bottom-0 shadow-lg transition-all duration-300 z-50"
                width={250}
                collapsible
                collapsed={collapsed}
                breakpoint="lg"
                collapsedWidth={0}
                onCollapse={(value) => setCollapsed(value)}
                className="fixed left-0 h-screen z-10 lg:relative backdrop-blur-sm"
            >
                <div className="h-16 flex items-center justify-center border-b">
                    <h1 className="text-xl font-bold text-blue-600 transition-all duration-300">
                        {!collapsed && 'Partner Portal'}
                    </h1>
                </div>
                <Menu
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    className="border-r-0 py-2"
                />
            </Sider>
            <Layout className="transition-all duration-300 lg:ml-[250px]">
                <Header className="bg-white/80 backdrop-blur-sm shadow-sm h-16 flex items-center justify-between px-4 md:px-6 sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <Button
                            type="text"
                            icon={<MenuOutlined className="text-gray-600" />}
                            onClick={() => setCollapsed(!collapsed)}
                            className="lg:hidden"
                        />
                        <h2 className="text-base md:text-lg font-semibold text-gray-800 hidden sm:block">
                            Channel Partner Portal
                        </h2>
                    </div>
                    <Dropdown overlay={profileMenu} trigger={['click']}>
                        <div className="flex items-center cursor-pointer space-x-2 hover:bg-gray-50 p-2 rounded-lg transition-colors">
                            <div className="flex flex-col items-end leading-tight hidden sm:flex">
                                <span className="font-medium text-gray-800">{user?.name}</span>
                                <span className="text-sm text-gray-500">{user?.id}</span>
                            </div>
                            <Avatar
                                size={40}
                                className="bg-blue-500 flex items-center justify-center shadow-sm"
                                icon={<User className="w-5 h-5" />}
                            />
                        </div>
                    </Dropdown>
                </Header>
                <Content className="m-2 sm:m-4 p-4 sm:p-6 bg-white rounded-xl shadow-sm">
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;