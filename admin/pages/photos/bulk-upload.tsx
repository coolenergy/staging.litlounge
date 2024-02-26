import Head from 'next/head';
import { PureComponent, Fragment, createRef } from 'react';
import {
  Form,
  message,
  Input,
  Button,
  Select,
  InputNumber,
  Col,
  Row,
  Upload
} from 'antd';
import Page from '@components/common/layout/page';
import { SelectPerformerDropdown } from '@components/performer/common/select-performer-dropdown';
import { FormInstance } from 'antd/lib/form';
import { UploadOutlined } from '@ant-design/icons';
import { photoService } from '@services/photo.service';
import UploadList from '@components/file/upload-list';
import { SelectGalleryDropdown } from '@components/gallery/common/select-gallery-dropdown';
import { IGallery } from 'src/interfaces';
import { galleryService } from '@services/gallery.service';
import Router from 'next/router';
import { getGlobalConfig } from '@services/config';

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 }
};

const validateMessages = {
  required: 'This field is required!'
};

const { Dragger } = Upload;
interface IProps {
  galleryId: string;
  performerId: string;
}
class BulkUploadPhoto extends PureComponent<IProps> {
  static async getInitialProps({ ctx }) {
    return ctx.query;
  }
  state = {
    uploading: false,
    preview: null,
    uploadPercentage: 0,
    fileList: [],
    galleries: [] as IGallery[]
  };

  formRef: any;
  uploadRef: any;

  componentDidMount() {
    if (!this.formRef) this.formRef = createRef();
    if (!this.uploadRef) this.uploadRef = createRef();
    this.props.performerId && this.findGalleries(this.props.performerId);
  }

  async findGalleries(performerId: string) {
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
    if (field === 'performerId') this.findGalleries(val);
  }

  async beforeUpload(file, fileList) {
    const config = getGlobalConfig();
    await Promise.all(
      fileList.map((file) => {
        const ext = file.name.split('.').pop().toLowerCase();
        const isImageAccept = config.NEXT_PUBLIC_IMAGE_ACCPET
          .split(',')
          .map((item: string) => item.trim())
          .indexOf(`.${ext}`);
        const isLt2M =
          file.size / 1024 / 1024 < (config.NEXT_PUBLIC_MAXIMUM_SIZE_UPLOAD_IMAGE || 2);
        if (isImageAccept === -1 || !isLt2M) {
          fileList.splice(
            fileList.findIndex((f) => f.uid === file.uid),
            1
          );
        }
      })
    );
    await this.setState({ fileList });
    return false;
  }

  onUploading(file, resp: any) {
    this.setState({ uploadPercentage: resp.percentage });
    file.percent = resp.percentage;
    if (file.percent === 100) file.status = 'done';
    this.forceUpdate();
  }

  remove(file) {
    const fileList = this.state.fileList;
    fileList.splice(
      fileList.findIndex((f) => f.uid === file.uid),
      1
    );
    this.setState({ fileList });
    this.forceUpdate();
  }

  async submit(data: any) {
    if (!this.state.fileList.length) {
      return message.error('Please select photo!');
    }

    const uploadFiles = this.state.fileList.filter(
      (f) => !['uploading', 'done'].includes(f.status)
    );
    if (!uploadFiles.length) return message.error('Please select new file!');

    await this.setState({ uploading: true });

    for (const file of uploadFiles) {
      try {
        if (['uploading', 'done'].includes(file.status)) continue;
        file.status = 'uploading';
        await photoService.uploadPhoto(
          file,
          data,
          this.onUploading.bind(this, file)
        );
      } catch (e) {
        file.status = 'error';
        message.error(`File ${file.name} error!`);
      }
    }
    message.success('Photos has been uploaded!');
    await this.setState({ uploading: false }, () =>
      window.setTimeout(() => {
        Router.push('/photos');
      }, 1000)
    );
  }

  render() {
    if (!this.formRef) this.formRef = createRef();
    if (!this.uploadRef) this.uploadRef = createRef();
    const { uploading, fileList } = this.state;
    const config = getGlobalConfig();
    return (
      <Fragment>
        <Head>
          <title>Upload photo</title>
        </Head>
        <Page>
          <Form
            {...layout}
            onFinish={this.submit.bind(this)}
            validateMessages={validateMessages}
            ref={this.formRef}
            initialValues={{
              status: 'draft',
              token: 0,
              performerId: this.props.performerId || '',
              galleryId: this.props.galleryId || ''
            }}
          >
            <Form.Item
              name="performerId"
              label="Performer"
              rules={[{ required: true }]}
            >
              <SelectPerformerDropdown
                onSelect={(val) => this.setFormVal('performerId', val)}
                disabled={uploading}
                defaultValue={this.props.performerId || ''}
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
                onSelect={(val) => this.setFormVal('galleryId', val)}
                defaultValue={this.props.galleryId || ''}
              />
            </Form.Item>
            {/* <Form.Item
              name="token"
              label="Default token"
              rules={[{ required: true }]}
            >
              <InputNumber disabled={uploading} />
            </Form.Item> */}
            <Form.Item
              name="status"
              label="Default status"
              rules={[{ required: true }]}
            >
              <Select disabled={uploading}>
                <Select.Option value="draft">Draft</Select.Option>
                <Select.Option key="active" value="active">
                  Active
                </Select.Option>
                <Select.Option key="inactive" value="inactive">
                  Inactive
                </Select.Option>
              </Select>
            </Form.Item>
            <Row className="ant-form-item">
              <Col span={4} className="ant-form-item-label">
                <label className="ant-form-item-required">Photos</label>
              </Col>
              <Col span={16}>
                <div>
                  <Dragger
                    // accept={config.NEXT_PUBLIC_IMAGE_ACCPET || 'image/*'}
                    beforeUpload={this.beforeUpload.bind(this)}
                    multiple={true}
                    showUploadList={false}
                    disabled={uploading}
                    listType="picture"
                  >
                    <p className="ant-upload-drag-icon">
                      <UploadOutlined />
                    </p>
                    <p className="ant-upload-text">
                      Click or drag file to this area to upload
                    </p>
                    <p className="ant-upload-hint">
                      Support image file only. Image must smaller than{' '}
                      {config.NEXT_PUBLIC_MAXIMUM_SIZE_UPLOAD_IMAGE || 2}
                      MB! Only accept {config.NEXT_PUBLIC_IMAGE_ACCPET}.
                    </p>
                  </Dragger>

                  <UploadList
                    files={fileList}
                    remove={this.remove.bind(this)}
                  />
                </div>
              </Col>
            </Row>

            <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={uploading}
                disabled={uploading}
              >
                Upload
              </Button>
            </Form.Item>
          </Form>
        </Page>
      </Fragment>
    );
  }
}

export default BulkUploadPhoto;
