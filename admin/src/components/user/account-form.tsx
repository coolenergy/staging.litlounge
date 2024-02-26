import { PureComponent, Fragment } from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  InputNumber,
  DatePicker,
  Switch
} from 'antd';
import { IUser, ICountry } from 'src/interfaces';
import { MediaUpload } from '@components/file/media-upload';
import moment from 'moment';
import { getGlobalConfig } from '@services/config';

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
  onFinish: Function;
  user?: IUser;
  updating?: boolean;
  options?: {
    uploadHeaders?: any;
    avatarUploadUrl?: string;
    onAvatarUploaded?: Function;
    beforeUpload?: Function;
  };
  countries: ICountry[];
}

export class AccountForm extends PureComponent<IProps> {
  render() {
    const { onFinish, user, updating, countries } = this.props;
    const {
      uploadHeaders,
      avatarUploadUrl,
      onAvatarUploaded,
      beforeUpload
    } = this.props.options;
    const config = getGlobalConfig();
    return (
      <Form
        {...layout}
        name="nest-messages"
        onFinish={onFinish.bind(this)}
        validateMessages={validateMessages}
        initialValues={
          user
            ? { ...user, dateOfBirth: moment(user.dateOfBirth) }
            : {
              country: 'US',
              status: 'active',
              gender: 'male',
              roles: ['user']
            }
        }
      >
        <Form.Item
          name="firstName"
          label="First name"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="lastName"
          label="Last name"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="dateOfBirth"
          label="Date of Birth"
          rules={[
            {
              required: true,
              message: 'Please input date of birth!'
            },
            {
              validator: (rule, value) => {
                if (!value) return Promise.resolve();
                const years = moment().diff(value, 'years');
                if (years >= 18) {
                  return Promise.resolve();
                }
                return Promise.reject('Minimum of 18 years');
              }
            }
          ]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="gender" label="Gender" rules={[{ required: true }]}>
          <Select>
            <Select.Option key="male" value="male">
              Male
            </Select.Option>
            <Select.Option key="female" value="female">
              Female
            </Select.Option>
            <Select.Option key="transgender" value="transgender">
              Transgender
            </Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="phone"
          label="Phone Number"
          rules={[
            { min: 9 },
            { max: 14 },
            {
              pattern: /^[0-9\b\+ ]+$/,
              message: 'The phone number is not in the correct format'
            }
          ]}
        >
          <Input style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true }, { min: 3 }]}
        >
          <Input placeholder="Unique, lowercase and number, no space or special chars" />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[{ type: 'email', required: true }]}
        >
          <Input />
        </Form.Item>
        {!user && (
          <Fragment>
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true }, { min: 6 }]}
            >
              <Input.Password placeholder="User password" />
            </Form.Item>
            <Form.Item
              name="rePassword"
              label="Confirm password"
              rules={[{ required: true }, { min: 6 }]}
            >
              <Input.Password placeholder="Confirm user password" />
            </Form.Item>
          </Fragment>
        )}
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
        <Fragment>
          <Form.Item name="balance" label="Balance">
            <InputNumber />
          </Form.Item>
          <Form.Item name="roles" label="Roles" rules={[{ required: true }]}>
            <Select mode="multiple">
              <Select.Option key="user" value="user">
                User
                </Select.Option>
              <Select.Option key="admin" value="admin">
                Admin
                </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="emailVerified"
            label="Verified Email"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Fragment>
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
          label="Avatar"
          help={`Image must smaller than ${config.NEXT_PUBLIC_MAXIMUM_SIZE_UPLOAD_IMAGE || 2
            }MB! Only accept ${config.NEXT_PUBLIC_IMAGE_ACCPET}.`}
        >
          {/* <Avatar alt="Avatar" /> */}
          <MediaUpload
            name='avatar'
            headers={uploadHeaders}
            uploadUrl={avatarUploadUrl}
            onUploaded={onAvatarUploaded}
            imageUrl={user ? user.avatar : ''}
            uploadNow={user ? true : false}
            beforeUpload={beforeUpload}
          />
        </Form.Item>
        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
          <Button type="primary" htmlType="submit" loading={updating}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    );
  }
}
