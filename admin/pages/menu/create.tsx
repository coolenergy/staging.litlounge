import Head from 'next/head';
import { PureComponent, Fragment } from 'react';
import Page from '@components/common/layout/page';
import { message } from 'antd';
import { menuService } from '@services/menu.service';
import { FormMenu } from '@components/menu/form-menu';
import { BreadcrumbComponent } from '@components/common';
import Router from 'next/router';

class MenuCreate extends PureComponent {
  state = {
    submitting: false
  };

  async submit(data: any) {
    try {
      this.setState({ submitting: true });

      const submitData = {
        ...data,
        value: data.value / 100
      };
      const resp = await menuService.create(submitData);
      message.success('Created successfully');
      // TODO - redirect
      await this.setState(
        {
          submitting: false
        },
        () =>
          window.setTimeout(() => {
            Router.push(
              {
                pathname: '/menu'
              },
              `/menu`
            );
          }, 1000)
      );
    } catch (e) {
      // TODO - check and show error here
      const err = (await Promise.resolve(e)) || {};
      message.error(err.message || 'Something went wrong, please try again!');
      this.setState({ submitting: false });
    }
  }

  render() {
    return (
      <Fragment>
        <Head>
          <title>Create new menu</title>
        </Head>
        <BreadcrumbComponent breadcrumbs={[{ title: 'Menus', href: '/menu' }, { title: 'Create new menu' }]} />
        <Page>
          <FormMenu onFinish={this.submit.bind(this)} submitting={this.state.submitting} />
        </Page>
      </Fragment>
    );
  }
}

export default MenuCreate;
