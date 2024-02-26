import Head from 'next/head';
import { PureComponent, Fragment } from 'react';
import Page from '@components/common/layout/page';
import { message } from 'antd';
import { bannerService } from '@services/banner.service';
import { IBannerUpdate } from 'src/interfaces';
import Loader from '@components/common/base/loader';
import { BreadcrumbComponent } from '@components/common';
import { FormUploadBanner } from '@components/banner/form-upload-banner';

interface IProps {
  id: string;
}
class BannerUpdate extends PureComponent<IProps> {
  state = {
    submitting: false,
    fetching: true,
    banner: {} as IBannerUpdate
  };

  static async getInitialProps({ ctx }) {
    return ctx.query;
  }

  async componentDidMount() {
    const { id } = this.props;
    try {
      const resp = await bannerService.findById(id);
      this.setState({ banner: resp.data });
    } catch (e) {
      message.error('No data found!');
    } finally {
      this.setState({ fetching: false });
    }
  }

  async submit(data: any) {
    const { id } = this.props;
    try {
      this.setState({ submitting: true });

      const submitData = {
        ...data
      };
      await bannerService.update(id, submitData);
      message.success('Updated successfully');
      this.setState({ submitting: false });
    } catch (e) {
      // TODO - check and show error here
      message.error('Something went wrong, please try again!');
      this.setState({ submitting: false });
    }
  }

  render() {
    const { banner, submitting, fetching } = this.state;
    return (
      <>
        <Head>
          <title>Update Banner</title>
        </Head>
        <BreadcrumbComponent
          breadcrumbs={[
            { title: 'Banners', href: '/banner' },
            { title: banner.title ? banner.title : 'Detail banner' },
            { title: 'Update' }
          ]}
        />
        <Page>
          {fetching ? (
            <Loader />
          ) : (
            <FormUploadBanner banner={banner} submit={this.submit.bind(this)} uploading={submitting} />
          )}
        </Page>
      </>
    );
  }
}

export default BannerUpdate;
