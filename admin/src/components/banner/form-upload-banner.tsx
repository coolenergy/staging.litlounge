/* eslint-disable jsx-a11y/label-has-associated-control */
import { PureComponent, createRef, Fragment } from 'react';
import { Form, Input, Select, Upload, Button, message, Progress } from 'antd';
import { IBannerUpdate, IBannerCreate } from 'src/interfaces';
import { UploadOutlined } from '@ant-design/icons';
import { FormInstance } from 'antd/lib/form';
import { ThumbnailBanner } from '@components/banner/thumbnail-banner';
import TextArea from 'antd/lib/input/TextArea';
import { getGlobalConfig } from '@services/config';

interface IProps {
  banner?: IBannerUpdate;
  submit?: Function;
  beforeUpload?: Function;
  uploading?: boolean;
  uploadPercentage?: number;
}

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 }
};

const validateMessages = {
  required: 'This field is required!'
};

export class FormUploadBanner extends PureComponent<IProps> {
  state = {
    preview: null,
    type: 'img'
  };

  formRef: any;

  componentDidMount() {
    if (!this.formRef) this.formRef = createRef();
    if (this.props.banner?.type == 'img'){
      this.setState({ type: 'img'})
    } else if (this.props.banner?.type == 'html')
    {
      this.setState({ type: 'html'})
    }
  }

  setFormVal(field: string, val: any) {
    const instance = this.formRef.current as FormInstance;
    instance.setFieldsValue({
      [field]: val
    });
  }

  beforeUpload(file) {
    const config = getGlobalConfig();
    const { beforeUpload: handleUpload } = this.props;
    const isMaxSize =
      file.size / 1024 / 1024 < (config.NEXT_PUBLIC_MAXIMUM_SIZE_UPLOAD_IMAGE || 10);
    if (!isMaxSize) {
      message.error(
        `Image must be smaller than ${config.NEXT_PUBLIC_MAXIMUM_SIZE_UPLOAD_IMAGE || 10}MB!`
      );
      return false;
    }
    const reader = new FileReader();
    reader.addEventListener('load', () =>
      this.setState({ preview: reader.result })
    );
    reader.readAsDataURL(file);
    handleUpload(file);
    return false;
  }

  onSelect(type: string) {
    this.setState({ type })
  }

  render() {
    if (!this.formRef) this.formRef = createRef();
    const { banner, submit, uploading, uploadPercentage } = this.props;
    const { preview, type } = this.state;
    const haveBanner = !!banner;
    const config = getGlobalConfig();
    return (
      <Form
        {...layout}
        onFinish={submit && submit.bind(this)}
        onFinishFailed={() =>
          message.error('Please complete the required fields')
        }
        name="form-upload-banner"
        ref={this.formRef}
        validateMessages={validateMessages}
        initialValues={
          banner ||
          ({
            title: '',
            description: '',
            href: '',
            status: 'active',
            position: 'top',
            type: 'img'
          } as IBannerCreate)
        }
      >
        <Form.Item
          name="title"
          rules={[{ required: true, message: 'Please input title of banner!' }]}
          label="Title"
        >
          <Input placeholder="Enter banner title" />
        </Form.Item>
        <Form.Item
          name="position"
          label="Position"
          rules={[{ required: true, message: 'Please select position!' }]}
        >
          <Select>
            <Select.Option key="top" value="top">
              Top
            </Select.Option>
            <Select.Option key="bottom" value="bottom">
              Bottom
            </Select.Option>
            {/* <Select.Option key="left" value="left">
              Left
            </Select.Option> */}
            <Select.Option key="right" value="right">
              Right
            </Select.Option>
            {/* <Select.Option key="middle" value="middle">
              Middle
            </Select.Option> */}
          </Select>
        </Form.Item>
        <Form.Item name="href" label="Link"><Input type="url" placeholder="Enter banner link" /></Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: 'Please select status!' }]}
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
        <Form.Item
          name="type"
          label="Type"
          rules={[{ required: true, message: 'Please select type for banner!' }]}>
          <Select onSelect={this.onSelect.bind(this)}>
            <Select.Option key="img" value="img">
              Image
            </Select.Option>
            <Select.Option key="html" value="html">
              HTML
            </Select.Option>
          </Select>
        </Form.Item>
        {type == 'html' && (
          <Form.Item
            name="contentHTML"
            label="HTML"
          >
            <TextArea rows={3} />
          </Form.Item>)}
        <>
          {type == 'img' && (
            <div key="thumbnail" className="ant-row ant-form-item">
              <div className="ant-col ant-col-4 ant-form-item-label">
                <label>Banner </label>
              </div>
              <div className="ant-col ant-col-16 ant-form-item-control">
                <p>Ratio dimension 4:1 (eg: 1600px:400px)</p>
                {!haveBanner ? (
                  <>
                    <Upload
                      accept={'image/*'}
                      multiple={false}
                      showUploadList={false}
                      disabled={uploading || haveBanner}
                      beforeUpload={(file) => this.beforeUpload(file)}
                    >
                      {preview ? (
                        <img
                          src={preview}
                          alt="file"
                          style={{ width: '250px', marginBottom: '10px' }}
                        />
                      ) : null}
                      <div style={{ clear: 'both' }} />
                      {!haveBanner && (
                        <Button>
                          <UploadOutlined /> Select File
                        </Button>
                      )}
                    </Upload>
                    {uploadPercentage ? (
                      <Progress percent={uploadPercentage} />
                    ) : null}
                  </>
                ) : (
                  <ThumbnailBanner banner={banner} style={{ width: '250px' }} />
                )}
                <div className="ant-form-item-explain">
                  <div>
                    Image must smaller than {config.NEXT_PUBLIC_MAXIMUM_SIZE_UPLOAD_IMAGE || 10} MB!
                </div>
                </div>
              </div>
            </div>)}
        </>
        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
          <Button type="primary" htmlType="submit" loading={uploading}>
            {haveBanner ? 'Update' : 'Upload'}
          </Button>
        </Form.Item>
      </Form>
    );
  }
}
