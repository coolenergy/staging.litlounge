import { PureComponent } from 'react';
import { Form, Button, message, InputNumber } from 'antd';
import { ICommissionSetting } from 'src/interfaces';

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 }
};

const validateMessages = {
  required: 'This field is required!'
};

interface IProps {
  onFinish: Function;
  commissionSetting?: ICommissionSetting;
  submiting?: boolean;
}

export class CommissionSettingForm extends PureComponent<IProps> {
  render() {
    const { commissionSetting, onFinish, submiting } = this.props;
    return (
      <Form
        layout={'vertical'}
        name="form-performer-commission"
        onFinish={onFinish.bind(this)}
        onFinishFailed={() =>
          message.error('Please complete the required fields.')
        }
        validateMessages={validateMessages}
        initialValues={
          commissionSetting
            ? commissionSetting
            : ({
                tipCommission: 80,
                privateCallCommission: 80,
                groupCallCommission: 80,
                productCommission: 80,
                albumCommission: 80,
                videoCommission: 80
              } as ICommissionSetting)
        }
      >
        <Form.Item
          name="tipCommission"
          label="Tip Commission"
          rules={[
            {
              validator: (_, value) => {
                if (parseInt(value) > 0 && parseInt(value) < 100) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  'Value must be greater than 0 and less than 100'
                );
              }
            }
          ]}
        >
          <InputNumber min={1} max={99} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          name="privateCallCommission"
          label="Private Call Commission"
          rules={[
            {
              validator: (_, value) => {
                if (parseInt(value) > 0 && parseInt(value) < 100) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  'Value must be greater than 0 and less than 100'
                );
              }
            }
          ]}
        >
          <InputNumber min={1} max={99} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          name="groupCallCommission"
          label="Group Call Commission"
          rules={[
            {
              validator: (_, value) => {
                if (parseInt(value) > 0 && parseInt(value) < 100) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  'Value must be greater than 0 and less than 100'
                );
              }
            }
          ]}
        >
          <InputNumber min={1} max={99} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          name="productCommission"
          label="Product Sale Commission"
          rules={[
            {
              validator: (_, value) => {
                if (parseInt(value) > 0 && parseInt(value) < 100) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  'Value must be greater than 0 and less than 100'
                );
              }
            }
          ]}
        >
          <InputNumber min={1} max={99} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          name="albumCommission"
          label="Album Sale Commission"
          rules={[
            {
              validator: (_, value) => {
                if (parseInt(value) > 0 && parseInt(value) < 100) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  'Value must be greater than 0 and less than 100'
                );
              }
            }
          ]}
        >
          <InputNumber min={1} max={99} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          name="videoCommission"
          label="Video Sale Commission"
          rules={[
            {
              validator: (_, value) => {
                if (parseInt(value) > 0 && parseInt(value) < 100) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  'Value must be greater than 0 and less than 100'
                );
              }
            }
          ]}
        >
          <InputNumber min={1} max={99} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item wrapperCol={{ ...layout.wrapperCol }}>
          <Button type="primary" htmlType="submit" loading={submiting}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    );
  }
}
