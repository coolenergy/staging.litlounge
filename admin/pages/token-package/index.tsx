import { HomeOutlined } from '@ant-design/icons';
import Head from 'next/head';
import { message, Breadcrumb } from 'antd';
import Page from '@components/common/layout/page';
import { PureComponent } from 'react';
import { SearchFilter } from '@components/common/search-filter';
import { tokenPackageService } from 'src/services';
import { ITokenPackage } from 'src/interfaces';
import { TokenPackageTable } from 'src/components/token-package/table-list';
import { getResponseError } from '@lib/utils';
import Loader from '@components/common/base/loader';

interface IProps {}
interface IStates {
  loading: boolean;
  filter: {
    sortBy: string;
    sort: string;
  };
  packageList: ITokenPackage[];
  q: string;
}

class TokenPage extends PureComponent<IProps, IStates> {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      filter: {
        sortBy: 'updatedAt',
        sort: 'desc'
      },
      packageList: [],
      q: ""
    };
  }

  componentDidMount() {
    this.getData();
  }

  async getData() {
    const resp = await tokenPackageService.list({
      limit: 100,
      offset: 0,
      q: this.state.q
    });
    await this.setState({ packageList: resp.data.data, loading: false });
  }
  async searchByName(k) {
    await this.setState({q: k.q});
    this.getData();
  }
  handleDelete(id: string) {
    const { packageList } = this.state;
    tokenPackageService
      .delete(id)
      .then(() => {
        this.setState({ packageList: packageList.filter(packageId => packageId._id !== id)})
        return message.success('Deleted successfully');
      })
      .catch((e) => {
        const err = Promise.resolve(e);
        return message.error(getResponseError(err));
      });
  }
  render() {
    const { packageList, loading } = this.state;
    return (
      <>
        <Head>
          <title>Token Packages</title>
        </Head>
        <div style={{ marginBottom: '16px' }}>
          <Breadcrumb>
            <Breadcrumb.Item href="/dashboard">
              <HomeOutlined />
            </Breadcrumb.Item>
            <Breadcrumb.Item>Token Packages</Breadcrumb.Item>
          </Breadcrumb>
        </div>
        {loading ? (
          <Loader />
        ) : (
          <Page>
            <SearchFilter onSubmit={this.searchByName.bind(this)} />
            <TokenPackageTable
              dataSource={packageList}
              rowKey="_id"
              delete={this.handleDelete.bind(this)}
            />
          </Page>
        )}
      </>
    );
  }
}

export default TokenPage;
