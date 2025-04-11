import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import {
    DashboardOutlined,
    TeamOutlined,
    UserOutlined,
    BranchesOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    DownOutlined,
    ContactsOutlined,
    ProfileOutlined,
    FileTextOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { logout } from '../../redux/slices/authSlice';

const { Header, Sider, Content } = Layout;

const MainLayout: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const [activePath, setActivePath] = useState('/dashboard');
    const [isMobile, setIsMobile] = useState(false);
    const { user } = useSelector((state: RootState) => state.auth);

    const getInitials = (name?: string) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const userInitials = getInitials(user?.name);

    console.log(userInitials);

    useEffect(() => {
        setActivePath(location.pathname);
    }, [location]);

    // Set collapsed state and isMobile based on screen size
    useEffect(() => {
        const handleResize = () => {
            const mobileView = window.innerWidth < 768;
            setIsMobile(mobileView);
            setCollapsed(mobileView);
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Initialize on component mount

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const menuItems = [
        {
            key: '/dashboard',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
        },
        {
            key: '/partners',
            icon: <TeamOutlined />,
            label: 'Partners',
        },
        // {
        //     key: '/leads',
        //     icon: <BranchesOutlined />,
        //     label: 'Leads',
        // },
        {
            key: '/contacts',
            icon: <ContactsOutlined />,
            label: 'Contacts',
        },
        {
            key: '/brochures',
            icon: <FileTextOutlined />,
            label: 'Brochures',
        },
        {
            key: '/profile',
            icon: <ProfileOutlined />,
            label: 'Profile',
            className: 'hidden md:flex', // Hide on mobile, show on desktop
        },
    ];

    // Create a filtered menu for mobile navigation without the Profile item
    const mobileMenuItems = menuItems.filter(item => item.key !== '/profile');

    const userMenuItems: MenuProps['items'] = [
        {
            key: '1',
            label: <Link to="/profile">My Profile</Link>,
            icon: <UserOutlined />,
        },
        {
            type: 'divider',
        },
        {
            key: '2',
            label: 'Logout',
            icon: <LogoutOutlined />,
            onClick: handleLogout,
        },
    ];

    return (
        <Layout className="min-h-screen">
            {!isMobile ? (
                <Sider
                    theme="dark"
                    width={240}
                    breakpoint="lg"
                    collapsedWidth={80}
                    collapsed={collapsed}
                    onCollapse={value => setCollapsed(value)}
                    className="fixed left-0 top-0 h-full z-10"
                    style={{
                        background: '#132430',
                        borderRight: '1px solid rgba(204, 169, 90, 0.2)',
                        boxShadow: '0 0 20px rgba(0, 0, 0, 0.15)',
                        overflowY: 'auto',
                        overflowX: 'hidden'
                    }}
                >
                    <div className="py-4 flex items-center justify-center h-16 border-b border-[rgba(204,169,90,0.15)]">
                        <div className={`transition-all duration-300 ${collapsed ? 'scale-75' : 'scale-100'}`}>
                            {collapsed ? (
                                <img src="/assets/logo.svg" alt="logo" className="h-8" />
                            ) : (
                                <span className="text-[#cca95a] font-bold text-2xl tracking-wider d-flex align-items-center gap-2" style={{ display: 'flex', gap: '4px' }}>
                                    <img src="/assets/logo.svg" alt="logo" className="h-8" />
                                    <span>Ridhira</span>
                                </span>
                            )}
                        </div>
                    </div>

                    <Menu
                        theme="dark"
                        mode="inline"
                        selectedKeys={[activePath]}
                        items={menuItems}
                        onClick={e => {
                            setActivePath(e.key);
                            navigate(e.key);
                        }}
                        className="mt-2 border-0"
                        style={{
                            background: 'transparent',
                        }}
                    />

                    <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[rgba(204,169,90,0.15)] bg-[#0e1c24]">
                        {collapsed ? (
                            <div className="flex flex-col items-center justify-center">
                                <Avatar
                                    className="bg-[#cca95a] text-[#132430] shadow-md"
                                    size={40}
                                >
                                    {userInitials}
                                </Avatar>
                            </div>
                        ) : (
                            <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="topRight">
                                <div className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-[rgba(204,169,90,0.15)] transition-all">
                                    <Avatar
                                        className="bg-[#cca95a] text-[#132430] shadow-md"
                                        size={36}
                                    >
                                        {userInitials}
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm text-white truncate">
                                            {user?.name || 'User'}
                                        </div>
                                        <div className="text-xs text-[#cca95a]/80 truncate">
                                            {user?.email || 'user@example.com'}
                                        </div>
                                    </div>
                                    <DownOutlined className="text-[#cca95a]/60 text-xs" />
                                </div>
                            </Dropdown>
                        )}
                    </div>
                </Sider>
            ) : null}

            <Layout className="transition-all duration-300" style={{ marginLeft: isMobile ? 0 : (collapsed ? 80 : 240) }}>
                <Header
                    className="p-0 flex justify-between items-center bg-white border-b border-gray-100 fixed top-0 right-0 z-20"
                    style={{
                        padding: '0 16px',
                        height: 64,
                        background: '#ede9df',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        left: isMobile ? 0 : (collapsed ? '80px' : '240px'),
                        width: isMobile ? '100%' : 'auto',
                        transition: 'all 0.3s'
                    }}
                >
                    <div className="flex items-center">
                        {!isMobile ? (
                            <Button
                                type="text"
                                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                                onClick={() => setCollapsed(!collapsed)}
                                className="text-primary-dark hover:text-primary-gold"
                            />
                        ) : (
                            <span className="text-[#cca95a] font-bold text-lg tracking-wider d-flex align-items-center gap-2" style={{ display: 'flex', gap: '4px' }}>
                                <img src="/assets/logo.svg" alt="logo" className="h-10" />
                                <div className="flex flex-col font-bold text-lg tracking-wider">
                                    <span>Ridhira</span>
                                    <sub>Channel Partner Portal</sub>
                                </div>
                            </span>
                        )}
                        <div className={`${isMobile ? 'hidden' : 'ml-6 block'} text-primary-dark font-medium`}>
                            Channel Partner Portal
                        </div>
                    </div>

                    <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
                        <div className="flex items-center space-x-2 cursor-pointer">
                            <div className="text-right hidden sm:block">
                                <div className="text-sm text-gray-700">{user?.name}</div>
                                <div className="text-xs text-gray-500">{user?.id}</div>
                            </div>

                            <Avatar
                                className="bg-primary-dark text-primary-gold"
                                size="default"
                            >
                                {userInitials}
                            </Avatar>
                        </div>
                    </Dropdown>
                </Header>

                <Content
                    className="mx-4 my-4 p-4 bg-white rounded-lg shadow-sm"
                    style={{
                        marginTop: 64, // Header height
                        minHeight: isMobile ? 'calc(100vh - 136px)' : 'calc(100vh - 72px)', // Adjust for bottom nav on mobile
                        marginBottom: isMobile ? '64px' : '0'
                    }}
                >
                    <Outlet />
                </Content>

                {isMobile && (
                    <div className="fixed bottom-0 left-0 right-0 z-10 bg-[#132430] h-16 border-t border-[rgba(204,169,90,0.15)]" style={{
                        boxShadow: '0 -4px 10px rgba(0,0,0,0.1)'
                    }}>
                        <Menu
                            theme="dark"
                            mode="horizontal"
                            selectedKeys={[activePath]}
                            items={mobileMenuItems}
                            onClick={e => {
                                setActivePath(e.key);
                                navigate(e.key);
                            }}
                            className="w-full flex justify-around h-full items-center border-0"
                            style={{
                                background: '#132430',
                            }}
                        />
                    </div>
                )}
            </Layout>
        </Layout>
    );
};

export default MainLayout;

