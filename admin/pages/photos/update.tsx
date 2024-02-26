import Head from 'next/head';
import { PureComponent, Fragment } from 'react';
import Page from '@components/common/layout/page';
import { message } from 'antd';
import { photoService } from '@services/photo.service';
import { IPhotoUpdate } from 'src/interfaces';
import Loader from '@components/common/base/loader';
import { BreadcrumbComponent } from '@components/common';
import { FormUploadPhoto } from '@components/photo/form-upload-photo';
interface IProps {
  id: string;
}
class PhotoUpdate extends PureComponent<IProps> {
  state = {
    submitting: false,
    fetching: true,
    photo: {} as IPhotoUpdate
  };

  static async getInitialProps({ ctx }) {
    return ctx.query;
  }

  async componentDidMount() {
    try {
      const resp = await photoService.findById(this.props.id);
      this.setState({ photo: resp.data });
    } catch (e) {
      message.error('Photo not found!');
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
      await photoService.update(this.props.id, submitData);
      message.success('Updated successfully');
      this.setState({ submitting: false });
    } catch (e) {
      // TODO - check and show error here
      message.error('Something went wrong, please try again!');
      this.setState({ submitting: false });
    }
  }

  render() {
    const { photo, submitting, fetching } = this.state;
    return (
      <Fragment>
        <Head>
          <title>Update Photo</title>
        </Head>
        <BreadcrumbComponent
          breadcrumbs={[
            { title: 'Photos', href: '/photos' },
            { title: photo.title ? photo.title : 'Detail photo' },
            { title: 'Update' }
          ]}
        />
        <Page>
          {fetching ? (
            <Loader />
          ) : (
            <FormUploadPhoto
              photo={photo}
              submit={this.submit.bind(this)}
              uploading={submitting}
            />
          )}
        </Page>
      </Fragment>
    );
  }
}

export default PhotoUpdate;
