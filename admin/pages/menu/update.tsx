import Head from 'next/head';
import { PureComponent, Fragment } from 'react';
import Page from '@components/common/layout/page';
import { message } from 'antd';
import { menuService } from '@services/menu.service';
import { IMenuUpdate } from 'src/interfaces';
import Loader from '@components/common/base/loader';
import { BreadcrumbComponent } from '@components/common';
import { FormMenu } from '@components/menu/form-menu';
interface IProps {
  id: string;
}
class MenuUpdate extends PureComponent<IProps> {
  state = {
    submitting: false,
    fetching: true,
    menu: {} as IMenuUpdate
  };

  static async getInitialProps({ ctx }) {
    return ctx.query;
  }

  async componentDidMount() {
    try {
      const resp = await menuService.findById(this.props.id);
      this.setState({ menu: resp.data });
    } catch (e) {
      message.error('Menu not found!');
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
      await menuService.update(this.props.id, submitData);
      message.success('Updated successfully');
      this.setState({ submitting: false });
    } catch (e) {
      // TODO - check and show error here
      message.error('Something went wrong, please try again!');
      this.setState({ submitting: false });
    }
  }

  render() {
    const { menu, submitting, fetching } = this.state;
    return (
      <Fragment>
        <Head>
          <title>Update Menu</title>
        </Head>
        <BreadcrumbComponent
          breadcrumbs={[{ title: 'Menu', href: '/menu' }, { title: menu.title ? menu.title : 'Detail menu' }]}
        />
        <Page>
          {fetching ? <Loader /> : <FormMenu menu={menu} onFinish={this.submit.bind(this)} submitting={submitting} />}
        </Page>
      </Fragment>
    );
  }
}

export default MenuUpdate;
