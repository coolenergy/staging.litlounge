import Head from 'next/head';
import { PureComponent, Fragment, createRef } from 'react';
import dynamic from 'next/dynamic';
import {
  Form,
  Menu,
  message,
  Button,
  Input,
  InputNumber,
  Switch,
  Radio,
  Checkbox,
  Select
} from 'antd';
import Page from '@components/common/layout/page';
import { ISetting } from 'src/interfaces';
import Loader from '@components/common/base/loader';
import { ImageUpload } from '@components/file/image-upload';
import SoundUpload from '@components/file/sound-upload';
import { authService } from '@services/auth.service';
import { settingService } from '@services/setting.service';
import { FormInstance } from 'antd/lib/form';
import { getResponseError } from '@lib/utils';
import { SelectPostDropdown } from '@components/post/select-post-dropdown';
import { capitalizeFirstLetter } from '@lib/string';

const WYSIWYG = dynamic(() => import('@components/wysiwyg'), {
  ssr: false
});

const { Option } = Select;

class Settings extends PureComponent {
  private footerContent: string = '';

  state = {
    updating: false,
    loading: false,
    selectedTab: 'general',
    list: [],
    disableButton: false
  };

  formRef: any;
  dataChange = {} as any;
  smtpInfo = {
    host: '',
    port: 465,
    secure: true,
    auth: {
      user: '',
      password: ''
    }
  } as any;

  componentDidMount() {
    this.formRef = createRef();
    this.loadSettings();
  }

  async onMenuChange(menu) {
    await this.setState({
      selectedTab: menu.key
    });

    await this.loadSettings();
  }

  async loadSettings() {
    const { selectedTab } = this.state;
    try {
      await this.setState({ loading: true });
      const resp = (await settingService.all(this.state.selectedTab)) as any;
      this.dataChange = {};
      if (selectedTab === 'mailer' && resp.data && resp.data.length) {
        const info = resp.data.find((data) => data.key === 'smtpTransporter');
        if (info) this.smtpInfo = info.value;
      }
      this.setState({ list: resp.data });
    } catch (e) {
      const error = await Promise.resolve(e);
      message.error(getResponseError(error));
    } finally {
      await this.setState({ loading: false });
    }
  }

  async submit() {
    try {
      await this.setState({ updating: true });
      for (const key of Object.keys(this.dataChange)) {
        await settingService.update(key, this.dataChange[key]);
      }
      this.state.selectedTab === 'commission'
        ? message.success('Default commission setting saved')
        : message.success(
            `${capitalizeFirstLetter(this.state.selectedTab)} settings saved`
          );
    } catch (e) {
      const error = await Promise.resolve(e);
      message.error(getResponseError(error));
    } finally {
      await this.setState({ updating: false });
    }
  }

  renderUpload(setting: ISetting, ref: any) {
    if (!setting.meta || !setting.meta.upload) {
      return null;
    }
    const uploadHeaders = {
      authorization: authService.getToken()
    };
    return (
      <div style={{ padding: '10px 0' }} key={`upload${setting._id}`}>
        {setting.meta.image ? (
          <ImageUpload
            imageUrl={setting.value}
            uploadUrl={settingService.getFileUploadUrl()}
            headers={uploadHeaders}
            onUploaded={(resp) => {
              const formInstance = this.formRef.current as FormInstance;
              ref.current.input.value = resp.response.data.url;
              formInstance.setFieldsValue({
                [setting.key]: resp.response.data.url
              });
              this.dataChange[setting.key] = resp.response.data.url;
            }}
          />
        ) : (
          <SoundUpload
            fileUrl={setting.value}
            uploadUrl={settingService.getFileUploadUrl()}
            headers={uploadHeaders}
            onUploaded={(resp) => {
              const formInstance = this.formRef.current as FormInstance;
              ref.current.input.value = resp.response.data.url;
              formInstance.setFieldsValue({
                [setting.key]: resp.response.data.url
              });
              this.dataChange[setting.key] = resp.response.data.url;
            }}
          />
        )}
      </div>
    );
  }

