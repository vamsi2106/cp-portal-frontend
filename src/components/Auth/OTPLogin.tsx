import React, { useEffect, useState } from 'react';
import { Form, Input, Button, message, Tabs, Space } from 'antd';
import { PhoneCall, User } from 'lucide-react';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useDispatch, useSelector } from 'react-redux';
import { login, signup } from '../../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../redux/store';
import { logout } from "../../redux/slices/authSlice";
import { motion } from 'framer-motion';
const { TabPane } = Tabs;

interface FormValues {
    phone: string;
    fullName?: string;
    otp?: string;
}

const OTPLogin: React.FC = () => {
    const [form] = Form.useForm();
    const [phoneNumber, setPhoneNumber] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [showOTP, setShowOTP] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('login');
    const [otpError, setOtpError] = useState<string>('');
    const dispatch: any = useDispatch();
    const navigate = useNavigate();

    const { user } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const resetState = () => {
        form.resetFields();
        setShowOTP(false);
        setConfirmationResult(null);
        setPhoneNumber('');
        setLoading(false);
        setOtpError('');
        // Reset reCAPTCHA
        if ((window as any).recaptchaVerifier) {
            (window as any).recaptchaVerifier.clear();
            (window as any).recaptchaVerifier = null;
        }
        // Clear the reCAPTCHA container
        const recaptchaContainer = document.getElementById('recaptcha-container');
        if (recaptchaContainer) {
            recaptchaContainer.innerHTML = '';
        }
    };

    const setupRecaptcha = () => {
        if ((window as any).recaptchaVerifier) {
            (window as any).recaptchaVerifier.clear();
        }

        (window as any).recaptchaVerifier = new RecaptchaVerifier(
            auth,
            'recaptcha-container',
            {
                size: 'invisible',
            }
        );
    };

    const handleSendOTP = async (values: FormValues) => {
        try {
            setLoading(true);

            // Always clear previous reCAPTCHA properly
            if ((window as any).recaptchaVerifier) {
                await (window as any).recaptchaVerifier.clear();
                (window as any).recaptchaVerifier = null;
            }

            setupRecaptcha();

            const phoneNumber = values.phone.startsWith('+') ? values.phone : `+91${values.phone}`;

            const confirmation = await signInWithPhoneNumber(
                auth,
                phoneNumber,
                (window as any).recaptchaVerifier
            );

            setConfirmationResult(confirmation);
            setShowOTP(true);
            message.success('OTP sent successfully!');
            form.setFieldsValue({ phone: phoneNumber });
        } catch (error: any) {
            message.error(error.message || 'Failed to send OTP. Please try again.');
            // Properly handle reCAPTCHA clearing on errors
            if ((window as any).recaptchaVerifier) {
                await (window as any).recaptchaVerifier.clear();
                (window as any).recaptchaVerifier = null;
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (values: FormValues) => {
        if (!confirmationResult || !values.otp || !phoneNumber) return;

        try {
            setLoading(true);
            setOtpError(''); // Clear any previous OTP errors
            const result = await confirmationResult.confirm(values.otp);
            const token = await result.user.getIdToken();

            if (activeTab === 'signup') {
                const signupResult = await dispatch(signup({
                    Name: values.fullName!,
                    phoneNumber: phoneNumber,
                    token
                })).unwrap();
                message.success('Signup successful!');
                navigate('/dashboard');
            } else {
                const loginResult = await dispatch(login({
                    phoneNumber: phoneNumber,
                    token
                })).unwrap();
                message.success('Login successful!');
                navigate('/dashboard');
            }
        } catch (error: any) {
            // First check if it's a Firebase error
            if (error.code?.startsWith('auth/')) {
                // Handle Firebase OTP verification errors
                if (error.code === 'auth/invalid-verification-code') {
                    setOtpError('Invalid OTP. Please check and try again.');
                } else if (error.code === 'auth/code-expired') {
                    setOtpError('OTP has expired. Please request a new one.');
                } else if (error.code === 'auth/too-many-requests') {
                    message.error('Too many attempts. Please try again later.');
                    setTimeout(() => {
                        resetState();
                    }, 20000);
                }
            } else {
                // Handle backend API errors
                message.error(error);

                // First reset the form to initial state
                resetState();
                dispatch(logout());

            }
        } finally {
            setLoading(false);
        }
    };

    const renderForm = () => {
        if (showOTP) {
            return (
                <Form form={form} onFinish={handleVerifyOTP} layout="vertical">
                    {activeTab === 'signup' && (
                        <Form.Item
                            name="fullName"
                            rules={[{ required: true, message: 'Please enter your full name' }]}
                        >
                            <Input
                                size="large"
                                placeholder="Full Name"
                                prefix={<User className="w-4 h-4 text-primary-gold mr-2" />}
                                className="rounded-lg"
                            />
                        </Form.Item>
                    )}
                    <Form.Item
                        name="otp"
                        rules={[{ required: true, message: 'Please enter the OTP' }]}
                        validateStatus={otpError ? 'error' : undefined}
                        help={otpError}
                    >
                        <Input
                            size="large"
                            placeholder="Enter OTP"
                            className="rounded-lg"
                        />
                    </Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        className="w-full h-10 bg-primary-gold hover:bg-primary-gold/80"
                    >
                        Verify OTP
                    </Button>
                </Form>
            );
        }

        return (
            <Form form={form} onFinish={handleSendOTP} layout="vertical">
                {activeTab === 'signup' && (
                    <Form.Item
                        name="fullName"
                        rules={[{ required: true, message: 'Please enter your full name' }]}
                    >
                        <Input
                            size="large"
                            placeholder="Full Name"
                            prefix={<User className="w-4 h-4 text-primary-gold mr-2" />}
                            className="rounded-lg"
                        />
                    </Form.Item>
                )}
                <Form.Item
                    name="phone"
                    rules={[
                        { required: true, message: 'Please enter your phone number' },
                        { pattern: /^(\+91)?\d{10}$/, message: 'Please enter a valid Indian phone number' },
                    ]}
                >
                    <Input
                        size="large"
                        placeholder="Phone number (e.g., 9876543210)"
                        prefix={<PhoneCall className="w-4 h-4 text-primary-gold mr-2" />}
                        className="rounded-lg"
                        onChange={(event: any) => {
                            setPhoneNumber(event.target.value)
                        }}
                    />
                </Form.Item>
                <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    className="w-full h-10 bg-primary-gold hover:bg-primary-gold/80"
                >
                    Send OTP
                </Button>
            </Form>
        );
    };

    return (
        <div className="min-h-screen bg-secondary-light-cream flex items-center justify-center p-4 relative overflow-hidden">
            {/* Pattern Background Div */}
            <div
                className="absolute inset-0 z-0 opacity-20"
                style={{
                    backgroundImage: `url('/assets/logo.svg')`,
                    backgroundRepeat: 'repeat',
                    backgroundSize: '100px',
                    backgroundPosition: 'center',
                }}
            ></div>

            {/* Main Card Content (must be above pattern) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex w-full max-w-6xl bg-gold-50 rounded-2xl shadow-2xl overflow-hidden relative z-10 "
            >
                {/* Left Side - Image Section */}
                <div className="hidden lg:block w-1/2 relative overflow-hidden">
                    <motion.div
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0"
                    >
                        <img
                            src="/assets/ridhira-banner.jpg"
                            alt="Authentication"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/50 to-transparent" />
                    </motion.div>
                    {/* Logo pattern background - MOVED HERE */}
                    <div className="absolute inset-0 z-0 opacity-10">
                        <div className="absolute inset-0" style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23cca95a' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                            backgroundSize: '60px 60px'
                        }}></div>
                    </div>
                    {/* <div className="absolute top-8 left-8">
                        <motion.img
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            src="/dummy-logo.png"
                            alt="Logo"
                            className="h-12 w-auto"
                        />
                    </div> */}
                    {/* <div className="absolute bottom-8 left-8 text-white">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="text-3xl font-bold mb-2"
                        >
                            Welcome to Ridhira
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9 }}
                            className="text-white/80"
                        >
                            Your trusted partner in business growth
                        </motion.p>
                    </div> */}
                </div>

                {/* Right Side - Form Section */}
                <div className="w-full lg:w-1/2 p-8 relative">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-md mx-auto"
                    >
                        <div className="text-center mb-8">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                className="inline-block p-4 bg-primary-dark rounded-full mb-4 shadow-lg"
                            >
                                <img src="/assets/logo.svg" alt="Logo" className="w-12 h-12" />
                                {/* <PhoneCall className="w-8 h-8 text-primary-gold" /> */}
                            </motion.div>
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-2xl font-bold text-primary-dark"
                            >
                                Channel Partner Portal
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-gray-600 mt-2"
                            >
                                {showOTP ? 'Enter OTP to continue' : 'Secure Login to your account using OTP'}
                            </motion.p>
                        </div>

                        {!showOTP && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <Tabs
                                    activeKey={activeTab}
                                    onChange={setActiveTab}
                                    centered
                                    className="mb-6"
                                >
                                    <TabPane tab="Login" key="login" />
                                    <TabPane tab="Sign Up" key="signup" />
                                </Tabs>
                            </motion.div>
                        )}

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            {renderForm()}
                        </motion.div>

                        <div id="recaptcha-container" />

                        {showOTP && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-6 text-center"
                            >
                                <Button
                                    type="text"
                                    onClick={resetState}
                                    className="text-primary-gold hover:text-primary-gold/80"
                                >
                                    Back to login
                                </Button>
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Animated background elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full bg-primary-gold opacity-5 animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 rounded-tr-full bg-primary-gold opacity-5 animate-pulse" />
                </div>
            </motion.div>
        </div>
    );
};

export default OTPLogin;