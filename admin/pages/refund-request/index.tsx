import { message } from 'antd';
import Head from 'next/head';
import { PureComponent } from 'react';
import { SearchFilter } from '@components/common/search-filter';
import { BreadcrumbComponent } from '@components/common';
import Page from '@components/common/layout/page';
import RefundRequestTable from '@components/refund-request/table-list';
import { refundRequestService } from 'src/services';
import { IRefundRequest } from 'src/interfaces';
import { getResponseError } from 'src/lib/utils';

interface IProps {}
interface IStates {
  loading: boolean;
  data: IRefundRequest[];
  pagination: {
    total: number;
    pageSize: number;
  };
  sort: {
    sortBy: string;
    sorter: string;
  };
  filter: any;
  offset: number;
}

class RefundRequestPage extends PureComponent<IProps, IStates> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      loading: true,
      data: [],
      offset: 0,
      pagination: {
        total: 0,
        pageSize: 10
      },
      sort: {
        sortBy: 'createAt',
        sorter: 'desc'
      },
      filter: {}
    };
  }

  componentDidMount() {
    this.getList();
  }

  async onHandleTabChange(pagination, filters, sorter) {
    const { sort } = this.state;
    await this.setState({
      offset: (pagination.current - 1) * this.state.pagination.pageSize,
      sort: {
        ...sort,
        sorter: sorter.order === 'ascend' ? 'asc' : 'desc',
        ...(sorter.field && {sortBy: sorter.field})
      }
    });
    this.getList();
  }

  async updateStatus(id: string, value: string) {
    await refundRequestService.update(id, { status: value });
    this.getList();
  }

  async getList() {
    const { filter, offset, data, pagination, sort } = this.state;
    try {
      const resp = await refundRequestService.search({
        ...filter,
        ...sort,
        offset,
        limit: pagination.pageSize
      });
      await this.setState({
        data: resp.data.data,
        pagination: { ...pagination, total: resp.data.total }
      });
    } catch (e) {
      this.showError(e);
    } finally {
      this.setState({ loading: false });
    }
  }

  async showError(e) {
    const err = await Promise.resolve(e);
    message.error(getResponseError(err));
  }

  async handleFilter(filter) {
    await this.setState({ filter: filter });
    this.getList();
  }

  render() {
    const { data, loading, pagination } = this.state;
    return (
      <>
        <Head>
          <title>Refund request</title>
        </Head>
        <BreadcrumbComponent breadcrumbs={[{ title: 'Products' }]} />
        <Page>
          <SearchFilter
            notWithKeyWord={true}
            onSubmit={this.handleFilter.bind(this)}
            searchWithPerformer={true}
          />
          <div style={{ marginBottom: '20px' }}></div>
          {data ? (
            <RefundRequestTable
              data={data}
              loading={loading}
              rowKey="_id"
              pagination={pagination}
              onChange={this.onHandleTabChange.bind(this)}
              updateStatus={this.updateStatus.bind(this)}
            />
          ) : (
            <p>No request found.</p>
          )}
        </Page>
      </>
    );
  }
}
export default RefundRequestPage;
