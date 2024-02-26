import Head from 'next/head';
import { PureComponent, Fragment } from 'react';
import { message, Button } from 'antd';
import Page from '@components/common/layout/page';
import { orderService } from '@services/index';
import OrderTableList from '@components/order/table-list';
import { BreadcrumbComponent } from '@components/common';
import { SearchFilter } from '@components/common/search-filter';
interface IProps {}

class ModelOrderPage extends PureComponent<IProps> {
  static authenticate = true;
  static onlyPerformer = true;
  static async getInitialProps({ ctx }) {
    return ctx.query;
  }
  state = {
    pagination: {} as any,
    searching: false,
    list: [] as any,
    limit: 10,
    filter: {} as any,
    sortBy: 'createdAt',
    sort: 'desc'
  };

  async componentDidMount() {
    this.search();
  }

  async search(page = 1) {
    try {
      await this.setState({ searching: true });
      const resp = await orderService.search({
        ...this.state.filter,
        limit: this.state.limit,
        offset: (page - 1) * this.state.limit,
        sort: this.state.sort,
        sortBy: this.state.sortBy
      });
      await this.setState({
        searching: false,
        list: resp.data.data,
        pagination: {
          ...this.state.pagination,
          total: resp.data.total,
          pageSize: this.state.limit
        }
      });
    } catch (e) {
      message.error('An error occurred, please try again!');
      await this.setState({ searching: false });
    }
  }

  handleTableChange = (pagination, filters, sorter) => {
    const pager = { ...this.state.pagination };
    pager.current = pagination.current;
    this.setState({
      pagination: pager,
      sortBy: sorter.field || 'createdAt',
      sort: sorter.order
        ? sorter.order === 'descend'
          ? 'desc'
          : 'asc'
        : 'desc'
    });
    this.search(pager.current);
  };

  async handleFilter(filter) {
    await this.setState({
      filter: {
        deliveryStatus: filter.status,
        q: filter.q
      }
    });
    this.search();
  }

  render() {
    const { list, searching, pagination } = this.state;
    const statuses = [
      {
        key: '',
        text: 'All'
      },
      {
        key: 'processing',
        text: 'Processing'
      },
      {
        key: 'shipping',
        text: 'Shipping'
      },
      {
        key: 'delivered',
        text: 'Delivered'
      },
      {
        key: 'refunded',
        text: 'Refunded'
      }
    ];

    return (
      <Fragment>
        <Head>
          <title>Orders</title>
        </Head>
        <Page>
          <div className="main-container">
            <BreadcrumbComponent
              breadcrumbs={[{ title: 'Orders', href: '/order' }]}
            />
            <SearchFilter
              statuses={statuses}
              onSubmit={this.handleFilter.bind(this)}
              notWithKeyWord={true}
            />
            <div style={{ marginBottom: '20px' }}></div>
            <OrderTableList
              dataSource={list}
              rowKey="_id"
              loading={searching}
              pagination={pagination}
              onChange={this.handleTableChange.bind(this)}
            />
          </div>
        </Page>
      </Fragment>
    );
  }
}
export default ModelOrderPage;
