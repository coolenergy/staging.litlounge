import { PureComponent } from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  Switch,
  message,
  InputNumber
} from 'antd';
import { ICountry, IStudio } from 'src/interfaces';

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 }
};

const validateMessages = {
  required: 'This field is required!',
  types: {
    email: 'Not a validate email!',
    number: 'Not a validate number!'
  },
  number: {
    range: 'Must be between ${min} and ${max}'
  }
};

interface IProps {
  onFinish: (data: any) => void;
  studio?: Partial<IStudio>;
  submiting?: boolean;
  countries: ICountry[];
}

export default class StudioAccountForm extends PureComponent<IProps> {
  state = {
    loading: false
  };

  render() {
    const { studio, onFinish, submiting, countries } = this.props;

    return (
      <Form
        {...layout}
        name="form-performer"
        onFinish={onFinish}
        onFinishFailed={() =>
          message.error(
            'Please complete the required fields in tab general info'
          )
        }
        validateMessages={validateMessages}
        initialValues={
          studio
            ? studio
            : ({
                country: 'US',
                status: 'active',
                emailVerified: false
              } as IStudio)
        }
      >
        <Form.Item
          name="name"
          label="Studio name"
          rules={[
            {
              pattern: new RegExp('^[a-zA-Z0-9 ]*$'),
              message: 'Studio name must according to Alphanumeric formating'
            },
            {
              whitespace: true,
              message: 'Please input your Studio name!'
            },
            {
              required: true,
              message: 'Please input your Studio name!'
            }
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="username"
          label="User Name"
          rules={[
            {
              pattern: new RegExp('^[a-zA-Z0-9 ]*$'),
              message: 'User name must according to Alphanumeric formating'
            },
            {
              whitespace: true,
              message: 'Please input your user name!'
            },
            {
              required: true,
              message: 'Please input your user name!'
            }
          ]}
        >
          <Input placeholder="Username name" />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email Address"
          rules={[
            {
              type: 'email',
              message: 'The input is not valid E-mail!'
            },
            {
              required: true,
              message: 'Please input your E-mail!'
            }
          ]}
        >
          <Input placeholder="studio@example.com" />
        </Form.Item>

        {!studio && [
          <Form.Item
            key="password"
            name="password"
            label="Password"
            rules={[{ required: true }, { min: 6 }]}
          >
            <Input.Password placeholder="Performer password" />
          </Form.Item>,
          <Form.Item
            key="rePassword"
            name="rePassword"
            label="Confirm password"
            rules={[{ required: true }, { min: 6 }]}
          >
            <Input.Password placeholder="Confirm performer password" />
          </Form.Item>
        ]}

        <Form.Item name="country" label="Country" rules={[{ required: true }]}>
          <Select
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {countries.map((country) => (
              <Select.Option key={country.code} value={country.code}>
                {country.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        {/* {!studio && [
          <Form.Item
            name="commission"
            label="Commission"
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
        ]} */}
        <Form.Item name="status" label="Status" rules={[{ required: true }]}>
          <Select>
            <Select.Option key="active" value="active">
              Active
            </Select.Option>
            <Select.Option key="inactive" value="inactive">
              Inactive
            </Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="emailVerified"
          label="Verified Email"
          valuePropName="checked"
        >
          <Switch
            defaultChecked={
              studio && studio.emailVerified ? studio.emailVerified : false
            }
          />
        </Form.Item>
        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
          <Button type="primary" htmlType="submit" loading={submiting}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    );
  }
}
