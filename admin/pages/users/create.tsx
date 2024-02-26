import Head from 'next/head';
import { PureComponent, Fragment } from 'react';
import { Form, message, Input, Button, Select, InputNumber } from 'antd';
import Page from '@components/common/layout/page';
import { IUser, ICountry } from 'src/interfaces';
import Router from 'next/router';
import { authService, userService } from '@services/index';
import { utilsService } from '@services/utils.service';
import { validateUsername, getResponseError } from '@lib/utils';
import { AccountForm } from '@components/user/account-form';

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
  countries: ICountry[];
}
class UserCreate extends PureComponent<IProps> {
  static async getInitialProps() {
    const resp = await utilsService.countriesList();
    return {
      countries: resp.data
    };
  }

  state = {
    pwUpdating: false,
    creating: false,
    fetching: false,
    user: {} as IUser
  };

  _avatar: File;

  async submit(data: any) {
    try {
      if (data.password !== data.rePassword) {
        return message.error('Confirm password mismatch!');
      }

      if (!validateUsername(data.username)) {
        return message.error('Username is invalid!');
      }

      this.setState({ creating: true });
      const resp = await userService.create(data);
      message.success('Updated successfully');
      if (this._avatar) {
        await userService.uploadAvatarUser(this._avatar, resp.data._id);
      }
      Router.push(`/users/update?id=${resp.data._id}`);
    } catch (e) {
      const err = (await Promise.resolve(e)) || {};
      message.error(
        getResponseError(err) || 'An error occurred, please try again!'
      );
    } finally {
      this.setState({ creating: false });
    }
  }

  onBeforeUpload(file) {
    this._avatar = file;
  }

  render() {
    const { creating } = this.state;
    const { countries } = this.props;
    const uploadHeaders = {
      authorization: authService.getToken()
    };
    return (
      <Fragment>
        <Head>
          <title>Create user</title>
        </Head>
        <Page>
          <AccountForm
            onFinish={this.submit.bind(this)}
            updating={creating}
            options={{
              beforeUpload: this.onBeforeUpload.bind(this)
            }}
            countries={countries}
          />
          {/* <Form
            {...layout}
            name="nest-messages"
            onFinish={this.submit.bind(this)}
            validateMessages={validateMessages}
            initialValues={{
              country: 'US',
              status: 'active',
              gender: 'male',
              roles: ['user']
            }}
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
              name="gender"
              label="Gender"
              rules={[{ required: true }]}
            >
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
              <Input placeholder="email@examle.com" />
            </Form.Item>
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
            <Form.Item
              name="country"
              label="Country"
              rules={[{ required: true }]}
            >
              <Select>
                {countries.map((country) => (
                  <Select.Option key={country.code} value={country.code}>
                    {country.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="balance" label="Balance">
              <InputNumber />
            </Form.Item>
            <Form.Item name="roles" label="Roles" rules={[{ required: true }]}>
              <Select defaultValue={['user']} mode="multiple">
                <Select.Option key="user" value="user">
                  User
                </Select.Option>
                <Select.Option key="admin" value="admin">
                  Admin
                </Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true }]}
            >
              <Select>
                <Select.Option key="active" value="active">
                  Active
                </Select.Option>
                <Select.Option key="inactive" value="inactive">
                  Inactive
                </Select.Option>
              </Select>
            </Form.Item>
            <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
              <Button type="primary" htmlType="submit" loading={creating}>
                Create
              </Button>
            </Form.Item>
          </Form> */}
        </Page>
      </Fragment>
    );
  }
}

export default UserCreate;
