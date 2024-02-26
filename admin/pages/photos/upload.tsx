import Head from 'next/head';
import { PureComponent, Fragment, createRef } from 'react';
import { message } from 'antd';
import Page from '@components/common/layout/page';
import { FormInstance } from 'antd/lib/form';
import { photoService } from '@services/photo.service';
import { BreadcrumbComponent } from '@components/common';
import { FormUploadPhoto } from '@components/photo/form-upload-photo';
import Router from 'next/router';

interface IResponse {
  data: { _id: string };
}

interface IProps {
  galleryId: string;
  performerId: string;
}

class UploadPhoto extends PureComponent<IProps> {
  static async getInitialProps({ ctx }) {
    return ctx.query;
  }
  state = {
    uploading: false,
    preview: null,
    uploadPercentage: 0
  };

  formRef: any;
  _photo: File;

  componentDidMount() {
    if (!this.formRef) this.formRef = createRef();
  }

  setFormVal(field: string, val: any) {
    const instance = this.formRef.current as FormInstance;
    instance.setFieldsValue({
      [field]: val
    });
  }

  beforeUpload(file) {
    const reader = new FileReader();
    reader.addEventListener('load', () =>
      this.setState({
        preview: reader.result
      })
    );
    reader.readAsDataURL(file);

    this._photo = file;
    return false;
  }

  onUploading(resp: any) {
    this.setState({ uploadPercentage: resp.percentage });
  }

  async submit(data: any) {
    if (!this._photo) {
      return message.error('Please select photo!');
    }

    await this.setState({
      uploading: true
    });
    try {
      const resp = (await photoService.uploadPhoto(
        this._photo,
        data,
        this.onUploading.bind(this)
      )) as IResponse;
      message.success('Photo has been uploaded');
      // TODO - process for response data?
      await this.setState(
        {
          uploading: false
        },
        () =>
          window.setTimeout(() => {
            Router.push(
              {
                pathname: '/photos/update',
                query: {
                  id: resp.data._id
                }
              },
              `/photos/update?id=${resp.data._id}`,
              {
                shallow: true
              }
            );
          }, 1000)
      );
    } catch (error) {
      message.error('An error occurred, please try again!');
      await this.setState({
        uploading: false
      });
    }
  }

  render() {
    if (!this.formRef) this.formRef = createRef();
    const { uploading } = this.state;
    return (
      <Fragment>
        <Head>
          <title>Upload photo</title>
        </Head>
        <BreadcrumbComponent
          breadcrumbs={[
            { title: 'Photos', href: '/photos' },
            { title: 'Upload new photo' }
          ]}
        />
        <Page>
          <FormUploadPhoto
            submit={this.submit.bind(this)}
            beforeUpload={this.beforeUpload.bind(this)}
            uploading={uploading}
            uploadPercentage={this.state.uploadPercentage}
            galleryId={this.props.galleryId || ''}
            performerId={this.props.performerId || ''}
          />
        </Page>
      </Fragment>
    );
  }
}

export default UploadPhoto;
