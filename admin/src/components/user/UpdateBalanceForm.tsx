import React from "react";
import { Form, Button, InputNumber } from "antd";

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 }
};

export const UpdateBalanceForm = ({ onFinish, balance, updating = false }) => {
  return (
    <Form name="nest-messages" onFinish={onFinish.bind(this)} {...layout}
      initialValues={{
        balance
      }}
    >
      <Form.Item
        name="balance"
        label="Balance"
        rules={[
          { required: true, message: 'Enter balance you want to update!' }
        ]}
      >
        <InputNumber min={0} />
      </Form.Item>
      <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
        <Button type="primary" htmlType="submit" loading={updating}>
          Update
        </Button>
      </Form.Item>
    </Form>
  );
};
