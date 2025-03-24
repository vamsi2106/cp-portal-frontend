import React from 'react';
import { Layout, Menu } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, PhoneCall, LogOut } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';

const { Header, Sider, Content } = Layout;

const MainLayout: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

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
        {
            key: 'logout',
            icon: <LogOut className="w-5 h-5" />,
            label: 'Logout',
            onClick: handleLogout,
            className: 'mt-auto',
        },
    ];

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
                    className="h-[calc(100vh-64px)] flex flex-col border-r-0"
                    items={menuItems}
                />
            </Sider>
            <Layout className="ml-[250px]">
                <Header className="bg-white shadow-sm h-16 flex items-center px-6">
                    <h2 className="text-lg font-semibold text-gray-800">Channel Partner Portal</h2>
                </Header>
                <Content className="p-6 bg-gray-50">
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;