import React from 'react';
import { Form, Row, Col } from 'antd'; // Assuming antd is used

const PartnerForm = ({ handleSubmit, form }) => {

  return (
    <Form 
      layout="vertical" 
      form={form} 
      onFinish={handleSubmit}
      className="max-w-3xl mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-sm max-h-[70vh] overflow-y-auto px-1" // Added className for responsiveness
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="name"
            label="Partner Name"
            rules={[{ required: true }]}
          >
            {/* Input field here */}
          </Form.Item>
        </Col>
        {/* Add other form fields here, adjusting Col spans as needed for responsiveness */}
        <Col xs={24} sm={12}>
          <Form.Item>
            <button type="submit">Submit</button>
          </Form.Item>
        </Col>

      </Row>
    </Form>
  );
};

export default PartnerForm;