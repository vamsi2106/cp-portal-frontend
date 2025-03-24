import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { PhoneCall } from 'lucide-react';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../../firebase';
import { useDispatch } from 'react-redux';
import { login } from '../../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const OTPLogin: React.FC = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [showOTP, setShowOTP] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState<any>(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const setupRecaptcha = () => {
        if (!(window as any).recaptchaVerifier) {
            (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                size: 'invisible',
            });
        }
    };

    const handleSendOTP = async (values: { phone: string }) => {
        try {
            setLoading(true);
            setupRecaptcha();
            const confirmation = await signInWithPhoneNumber(
                auth,
                values.phone,
                (window as any).recaptchaVerifier
            );
            setConfirmationResult(confirmation);
            setShowOTP(true);
            message.success('OTP sent successfully!');
        } catch (error) {
            message.error('Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // const handleVerifyOTP = async (values: { otp: string }) => {
    //     try {
    //         setLoading(true);
    //         const result = await confirmationResult.confirm(values.otp);
    //         const token = await result.user.getIdToken();
    //         dispatch(login(token));

    //         navigate('/dashboard');
    //     } catch (error) {
    //         message.error('Invalid OTP. Please try again.');
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const handleVerifyOTP = async (values: { otp: string }) => {
        try {
            setLoading(true);
            const result = await confirmationResult.confirm(values.otp);
            const token = await result.user.getIdToken();

            // Dispatch login with the correct token format
            await dispatch(login(token)).unwrap(); // Ensures proper error handling

            navigate('/dashboard');
        } catch (error) {
            message.error('Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-block p-3 bg-blue-50 rounded-full mb-4">
                        <PhoneCall className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Partner Login</h1>
                    <p className="text-gray-600 mt-2">Enter your phone number to continue</p>
                </div>

                {!showOTP ? (
                    <Form form={form} onFinish={handleSendOTP} layout="vertical">
                        <Form.Item
                            name="phone"
                            rules={[{ required: true, message: 'Please enter your phone number' }]}
                        >
                            <Input
                                size="large"
                                placeholder="Phone number with country code"
                                className="rounded-lg"
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
                ) : (
                    <Form form={form} onFinish={handleVerifyOTP} layout="vertical">
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
                )}
                <div id="recaptcha-container" />
            </div>
        </div>
    );
};

export default OTPLogin;