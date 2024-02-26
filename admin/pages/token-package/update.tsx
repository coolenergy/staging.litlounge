import { Breadcrumb, message } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import Page from '@components/common/layout/page';
import Loader from '@components/common/base/loader';
import Head from 'next/head';
import Link from 'next/link';
import { PureComponent } from 'react';
import { tokenPackageService } from 'src/services';
import { ITokenPackage, ITokenPackageUpdate } from 'src/interfaces';
import Router from "next/router";
import { getResponseError } from '@lib/utils';
import {FormTokenPackage} from 'src/components/token-package/form';

interface IProps {
  id: string;
  settings: any;
}
interface IStates {
  submitting: boolean;
  loading: boolean;
  tokenPackage: Partial<ITokenPackage>;
}

class TokenPackageUpdatePage extends PureComponent<IProps, IStates> {
  static async getInitialProps({ ctx }) {
    return ctx.query;
  }

  constructor(props) {
    super(props);
    this.state = { submitting: false, loading: true, tokenPackage: {} };
  }
  componentDidMount() {
    if(!this.props.id) {
      message.error("Package not found!");
      Router.push("/token-package");
    }
    this.getData();
  }

  async getData() {
    const resp = await tokenPackageService.findOne(this.props.id);
    await this.setState({loading: false, tokenPackage: resp.data})
  }

  handleUpdate(data: ITokenPackageUpdate) {

    this.setState({submitting: true})
    tokenPackageService.update(this.props.id, data).then(() => {
      message.success("Updated successfully");
      Router.push("/token-package")
    }).catch((e) => {
      const err = Promise.resolve(e);
      message.error(getResponseError(err))
      this.setState({submitting: false})
    });

  }
  render() {
    const { loading, tokenPackage } = this.state;
    return (
      <>
        <Head>
          <title>Update Token Package</title>
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
            <Breadcrumb.Item>Update Token Package</Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <Page>
        { loading ? <Loader /> : <FormTokenPackage onFinish={this.handleUpdate.bind(this)} submitting={this.state.submitting} tokenPackage={tokenPackage} {...this.props} /> }

        </Page>
      </>
    );
  }
}
export default TokenPackageUpdatePage;
