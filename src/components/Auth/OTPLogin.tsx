import React, { useEffect, useState } from 'react';
import { Form, Input, Button, message, Tabs, Space } from 'antd';
import { PhoneCall, User } from 'lucide-react';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useDispatch, useSelector } from 'react-redux';
import { login, signup } from '../../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../redux/store';

const { TabPane } = Tabs;

interface FormValues {
    phone: string;
    fullName?: string;
    otp?: string;
}

const OTPLogin: React.FC = () => {
    const [form] = Form.useForm();
    const [loginNumber, setPhoneNumber] = useState<any>('');
    const [loading, setLoading] = useState(false);
    const [showOTP, setShowOTP] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('login');
    const dispatch: any = useDispatch();
    const navigate = useNavigate();

    const { user } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);


    const setupRecaptcha = () => {
        if (!(window as any).recaptchaVerifier) {
            (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                size: 'invisible',
            });
        }
    };

    const handleSendOTP = async (values: FormValues) => {
        try {
            setLoading(true);
            setupRecaptcha();
            const existingValues = form.getFieldsValue();
            const phoneNumber = values.phone.startsWith('+') ? values.phone : `+91${values.phone}`;
            const confirmation = await signInWithPhoneNumber(
                auth,
                phoneNumber,
                (window as any).recaptchaVerifier
            );

            setConfirmationResult(confirmation);
            setShowOTP(true);
            message.success('OTP sent successfully!');
            form.setFieldsValue({ ...existingValues, phone: phoneNumber });
        } catch (error: any) {
            message.error(error.message || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (values: FormValues) => {
        if (!confirmationResult || !values.otp) return;

        try {
            setLoading(true);
            const phoneNumber = values.phone
            const result = await confirmationResult.confirm(values.otp);
            const token = await result.user.getIdToken();

            if (activeTab === 'signup') {
                const signupResult = await dispatch(signup({
                    fullName: values.fullName!,
                    phoneNumber: phoneNumber,
                    email: '',
                    token
                })).unwrap();
                console.log("signup", signupResult)
                message.success('Signup successful!');
                navigate('/dashboard');
            } else {
                console.log("phone numb", values.phone)
                const loginResult = await dispatch(login(
                    {
                        phoneNumber: loginNumber,
                        token
                    })).unwrap();
                message.success('Login successful!');
            }
            navigate('/dashboard');
        } catch (error: any) {
            message.error(error);

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
                                prefix={<User className="w-4 h-4 text-gray-400 mr-2" />}
                                className="rounded-lg"
                            />
                        </Form.Item>
                    )}
                    <Form.Item
                        name="otp"
                        rules={[{ required: true, message: 'Please enter the OTP' }]}
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
                        className="w-full h-10 bg-blue-600 hover:bg-blue-700"
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
                            prefix={<User className="w-4 h-4 text-gray-400 mr-2" />}
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
                        prefix={<PhoneCall className="w-4 h-4 text-gray-400 mr-2" />}
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
                    className="w-full h-10 bg-blue-600 hover:bg-blue-700"
                >
                    Send OTP
                </Button>
            </Form>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-block p-3 bg-blue-50 rounded-full mb-4">
                        <PhoneCall className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Welcome to Partner Portal</h1>
                    <p className="text-gray-600 mt-2">
                        {showOTP ? 'Enter OTP to continue' : 'Sign in or create an account'}
                    </p>
                </div>

                {!showOTP && (
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        centered
                        className="mb-6"
                    >
                        <TabPane tab="Login" key="login" />
                        <TabPane tab="Sign Up" key="signup" />
                    </Tabs>
                )}

                {renderForm()}
                <div id="recaptcha-container" />
            </div>
        </div>
    );
};

export default OTPLogin;