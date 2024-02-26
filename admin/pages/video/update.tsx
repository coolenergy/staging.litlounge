import Head from 'next/head';
import { PureComponent, Fragment } from 'react';
import Page from '@components/common/layout/page';
import { message } from 'antd';
import { videoService } from '@services/video.service';
import { IVideoUpdate } from 'src/interfaces';
import Loader from '@components/common/base/loader';
import { BreadcrumbComponent } from '@components/common';
import { FormUploadVideo } from '@components/video/form-upload-video';
interface IProps {
  id: string;
}
class VideoUpdate extends PureComponent<IProps> {
  state = {
    submitting: false,
    fetching: true,
    video: {} as IVideoUpdate
  };

  static async getInitialProps({ ctx }) {
    return ctx.query;
  }

  async componentDidMount() {
    try {
      const resp = await videoService.findById(this.props.id);
      this.setState({ video: resp.data });
    } catch (e) {
      message.error('Video not found!');
    } finally {
      this.setState({ fetching: false });
    }
  }

  async submit(data: any) {
    try {
      this.setState({ submitting: true });

      const submitData = {
        ...data
      };
      await videoService.update(this.props.id, submitData);
      message.success('Updated successfully');
      this.setState({ submitting: false });
    } catch (e) {
      // TODO - check and show error here
      message.error('Something went wrong, please try again!');
      this.setState({ submitting: false });
    }
  }

  render() {
    const { video, submitting, fetching } = this.state;
    return (
      <Fragment>
        <Head>
          <title>Update Video</title>
        </Head>
        <BreadcrumbComponent
          breadcrumbs={[
            { title: 'Video', href: '/video' },
            { title: video.title ? video.title : 'Detail video' }
          ]}
        />
        <Page>
          {fetching ? (
            <Loader />
          ) : (
            <FormUploadVideo
              video={video}
              submit={this.submit.bind(this)}
              uploading={submitting}
            />
          )}
        </Page>
      </Fragment>
    );
  }
}

export default VideoUpdate;
