import React, { useEffect } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { useSelector } from 'react-redux';
import { api } from '../../api/api';
import { RootState } from '../../redux/store';

interface ProfileFormValues {
    partnerName: string;
    phoneNumber: string;
    email?: string;
    city?: string;
    address?: string;
    parentPartner?: [];
}

const ProfileDetails: React.FC = () => {
    const [form] = Form.useForm<ProfileFormValues>();
    const user: any = useSelector((state: RootState) => state.auth.user);

    useEffect(() => {
        if (user) {
            form.setFieldsValue({
                partnerName: user.name,
                phoneNumber: user.phone,
                parentPartner: user.parentPartner.name || '',
                email: user.email || '',
                city: user.city || '',
                address: user.address || '',
            });
        }
    }, [user, form]);

    const onFinish = async (values: ProfileFormValues) => {
        try {
            await api.put(`api/partners/${user.id}`, values);
            message.success('Profile updated successfully');
        } catch (error) {
            message.error('Failed to update profile');
        }
    };

    return (
        <Card title="Profile Details" className="max-w-3xl mx-auto">
            <Form<ProfileFormValues> form={form} layout="vertical" onFinish={onFinish}>
                <div className="grid grid-cols-2 gap-x-6">
                    <Form.Item label="Partner Name" name="partnerName" >
                        <Input style={{ color: 'black' }} disabled />
                    </Form.Item>
                    <Form.Item label="Phone Number" name="phoneNumber" >
                        <Input style={{ color: 'black' }} disabled />
                    </Form.Item>
                </div>

                <div className="grid grid-cols-2 gap-x-6">
                    <Form.Item label="Parent Partner" name="parentPartner">
                        <Input value={user.parentPartner.name} style={{ color: 'black' }} disabled />
                    </Form.Item>
                    <Form.Item label="Email" name="email">
                        <Input type="email" disabled={!!user.email} />
                    </Form.Item>
                </div>

                <div className="grid grid-cols-2 gap-x-6">
                    <Form.Item label="City" name="city">
                        <Input disabled={!!user.city} />
                    </Form.Item>
                    <Form.Item label="Address" name="address">
                        <Input.TextArea rows={2} disabled={!!user.address} />
                    </Form.Item>
                </div>

                <div className="flex justify-end">
                    <Button type="primary" htmlType="submit">
                        Save
                    </Button>
                </div>
            </Form>
        </Card>
    );
};

export default ProfileDetails;
