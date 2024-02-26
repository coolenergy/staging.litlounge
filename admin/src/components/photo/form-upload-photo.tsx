import { PureComponent, createRef, Fragment } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  Button,
  message,
  Progress
} from 'antd';
import { IPhotoUpdate, IPhotoCreate, IGallery } from 'src/interfaces';
import { UploadOutlined } from '@ant-design/icons';
import { SelectPerformerDropdown } from '@components/performer/common/select-performer-dropdown';
import { FormInstance } from 'antd/lib/form';
import { ThumbnailPhoto } from '@components/photo/thumbnail-photo';
import { SelectGalleryDropdown } from '@components/gallery/common/select-gallery-dropdown';
import { galleryService } from '@services/gallery.service';
import { getGlobalConfig } from '@services/config';

interface IProps {
  photo?: IPhotoUpdate;
  submit?: Function;
  beforeUpload?: Function;
  uploading?: boolean;
  uploadPercentage?: number;
  performerId?: string;
  galleryId?: string;
}

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 }
};

const validateMessages = {
  required: 'This field is required!'
};

export class FormUploadPhoto extends PureComponent<IProps> {
  state = {
    preview: null,
    galleries: [] as IGallery[]
  };
  formRef: any;

  componentDidMount() {
    if (!this.formRef) this.formRef = createRef();
    const { photo } = this.props;
    const pId = (photo && photo.performerId) || this.props.performerId || '';
    if (pId) {
      this.findGalleries(pId);
    }
  }

  async findGalleries(performerId?: string) {
    const resp = await galleryService.search({
      performerId: performerId,
      limit: 1000
    });
    this.setState({ galleries: resp.data.data || [] });
  }

  setFormVal(field: string, val: any) {
    const instance = this.formRef.current as FormInstance;
    instance.setFieldsValue({
      [field]: val
    });
    if (field === 'performerId') {
      this.findGalleries(val);
    }
  }

  beforeUpload(file) {
    const config = getGlobalConfig();
    const ext = file.name.split('.').pop().toLowerCase();
    const isImageAccept = config.NEXT_PUBLIC_IMAGE_ACCPET
      .split(',')
      .map((item: string) => item.trim())
      .indexOf(`.${ext}`);
    if (isImageAccept === -1) {
      message.error(`You can only upload ${config.NEXT_PUBLIC_IMAGE_ACCPET} file!`);
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < (config.NEXT_PUBLIC_MAXIMUM_SIZE_UPLOAD_IMAGE || 2);
    if (!isLt2M) {
      message.error(
        `Image must smaller than ${config.NEXT_PUBLIC_MAXIMUM_SIZE_UPLOAD_IMAGE || 2}MB!`
      );
      return false;
    }
    const reader = new FileReader();
    reader.addEventListener('load', () =>
      this.setState({ preview: reader.result })
    );
    reader.readAsDataURL(file);
    this.props.beforeUpload(file);
    return false;
  }

  render() {
    if (!this.formRef) this.formRef = createRef();
    const {
      photo,
      submit,
      uploading,
      uploadPercentage,
      galleryId
    } = this.props;
    const { preview } = this.state;
    const havePhoto = photo ? true : false;
    const config = getGlobalConfig();
    return (
      <Form
        {...layout}
        onFinish={submit && submit.bind(this)}
        onFinishFailed={() =>
          message.error('Please complete the required fields')
        }
        name="form-upload"
        ref={this.formRef}
        validateMessages={validateMessages}
        initialValues={
          photo
            ? photo
            : ({
                title: '',
                description: '',
                status: 'draft',
                performerId: this.props.performerId || '',
                galleryId: this.props.galleryId || ''
              } as IPhotoCreate)
        }
      >
        <Form.Item
          name="performerId"
          label="Performer"
          rules={[{ required: true }]}
        >
          <SelectPerformerDropdown
            disabled={havePhoto}
            defaultValue={
              (photo && photo.performerId) || this.props.performerId || ''
            }
            onSelect={(val) => this.setFormVal('performerId', val)}
          />
        </Form.Item>
        <Form.Item
          name="galleryId"
          label="Gallery"
          rules={[{ required: true, message: 'Please select a gallery' }]}
        >
          <SelectGalleryDropdown
            galleries={this.state.galleries}
            disabled={this.state.galleries.length <= 0}
            defaultValue={
              photo && photo.galleryId
                ? photo.galleryId
                : galleryId
                ? galleryId
                : null
            }
            onSelect={(val) => this.setFormVal('galleryId', val)}
          />
        </Form.Item>
        <Form.Item
          name="title"
          rules={[{ required: true, message: 'Please input title of photo!' }]}
          label="Title"
        >
          <Input placeholder="Enter photo title" />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: 'Please select status!' }]}
        >
          <Select>
            <Select.Option value="draft">Draft</Select.Option>
            <Select.Option key="active" value="active">
              Active
            </Select.Option>
            <Select.Option key="inactive" value="inactive">
              Inactive
            </Select.Option>
          </Select>
        </Form.Item>
        <Fragment>
          <div key="thumbnail" className="ant-row ant-form-item">
            <div className="ant-col ant-col-4 ant-form-item-label">
              <label>Photo</label>
            </div>
            <div className="ant-col ant-col-16 ant-form-item-control">
              {!havePhoto ? (
                <Fragment>
                  <Upload
                    accept={config.NEXT_PUBLIC_IMAGE_ACCPET || 'image/*'}
                    multiple={false}
                    showUploadList={false}
                    disabled={uploading || havePhoto}
                    beforeUpload={(file) => this.beforeUpload(file)}
                  >
                    {preview ? (
                      <img
                        src={preview}
                        alt="file"
                        style={{ width: '250px', marginBottom: '10px' }}
                      />
                    ) : null}
                    <div style={{ clear: 'both' }}></div>
                    {!havePhoto && (
                      <Button>
                        <UploadOutlined /> Select File
                      </Button>
                    )}
                  </Upload>
                  {uploadPercentage ? (
                    <Progress percent={uploadPercentage} />
                  ) : null}
                </Fragment>
              ) : (
                <ThumbnailPhoto photo={photo} style={{ width: '250px' }} />
              )}
              <div className="ant-form-item-explain">
                <div>
                  Image must smaller than {config.NEXT_PUBLIC_MAXIMUM_SIZE_UPLOAD_IMAGE || 2}
                  MB! Only accept {config.NEXT_PUBLIC_IMAGE_ACCPET}.
                </div>
              </div>
            </div>
          </div>
        </Fragment>
        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
          <Button type="primary" htmlType="submit" loading={uploading}>
            {havePhoto ? 'Update' : 'Upload'}
          </Button>
        </Form.Item>
      </Form>
    );
  }
}
