import { PureComponent } from 'react';
import { Form } from 'antd';
import { IStudio } from 'src/interfaces';
import { studioService, authService } from '@services/index';
import { FileUpload } from '@components/file/file-upload';

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 }
};

interface IProps {
  onUploaded: Function;
  studio?: IStudio;
  submiting?: boolean;
  method?: 'POST' | 'PUT' | 'post' | 'put';
  // beforeUpload?: Function;
}
export class StudioDocumentForm extends PureComponent<IProps> {
  state = {
    documentVerificationFile: ''
  };

  componentDidMount() {
    const { studio } = this.props;
    if (studio?.documentVerificationFile) {
      this.setState({
        documentVerificationFile: studio.documentVerificationFile
      });
    }
  }

  render() {
    const { onUploaded, studio, method } = this.props;
    const { documentVerificationFile } = this.state;
    const uploadHeaders = {
      authorization: authService.getToken()
    };

    return (
      <Form
        {...layout}
        name="form-performer"
        initialValues={{}}
      >
        <div
          key="verificationId"
          className="ant-row ant-form-item ant-form-item-with-help"
        >
          <div className="ant-col ant-col-4 ant-form-item-label">
            <label>ID For Verification</label>
          </div>
          <div className="ant-col ant-col-16 ant-form-item-control">
            <FileUpload
              uploadUrl={
                studio
                  ? studioService.getUploadDocumentUrl(studio._id)
                  : studioService.getUploadDocumentUrl()
              }
              headers={uploadHeaders}
              onUploaded={(resp) => {
                this.setState({
                  documentVerificationFile: resp.response.data.url
                });
                onUploaded('documentVerification', resp);
              }}
              method={method}
              fieldName="documentVerification"
            />
            {documentVerificationFile && (
              <a target="_blank" href={documentVerificationFile}>Document For Verification</a>
            )}
          </div>
        </div>
      </Form>
    );
  }
}
