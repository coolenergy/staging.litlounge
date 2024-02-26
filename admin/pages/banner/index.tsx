/* eslint-disable no-nested-ternary */
import Head from 'next/head';
import { PureComponent, Fragment } from 'react';
import { message } from 'antd';
import Page from '@components/common/layout/page';
import { bannerService } from '@services/banner.service';
import { SearchFilter } from '@components/common/search-filter';
import { TableListBanner } from '@components/banner/table-list';
import { BreadcrumbComponent } from '@components/common';

interface IProps {}

class Banners extends PureComponent<IProps> {
  // static async getInitialProps({ ctx }) {
  //   return ctx.query;
  // }

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

  handleTableChange = (paginate, filters, sorter) => {
    const { pagination } = this.state;
    const pager = { ...pagination };
    pager.current = paginate.current;
    this.setState({
      pagination: pager,
      sortBy: sorter.field || 'createdAt',
      sort: sorter.order ? (sorter.order === 'descend' ? 'desc' : 'asc') : 'desc'
    });
    this.search(pager.current);
  };

  async handleFilter(filter) {
    await this.setState({ filter });
    this.search();
  }

  async search(page = 1) {
    const {
      filter, sort, sortBy, limit, pagination
    } = this.state;
    try {
      await this.setState({ searching: true });
      const resp = await bannerService.search({
        ...filter,
        limit: filter,
        offset: (page - 1) * limit,
        sort,
        sortBy
      });
      await this.setState({
        searching: false,
        list: resp.data.data,
        pagination: {
          ...pagination,
          total: resp.data.total,
          pageSize: limit
        }
      });
    } catch (e) {
      message.error('An error occurred, please try again!');
      await this.setState({ searching: false });
    }
  }

  async deleteBanner(id: string) {
    const {
      pagination
    } = this.state;
    if (!window.confirm('Are you sure you want to delete this banner?')) {
      return false;
    }
    try {
      await bannerService.delete(id);
      message.success('Deleted successfully');
      await this.search(pagination.current);
    } catch (e) {
      const err = (await Promise.resolve(e)) || {};
      message.error(err.message || 'An error occurred, please try again!');
    }
    return undefined;
  }

  render() {
    const { list, searching, pagination } = this.state;
    const statuses = [
      {
        key: '',
        text: 'All'
      },
      {
        key: 'active',
        text: 'Active'
      },
      {
        key: 'inactive',
        text: 'Inactive'
      }
    ];

    return (
      <>
        <Head>
          <title>Banners</title>
        </Head>
        <BreadcrumbComponent breadcrumbs={[{ title: 'Banners' }]} />
        <Page>
          <SearchFilter statuses={statuses} onSubmit={this.handleFilter.bind(this)} />
          <div style={{ marginBottom: '20px' }} />
          <TableListBanner
            dataSource={list}
            rowKey="_id"
            loading={searching}
            pagination={pagination}
            onChange={this.handleTableChange.bind(this)}
            deleteBanner={this.deleteBanner.bind(this)}
          />
        </Page>
      </>
    );
  }
}

export default Banners;
