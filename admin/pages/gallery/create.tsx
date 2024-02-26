import Head from 'next/head';
import { PureComponent, Fragment } from 'react';
import Page from '@components/common/layout/page';
import { message } from 'antd';
import { galleryService } from '@services/gallery.service';
import { FormGallery } from '@components/gallery/form-gallery';
import { BreadcrumbComponent } from '@components/common';
import Router from 'next/router';
class GalleryCreate extends PureComponent {
  state = {
    submitting: false
  };

  async submit(data: any) {
    try {
      this.setState({ submitting: true });
      const submitData = {
        ...data
      };
      const resp = await galleryService.create(submitData);
      message.success('Created successfully');
      Router.push('/gallery')
    } catch (e) {
      // TODO - check and show error here
      message.error('Something went wrong, please try again!');
      this.setState({ submitting: false });
    }
  }

  render() {
    return (
      <Fragment>
        <Head>
          <title>Create new gallery</title>
        </Head>
        <BreadcrumbComponent
          breadcrumbs={[
            { title: 'Galleries', href: '/gallery' },
            { title: 'Create new gallery' }
          ]}
        />
        <Page>
          <FormGallery
            onFinish={this.submit.bind(this)}
            submitting={this.state.submitting}
          />
        </Page>
      </Fragment>
    );
  }
}

export default GalleryCreate;
