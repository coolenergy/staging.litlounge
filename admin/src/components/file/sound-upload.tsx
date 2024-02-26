import { Upload, message, Button } from 'antd';
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
  const isLt2M = file.size / 1024 / 1024 < (config.NEXT_PUBLIC_MAXIMUM_SIZE_UPLOAD_SOUND || 2);
  if (!isLt2M) {
    message.error(
      `Image must smaller than ${config.NEXT_PUBLIC_MAXIMUM_SIZE_UPLOAD_IMAGE || 2}MB!`
    );
  }
  return isLt2M;
}

interface IState {
  loading: boolean;
  fileList?: any;
}

interface IProps {
  fileUrl?: any;
  uploadUrl?: string;
  headers?: any;
  onUploaded?: Function;
  options?: any;
}

export default class SoundUpload extends PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      loading: false
    };
  }

  componentDidMount() {
    const { fileUrl } = this.props;
    if (fileUrl) {
      this.setState({
        fileList: [
          {
            uid: '-1',
            name: fileUrl,
            status: 'done',
            url: fileUrl
          }
        ]
      });
    }
  }

  handleChange = (info) => {
    const { onUploaded } = this.props;
    if (info.file.status === 'uploading') {
      this.setState({ loading: true });
    }

    if (info.file.status === 'done') {
      this.setState({ loading: false });
    }

    let fileList = [...info.fileList];
    fileList = fileList.slice(-1);
    fileList = fileList.map((file) => {
      if (file.response) {
        const { data } = file.response;
        file.url = data.url;
        file.uid = data._id;
        file.name = data.name;
        file.status = 'done';
        onUploaded &&
          onUploaded({
            response: info.file.response
          });
        this.setState({ loading: false });
      }
      return file;
    });
    this.setState({ fileList });
  };

  render() {
    const { options = {} } = this.props;
    const { fileList, loading } = this.state;
    const { headers, uploadUrl } = this.props;
    const config = getGlobalConfig();
    const UploadButton = () => (
      <div>
        <Button type="primary" loading={loading}>
          <PlusOutlined /> Upload
        </Button>
      </div>
    );
    return (
      <Upload
        name={options.fieldName || 'file'}
        showUploadList={{
          showPreviewIcon: true,
          showRemoveIcon: false,
          showDownloadIcon: false
        }}
        fileList={fileList}
        multiple={false}
        listType="text"
        className="image-uploader"
        action={uploadUrl}
        beforeUpload={beforeUpload}
        onChange={this.handleChange}
        headers={headers}
        accept={config.NEXT_PUBLIC_SOUND_ACCEPT}
      >
        <UploadButton />
      </Upload>
    );
  }
}
