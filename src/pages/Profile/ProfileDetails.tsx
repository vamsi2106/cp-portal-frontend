import React, { useEffect } from 'react';
import { Form, Input, Button, Card, message, Avatar, Divider } from 'antd';
import { useSelector } from 'react-redux';
import { api } from '../../api/api';
import { RootState } from '../../redux/store';
import { User, Phone, Mail, MapPin, Home } from 'lucide-react';

interface ProfileFormValues {
    partnerName: string;
    phone: string;
    email?: string;
    city?: string;
    address?: string;
    parentPartner?: [];
}

const ProfileDetails: React.FC = () => {
    const [form] = Form.useForm<ProfileFormValues>();
    const user: any = useSelector((state: RootState) => state?.auth?.user);

    useEffect(() => {
        if (user) {
            form.setFieldsValue({
                partnerName: user?.name,
                phone: user?.phone,
                parentPartner: user?.parentPartner?.name || 'Owner',
                email: user?.email || '',
                city: user?.city || '',
                address: user?.address || '',
            });
        }
    }, [user, form]);

    const onFinish = async (values: ProfileFormValues) => {
        try {
            await api.put(`api/partners/${user?.id}`, values);
            message.success('Profile updated successfully');
        } catch (error) {
            message.error('Failed to update profile');
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <Card
                className="mb-6 ridhira-card shadow-sm border-secondary-cream overflow-hidden"
                bodyStyle={{
                    padding: 0,
                    background: 'linear-gradient(to right, rgba(19, 36, 48, 0.8), rgba(19, 36, 48, 0.6))'
                }}
            >
                <div className="p-8 text-center relative">
                    <div className="absolute inset-0 opacity-10" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }}></div>

                    <Avatar
                        size={80}
                        className="bg-primary-gold flex items-center justify-center shadow-md border-4 border-white"
                        icon={<User className="w-10 h-10 text-primary-dark" />}
                    />
                    <h1 className="text-2xl font-bold text-white mt-4">{user?.name}</h1>
                    <p className="text-secondary-cream/80">{user?.parentPartner?.name ? `Reports to ${user.parentPartner.name}` : 'Owner'}</p>
                </div>
            </Card>

            <Card
                title={<div className="text-primary-dark text-xl font-bold">Profile Details</div>}
                className="ridhira-card border-secondary-cream shadow-sm"
                headStyle={{ background: '#f6f4ef', borderBottom: '1px solid #ede9df' }}
            >
                <Form<ProfileFormValues> form={form} layout="vertical" onFinish={onFinish}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <Form.Item
                            label="Partner Name"
                            name="partnerName"
                            className="mb-2"
                        >
                            <Input
                                style={{ color: '#132430', background: '#f6f4ef' }}
                                disabled
                                prefix={<User className="text-primary-gold/70 mr-2 w-4 h-4" />}
                            />
                        </Form.Item>
                        <Form.Item
                            label="Phone"
                            name="phone"
                            className="mb-2"
                        >
                            <Input
                                style={{ color: '#132430', background: '#f6f4ef' }}
                                disabled={!!user?.phone}
                                prefix={<Phone className="text-primary-gold/70 mr-2 w-4 h-4" />}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Parent Partner"
                            name="parentPartner"
                            className="mb-2"
                        >
                            <Input
                                value={user?.parentPartner?.name}
                                style={{ color: '#132430', background: '#f6f4ef' }}
                                disabled
                                prefix={<User className="text-primary-gold/70 mr-2 w-4 h-4" />}
                            />
                        </Form.Item>
                        <Form.Item
                            label="Email"
                            name="email"
                            className="mb-2"
                        >
                            <Input
                                type="email"
                                disabled={!!user?.email}
                                style={{ color: '#132430', background: '#f6f4ef' }}
                                prefix={<Mail className="text-primary-gold/70 mr-2 w-4 h-4" />}
                            />
                        </Form.Item>

                        <Form.Item
                            label="City"
                            name="city"
                            className="mb-2"
                        >
                            <Input
                                disabled={!!user?.city}
                                style={{ color: '#132430', background: '#f6f4ef' }}
                                prefix={<MapPin className="text-primary-gold/70 mr-2 w-4 h-4" />}
                            />
                        </Form.Item>
                        <Form.Item
                            label="Address"
                            name="address"
                            className="mb-2"
                        >
                            <Input.TextArea
                                rows={2}
                                disabled={!!user?.address}
                                style={{ color: '#132430', background: '#f6f4ef' }}
                                className="pl-8"
                            />
                        </Form.Item>
                    </div>

                    <Divider />

                    <div className="flex justify-end">
                        <Button type="primary" htmlType="submit" className="bg-primary-gold hover:bg-primary-gold/90 shadow-sm">
                            Save Profile
                        </Button>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default ProfileDetails;
