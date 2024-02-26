import { Upload, message } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { PureComponent } from 'react';
import { getGlobalConfig } from '@services/config';

function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}

function beforeUpload(file) {
  const config = getGlobalConfig();
  const ext = file.name.split('.').pop().toLowerCase();
  const isImageAccept = config.NEXT_PUBLIC_IMAGE_ACCPET
    .split(',')
    .map((item: string) => item.trim())
    .indexOf(`.${ext}`);
  if (isImageAccept === -1) {
    message.error(`You can only upload ${config.NEXT_PUBLIC_IMAGE_ACCPET} file!`);
  }
  const isLt2M = file.size / 1024 / 1024 < (config.NEXT_PUBLIC_MAXIMUM_SIZE_UPLOAD_IMAGE || 2);
  if (!isLt2M) {
    message.error(
      `Image must smaller than ${config.NEXT_PUBLIC_MAXIMUM_SIZE_UPLOAD_IMAGE || 2}MB!`
    );
  }
  return isImageAccept > -1 && isLt2M;
}

interface IState {
  loading: boolean;
  imageUrl: string;
}

interface IProps {
  imageUrl?: string;
  uploadUrl?: string;
  headers?: any;
  onUploaded?: Function;
  options?: any;
}

export class ImageUpload extends PureComponent<IProps, IState> {
  state = {
    loading: false,
    imageUrl: this.props.imageUrl
  };

  handleChange = (info) => {
    if (info.file.status === 'uploading') {
      this.setState({ loading: true });
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj, (imageUrl) => {
        this.setState({
          imageUrl,
          loading: false
        });
        this.props.onUploaded &&
          this.props.onUploaded({
            response: info.file.response,
            base64: imageUrl
          });
      });
    }
  };

  render() {
    const { options = {} } = this.props;
    const config = getGlobalConfig();

    const uploadButton = (
      <div>
        {this.state.loading ? <LoadingOutlined /> : <PlusOutlined />}
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    const { imageUrl } = this.state;
    const { headers, uploadUrl } = this.props;
    return (
      <Upload
        name={options.fieldName || 'file'}
        listType="picture-card"
        className="image-uploader"
        showUploadList={false}
        action={uploadUrl}
        beforeUpload={beforeUpload}
        onChange={this.handleChange}
        headers={headers}
        accept={config.NEXT_PUBLIC_IMAGE_ACCPET}
      >
        {imageUrl ? (
          <img src={imageUrl} alt="file" style={{ width: '100%' }} />
        ) : (
          uploadButton
        )}
      </Upload>
    );
  }
}
