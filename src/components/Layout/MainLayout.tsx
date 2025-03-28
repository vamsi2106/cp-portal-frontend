import React from 'react';
import { Layout, Menu, Avatar, Dropdown } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, PhoneCall, LogOut, User } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { RootState } from '../../redux/store';

const { Header, Sider, Content } = Layout;

const MainLayout: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth.user);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const menuItems = [
        {
            key: 'dashboard',
            icon: <LayoutDashboard className="w-5 h-5" />,
            label: 'Dashboard',
            onClick: () => navigate('/dashboard'),
        },
        {
            key: 'partners',
            icon: <Users className="w-5 h-5" />,
            label: 'Partners',
            onClick: () => navigate('/partners'),
        },
        {
            key: 'leads',
            icon: <PhoneCall className="w-5 h-5" />,
            label: 'Leads',
            onClick: () => navigate('/leads'),
        },
    ];

    const profileMenu = (
        <Menu>
            <Menu.Item
                key="profile"
                icon={<User className="w-4 h-4" />}
                onClick={() => navigate('/profile')}
            >
                Profile
            </Menu.Item>
            <Menu.Item
                key="logout"
                icon={<LogOut className="w-4 h-4" />}
                onClick={handleLogout}
                danger
            >
                Logout
            </Menu.Item>
        </Menu>
    );

    return (
        <Layout className="min-h-screen">
            <Sider
                theme="light"
                className="fixed left-0 top-0 bottom-0 shadow-lg"
                width={250}
            >
                <div className="h-16 flex items-center justify-center border-b">
                    <h1 className="text-xl font-bold text-blue-600">Partner Portal</h1>
                </div>
                <Menu
                    mode="inline"
                    className="h-[calc(100vh-64px)] border-r-0"
                    items={menuItems}
                />
            </Sider>
            <Layout className="ml-[250px]">
                <Header className="bg-white shadow-sm h-16 flex items-center justify-between px-6">
                    <h2 className="text-lg font-semibold text-gray-800">Channel Partner Portal</h2>
                    <Dropdown overlay={profileMenu} trigger={['click']}>
                        <div className="flex items-center cursor-pointer space-x-2">
                            <div className="flex flex-col items-end leading-tight">
                                <span className="font-medium text-gray-800">{user?.name}</span>
                                <span className="text-sm text-gray-500">{user?.id}</span>
                            </div>
                            <Avatar
                                size={40}
                                className="bg-blue-500 flex items-center justify-center"
                                icon={<User className="w-5 h-5" />}
                            />
                        </div>

                    </Dropdown>
                </Header>
                <Content className="p-6 bg-gray-50">
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;
import React, { useState } from 'react';
import { Layout, Menu, Button } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Layout className="min-h-screen">
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        breakpoint="lg"
        collapsedWidth="0"
        className="fixed left-0 h-screen z-10 lg:relative"
      >
        <div className="h-8 m-4 bg-white/10" />
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={[
            {
              key: '/dashboard',
              label: 'Dashboard',
              onClick: () => navigate('/dashboard')
            },
            {
              key: '/partners',
              label: 'Partners',
              onClick: () => navigate('/partners')
            },
            {
              key: '/leads',
              label: 'Leads',
              onClick: () => navigate('/leads')
            }
          ]}
        />
      </Sider>
      <Layout>
        <Header className="bg-white p-0 flex items-center justify-between">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="lg:hidden"
          />
        </Header>
        <Content className="m-4 p-6 bg-white rounded-lg">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