  setVal(field: string, val: any) {
    if (val > 100 || val < 0) {
      this.setState({ disableButton: true })
    } else {
      this.setState({ disableButton: false })
    }
    this.dataChange[field] = val;
  }

  setObject(field: string, val: any) {
    if (field === 'user' || field === 'pass') {
      this.smtpInfo.auth[field] = val;
    } else {
      this.smtpInfo[field] = val;
    }
    this.dataChange.smtpTransporter = this.smtpInfo;
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  renderFormItem(setting: ISetting) {
    const { updating, disableButton } = this.state;
    let type = setting.type;
    if (setting.meta && setting.meta.textarea) {
      type = 'textarea';
    }
    const ref = createRef() as any;
    switch (type) {
      case 'textarea':
        return (
          <Form.Item
            label={setting.name}
            key={setting._id}
            extra={setting.description}
          >
            <Input.TextArea
              defaultValue={setting.value}
              onChange={(val) => this.setVal(setting.key, val.target.value)}
            />
          </Form.Item>
        );
      case 'text-editor':
        return (
          <Form.Item
            label={setting.name}
            key={setting._id}
            help={setting.description}
          >
            <WYSIWYG
              onChange={({ html }) => this.setVal(setting.key, html)}
              html={setting.value}
            />
          </Form.Item>
        );
      case 'checkbox':
        return (
          <Form.Item label={setting.name} key={setting._id}>
            <Checkbox.Group
              options={setting.meta.options}
              onChange={(checkedValues) =>
                this.setVal(setting.key, checkedValues)
              }
              defaultValue={setting.value}
            />
          </Form.Item>
        );
      case 'number':
        return (
          <Form.Item
            label={setting.name}
            key={setting._id}
            extra={setting.description}
            name={setting.key}
            rules={[
              {
                validator: (_, value) => {
                  if (typeof value !== 'number') {
                    return Promise.reject('This field must be a number!');
                  }
                  if (
                    setting.meta &&
                    typeof setting.meta.min !== 'undefined' &&
                    value < setting.meta.min
                  ) {
                    return Promise.reject('Minimum ' + setting.meta.min);
                  }
                  if (
                    setting.meta &&
                    typeof setting.meta.min !== 'undefined' &&
                    value > setting.meta.max
                  ) {
                    return Promise.reject('Maximum ' + setting.meta.max);
                  }

                  return Promise.resolve();
                }
              }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              step={
                setting.meta && typeof setting.meta.step !== 'undefined'
                  ? setting.meta.step
                  : 1
              }
              defaultValue={setting.value}
              onChange={(val) => this.setVal(setting.key, val)}
              min={
                setting.meta && typeof setting.meta.min !== 'undefined'
                  ? setting.meta.min
                  : Number.MIN_SAFE_INTEGER
              }
              max={
                setting.meta && typeof setting.meta.max !== 'undefined'
                  ? setting.meta.max
                  : Number.MAX_SAFE_INTEGER
              }
              type="number"
            />
          </Form.Item>
        );
      case 'boolean':
        return (
          <div
            className="ant-row ant-form-item ant-form-item-with-help"
            key={setting._id}
          >
            <div className="ant-col ant-col-4 ant-form-item-label">
              <label>{setting.name}</label>
            </div>
            <div className="ant-col ant-col-16 ant-form-item-control">
              <Switch
                defaultChecked={setting.value}
                onChange={(val) => this.setVal(setting.key, val)}
              />
              <div className="ant-form-item-explain">{setting.description}</div>
            </div>
          </div>
        );
      case 'commission':
        return (
          <Form.Item
            name={setting.key}
            label={setting.name}
            key={setting._id}
            extra={setting.description}
            rules={[
              {
                validator(_, value) {
                  if (!value) return Promise.resolve();

                  if (typeof value === 'string') {
                    return Promise.reject(
                      'Commission value should not be a alphabet'
                    );
                  }

                  if (!value || value > 100 || value < 0) {
                    return Promise.reject(
                      'Commission value cannot be blank or greater than 100'
                    );
                  }
                  return Promise.resolve();
                }
              },
              {
                required: true,
                message: 'Commission value cannot be blank or greater than 100'
              }
            ]}
          >
            <InputNumber
              type='number'
              min={0}
              step={0.01}
              defaultValue={setting.value}
              onChange={(val) => this.setVal(setting.key, val)}
              required
            />
          </Form.Item>
        );
      case 'mixed':
        return (
          <div
            className="ant-row ant-form-item ant-form-item-with-help"
            key={setting._id}
          >
            <div className="ant-col ant-col-4 ant-form-item-label">
              <label htmlFor="setting-name">{setting.name}</label>
            </div>
            <div className="ant-col ant-col-20 ant-form-item-control">
              <div className="ant-form-item">
                <div>
                  <label htmlFor="host-name">Host</label>
                  <Input
                    defaultValue={setting?.value?.host}
                    onChange={(val) => this.setObject('host', val.target.value)}
                  />
                </div>
                <div>
                  <label>Port</label>
                  <Input
                    defaultValue={setting?.value?.port}
                    onChange={(val) => this.setObject('port', val.target.value)}
                  />
                </div>
                <div style={{ margin: '10px 0' }}>
                  <label>
                    <Checkbox
                      defaultChecked={setting?.value?.secure || false}
                      onChange={(e) =>
                        this.setObject('secure', e.target.checked)
                      }
                    />{' '}
                    Secure (true for port 465, false for other ports)
                  </label>
                </div>
                <div>
                  <label>Auth user</label>
                  <Input
                    defaultValue={setting?.value?.auth?.user}
                    onChange={(val) => this.setObject('user', val.target.value)}
                  />
                </div>
                <div>
                  <label>Auth password</label>
                  <Input
                    defaultValue={setting?.value?.auth?.pass}
                    onChange={(val) => this.setObject('pass', val.target.value)}
                  />
                </div>
              </div>
              <div className="ant-form-item-explain">{setting.description}</div>
              <div>
                <Button
                  disabled={updating}
                  loading={updating}
                  onClick={this.verifyMailer.bind(this)}
                  type="link"
                >
                  Once saved, click here to send a testing email using this
                  configuration above
                </Button>
              </div>
            </div>
          </div>
        );
      case 'radio':
        return (
          <Form.Item
            label={setting.name}
            key={setting._id}
            help={setting.description}
            extra={setting.extra}
          >
            <Radio.Group
              onChange={(val) => this.setVal(setting.key, val.target.value)}
              defaultValue={setting.value}
            >
              {setting.meta?.value.map((v: any) => (
                <Radio
                  value={v.key}
                  checked={this.dataChange[setting.key] === v.key}
                >
                  {v.name}
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>
        );
      case 'post':
        return (
          <Form.Item
            label={setting.name}
            key={setting._id}
            help={setting.description}
            extra={setting.extra}
          >
            <SelectPostDropdown
              defaultValue={setting.value}
              onSelect={(val) => this.setVal(setting.key, val)}
            />
          </Form.Item>
        );
      case 'dropdown':
      case 'radio':
        return (
          <Form.Item
            label={setting.name}
            key={setting._id}
            help={setting.description}
            extra={setting.extra}
          >
            <Select
              onChange={(val) => this.setVal(setting.key, val)}
              defaultValue={setting.value}
            >
              {setting.meta?.value.map((v: any) => (
                <Option value={v.key}>{v.name}</Option>
              ))}
            </Select>
          </Form.Item>
        );
      case 'password':
        return (
          <Form.Item
            label={setting.name}
            key={setting._id}
            help={setting.description}
            extra={setting.extra}
          >
            <Input
              type="password"
              defaultValue={setting.value}
              onChange={(val) => this.setVal(setting.key, val.target.value)}
            />
          </Form.Item>
        );
      default:
        return (
          <Form.Item
            label={setting.name}
            key={setting._id}
            help={setting.description}
            extra={setting.extra}
          >
            <Input
              defaultValue={setting.value}
              ref={ref}
              key={`input${setting._id}`}
              onChange={(val) => this.setVal(setting.key, val.target.value)}
            />
            {this.renderUpload(setting, ref)}
          </Form.Item>
        );
    }
  }

  async verifyMailer() {
    try {
      this.setState({ updating: true });
      const resp = await settingService.verifyMailer();
      if (resp.data.hasError) {
        return message.error(
          resp.data.error || 'Could not verify this SMTP transporter'
        );
      }
      message.success(
        "We've sent and test email, please check your email inbox or spam folder"
      );
    } catch (e) {
      const err = await Promise.resolve(e);
      message.error(
        err && err.errno ? err.errno : 'Could not verify this SMTP transporter'
      );
    } finally {
      this.setState({ updating: false });
    }
  }

  render() {
    const { updating, selectedTab, list, loading, disableButton } = this.state;
    const fixedTabs = ['commission', 'ccbill', 'custom', 'mailer'];
    const layout = fixedTabs.includes(selectedTab)
      ? {
          labelCol: { span: 8 },
          wrapperCol: { span: 16 }
        }
      : {
          labelCol: { span: 4 },
          wrapperCol: { span: 16 }
        };

    const initialValues = {} as any;
    list.forEach((item: ISetting) => {
      initialValues[item.key] = item.value;
    });
    return (
      <Fragment>
        <Head>
          <title>Site Settings</title>
        </Head>
        <Page>
          <div style={{ marginBottom: '20px' }}>
            <Menu
              onClick={this.onMenuChange.bind(this)}
              selectedKeys={[selectedTab]}
              mode="horizontal"
            >
              <Menu.Item key="general">General</Menu.Item>
              <Menu.Item key="email">Email</Menu.Item>
              <Menu.Item key="custom">Custom</Menu.Item>
              <Menu.Item key="commission">Commission</Menu.Item>
              <Menu.Item key="ccbill">CCbill</Menu.Item>
              <Menu.Item key="mailer">SMTP</Menu.Item>
              <Menu.Item key="analytics">Google Analytics</Menu.Item>
              <Menu.Item key="default-price">Default Price</Menu.Item>
              <Menu.Item key="customText">Custom Text</Menu.Item>
              <Menu.Item key="ant">Ant Media</Menu.Item>
              <Menu.Item key="currency">Currency</Menu.Item>
            </Menu>
          </div>

          {loading ? (
            <Loader spinning={true} />
          ) : (
            <Form
              {...layout}
              onKeyPress={(e) => {
                if (e.keyCode === 13) return;
              }}
              layout={
                fixedTabs.includes(selectedTab) ? 'vertical' : 'horizontal'
              }
              name="setting-frm"
              onFinish={this.submit.bind(this)}
              initialValues={initialValues}
              ref={this.formRef}
            >
              {list.map((setting) => this.renderFormItem(setting))}
              {selectedTab === 'mailer' && (
                <Form.Item>
                  <Button
                    disabled={updating}
                    loading={updating}
                    onClick={this.verifyMailer.bind(this)}
                    type="primary"
                  >
                    Once saved, click here to send a testing email using this
                    configuration above
                  </Button>
                </Form.Item>
              )}
              <Form.Item
                wrapperCol={{ ...layout.wrapperCol, offset: 4 }}
                style={{ textAlign: 'right' }}
              >
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={updating}
                  disabled={disableButton}
                >
                  Submit
                </Button>
              </Form.Item>
            </Form>
          )}
        </Page>
      </Fragment>
    );
  }
}

export default Settings;
