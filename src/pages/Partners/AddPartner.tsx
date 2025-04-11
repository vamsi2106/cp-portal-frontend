import React from 'react';
import { Form, Row, Col, FormInstance, Input, Button } from 'antd';

interface PartnerFormValues {
  name: string;
  phone: string;
  email?: string;
  city?: string;
  address?: string;
  parentPartner?: string;
}

interface ApiPayload {
  Name: string;
  Phone: string;
  Email?: string;
  City?: string;
  Address?: string;
  Parent_Partner?: string;
}

interface PartnerFormProps {
  handleSubmit: (values: ApiPayload) => Promise<void>;
  form: FormInstance<PartnerFormValues>;
}

const PartnerForm: React.FC<PartnerFormProps> = ({ handleSubmit, form }) => {
  const onFinish = async (values: PartnerFormValues) => {
    try {
      // Transform the payload to match backend format
      const payload: ApiPayload = {
        Name: values.name,
        Phone: values.phone,
        Email: values.email,
        City: values.city,
        Address: values.address,
        Parent_Partner: values.parentPartner
      };
      await handleSubmit(payload);
    } catch (error) {
      console.error('Form submission failed:', error);
    }
  };

  return (
    <Form
      layout="vertical"
      form={form}
      onFinish={onFinish}
      className="max-w-3xl mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-sm max-h-[70vh] overflow-y-auto px-1"
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="name"
            label="Partner Name"
            rules={[{ required: true, message: 'Please enter partner name' }]}
          >
            <Input placeholder="Enter partner name" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[
              { required: true, message: 'Please enter phone number' },
              { pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit phone number' }
            ]}
          >
            <Input placeholder="Enter phone number" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="city"
            label="City"
          >
            <Input placeholder="Enter city" />
          </Form.Item>
        </Col>
        <Col xs={24}>
          <Form.Item
            name="address"
            label="Address"
          >
            <Input.TextArea rows={3} placeholder="Enter address" />
          </Form.Item>
        </Col>
        <Col xs={24}>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Add Partner
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default PartnerForm;