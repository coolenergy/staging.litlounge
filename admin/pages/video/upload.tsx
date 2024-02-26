import Head from 'next/head';
import { PureComponent, Fragment } from 'react';
import { message } from 'antd';
import Page from '@components/common/layout/page';
import { videoService } from '@services/video.service';
import Router from 'next/router';
import { BreadcrumbComponent } from '@components/common';
import { FormUploadVideo } from '@components/video/form-upload-video';
interface IFiles {
  fieldname: string;
  file: File;
}

interface IResponse {
  data: { _id: string };
}
class UploadVideo extends PureComponent {
  state = {
    uploading: false,
    preview: null,
    uploadPercentage: 0
  };

  _files: {
    thumbnail: File;
    video: File;
  } = {
    thumbnail: null,
    video: null
  };

  beforeUpload(file: File, field: string) {
    this._files[field] = file;
  }

  onUploading(resp: any) {
    this.setState({ uploadPercentage: resp.percentage });
  }

  async submit(data: any) {
    if (!this._files['video']) {
      return message.error('Please select video!');
    }

    const files = Object.keys(this._files).reduce((files, key) => {
      if (this._files[key]) {
        files.push({
          fieldname: key,
          file: this._files[key] || null
        });
      }
      return files;
    }, [] as IFiles[]) as [IFiles];

    await this.setState({
      uploading: true
    });
    try {
      const resp = (await videoService.uploadVideo(
        files,
        data,
        this.onUploading.bind(this)
      )) as IResponse;
      message.success('Video has been uploaded');
      // TODO - process for response data?
      await this.setState(
        {
          uploading: false
        },
        () =>
          window.setTimeout(() => {
            Router.push(
              {
                pathname: '/video/update',
                query: {
                  id: resp.data._id
                }
              },
              `/video/update?id=${resp.data._id}`,
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
    const { uploading, uploadPercentage } = this.state;
    return (
      <Fragment>
        <Head>
          <title>Upload video</title>
        </Head>
        <BreadcrumbComponent
          breadcrumbs={[
            { title: 'Video', href: '/video' },
            { title: 'Upload new video' }
          ]}
        />
        <Page>
          <FormUploadVideo
            submit={this.submit.bind(this)}
            beforeUpload={this.beforeUpload.bind(this)}
            uploading={uploading}
            uploadPercentage={uploadPercentage}
          />
        </Page>
      </Fragment>
    );
  }
}

export default UploadVideo;
