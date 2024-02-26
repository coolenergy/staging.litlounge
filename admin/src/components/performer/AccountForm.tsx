import { PureComponent, Component, createRef } from 'react';
import { Form, Input, Button, Select, Switch, message } from 'antd';
import { MediaUpload } from '@components/file/media-upload';
import {
  IPerformerUpdate,
  ICountry,
  ILangguges,
  IPhoneCodes,
  IPerformerCategory,
  IPerformerCreate,
  IStudio
} from 'src/interfaces';
import { authService, performerService } from '@services/index';
import { getGlobalConfig } from '@services/config';

const layout = {
  labelCol: { lg: {span: 4} , sm: {span: 10} },
  wrapperCol: { lg: {span: 16} , sm: {span: 10}}
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
  onUploaded: Function;
  performer?: IPerformerUpdate;
  submiting?: boolean;
  countries: ICountry[];
  languages: ILangguges[];
  phoneCodes?: IPhoneCodes[];
  studios?: IStudio[];
  categories: IPerformerCategory[];
  ref?: Function;
}

export class AccountForm extends PureComponent<IProps> {
  private formRef = createRef() as any;
  formRefSubmit() {
    this.formRef.current.submit();
  }
  render() {
    const {
      performer,
      onFinish,
      submiting,
      countries,
      languages,
      categories,
      onUploaded,
      studios
    } = this.props;
    const uploadHeaders = {
      authorization: authService.getToken()
    };
    const config = getGlobalConfig();
    return (
      <Form
        ref={this.formRef}
        {...layout}
        name="form-performer"
        onFinish={onFinish.bind(this)}
        onFinishFailed={() =>
          message.error(
            'Please complete the required fields in tab general info'
          )
        }
        validateMessages={validateMessages}
        initialValues={
          performer
            ? performer
            : ({
                country: 'US',
                status: 'active',
                gender: 'male',
                languages: ['en'],
                emailVerified: false,
                socials: {
                  facebook: 'facebook.com',
                  twitter: 'twitter.com',
                  instagram: 'instagram.com'
                }
              } as IPerformerCreate)
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
        {/* TODO - check is number */}
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
        {categories && categories.length > 0 && (
          <Form.Item
            name="categoryIds"
            label="Categories"
            rules={[
              {
                type: 'array'
              }
            ]}
          >
            <Select mode="multiple">
              {categories.map((cat) => (
                <Select.Option key={cat.slug} value={cat._id}>
                  {cat.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}
        {studios && studios.length > 0 && (
          <Form.Item name="studioId" label="Studio">
            <Select>
              {studios.map((s) => (
                <Select.Option key={s._id} value={s._id}>
                  {s.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}
        {!performer && [
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
            {countries && countries.map((country) => (
              <Select.Option key={country.code} value={country.code}>
                {country.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="city" label="City">
          <Input placeholder="Enter the city" />
        </Form.Item>
        <Form.Item name="state" label="State">
          <Input placeholder="Enter the state" />
        </Form.Item>
        <Form.Item name="address" label="Address">
          <Input placeholder="Enter the address" />
        </Form.Item>
        <Form.Item name="zipcode" label="Zipcode">
          <Input placeholder="Enter the zipcode" />
        </Form.Item>
        <Form.Item
          name="languages"
          label="Languages"
          rules={[
            {
              type: 'array'
            }
          ]}
        >
          <Select mode="multiple">
            {languages && languages.map((l) => (
              <Select.Option key={l.code} value={l.code}>
                {l.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="status" label="Status" rules={[{ required: true }]}>
          <Select>
            <Select.Option key="active" value="active">
              Active
            </Select.Option>
            <Select.Option key="inactive" value="inactive">
              Inactive
            </Select.Option>
            <Select.Option key="pending" value="pending">
              Pending
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
        <Form.Item
          label="Avatar"
          help={`Image must smaller than ${
            config.NEXT_PUBLIC_MAXIMUM_SIZE_UPLOAD_IMAGE || 2
          }MB! Only accept ${config.NEXT_PUBLIC_IMAGE_ACCPET}.`}
        >
          <MediaUpload
            name="avatar"
            imageUrl={performer && performer.avatar ? performer.avatar : ''}
            uploadUrl={performerService.getAvatarUploadUrl()}
            headers={uploadHeaders}
            onUploaded={onUploaded.bind(this, 'avatarId')}
            uploadNow={true}
          />
        </Form.Item>
        <Form.Item
          label="Header"
          help={`Image must smaller than ${
            config.NEXT_PUBLIC_MAXIMUM_SIZE_UPLOAD_IMAGE || 2
          }MB! Only accept ${config.NEXT_PUBLIC_IMAGE_ACCPET}.`}
        >
          <MediaUpload
            name="header"
            imageUrl={performer && performer.header ? performer.header : ''}
            uploadUrl={performerService.getHeaderUploadUrl()}
            headers={uploadHeaders}
            onUploaded={onUploaded.bind(this, 'headerId')}
            uploadNow={true}
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
