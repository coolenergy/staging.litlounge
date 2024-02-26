import { Breadcrumb, message } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import Page from '@components/common/layout/page';
import Head from 'next/head';
import Link from 'next/link';
import { PureComponent } from 'react';
import { tokenPackageService } from 'src/services';
import { ITokenPackageCreate } from 'src/interfaces';
import Router from "next/router";
import { getResponseError } from '@lib/utils';
import {FormTokenPackage} from 'src/components/token-package/form';
import { connect } from 'react-redux';

interface IProps {
  settings: any;
}
interface IStates {
  submitting;
}

class TokenPackageCreatePage extends PureComponent<IProps, IStates> {
  constructor(props) {
    super(props);
    this.state = { submitting: false };
  }
  handleCreate(data: ITokenPackageCreate) {
    this.setState({submitting: true})
    tokenPackageService.create(data).then(() => {
      message.success("Created successfully");
      Router.push("/token-package")
    }).catch((e) => {
      const err = Promise.resolve(e);
      message.error(getResponseError(err))
      this.setState({submitting: false})
    });
  }
  render() {
    return (
      <>
        <Head>
          <title>Create Token Package</title>
        </Head>
        <div style={{ marginBottom: '16px' }}>
          <Breadcrumb>
            <Breadcrumb.Item href="/dashboard">
              <HomeOutlined />
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link href={'/token-package'}>
                <a>{'Token Packages'}</a>
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Create Token</Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <Page>
          <FormTokenPackage onFinish={this.handleCreate.bind(this)} submitting={this.state.submitting} {...this.props} />
        </Page>
      </>
    );
  }
}
const mapStates = (state: any) => ({
  settings: state.settings
})

export default connect(mapStates)(TokenPackageCreatePage);
