import Head from 'next/head';
import { PureComponent, Fragment, createRef } from 'react';
import { message } from 'antd';
import Page from '@components/common/layout/page';
import { FormInstance } from 'antd/lib/form';
import { bannerService } from '@services/banner.service';
import { BreadcrumbComponent } from '@components/common';
import { FormUploadBanner } from '@components/banner/form-upload-banner';
import Router from 'next/router';

interface IResponse {
  data: { _id: string };
}

interface IProps { }

class UploadBanner extends PureComponent<IProps> {
  static async getInitialProps({ ctx }) {
    return ctx.query;
  }

  state = {
    uploading: false,
    uploadPercentage: 0
  };

  formRef: any;

  _banner: File;

  componentDidMount() {
    if (!this.formRef) this.formRef = createRef();
  }

  onUploading(resp: any) {
    this.setState({ uploadPercentage: resp.percentage });
  }

  setFormVal(field: string, val: any) {
    const instance = this.formRef.current as FormInstance;
    instance.setFieldsValue({
      [field]: val
    });
  }

  beforeUpload(file) {
    this._banner = file;
    return false;
  }

  async submit(data: any) {
    if (data.type == 'img' && !this._banner) {
      return message.error('Please select banner!');
    }

    await this.setState({
      uploading: true
    });

    try {
      if (data.type == 'img') {
        (await bannerService.uploadBanner(this._banner, data, this.onUploading.bind(this))) as IResponse;
      } else if (data.type == 'html') {
        await bannerService.create(data);
      }
      message.success('Banner has been uploaded');
      // TODO - process for response data?
      await this.setState(
        {
          uploading: false
        },
        () => window.setTimeout(() => {
          Router.push(
            {
              pathname: '/banner'
            },
            '/banner'
          );
        }, 1000)
      );
    } catch (error) {
      message.error('An error occurred, please try again!');
      await this.setState({
        uploading: false
      });
    }
    return undefined;
  }

  render() {
    if (!this.formRef) this.formRef = createRef();
    const { uploading, uploadPercentage } = this.state;
    return (
      <>
        <Head>
          <title>Upload banner</title>
        </Head>
        <BreadcrumbComponent breadcrumbs={[{ title: 'Banners', href: '/banner' }, { title: 'Upload new banner' }]} />
        <Page>
          <FormUploadBanner
            submit={this.submit.bind(this)}
            beforeUpload={this.beforeUpload.bind(this)}
            uploading={uploading}
            uploadPercentage={uploadPercentage}
          />
        </Page>
      </>
    );
  }
}

export default UploadBanner;
