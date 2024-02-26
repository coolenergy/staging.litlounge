import { message, Row, Col, DatePicker } from 'antd';
import Head from 'next/head';
import { PureComponent } from 'react';
import { SearchFilter } from '@components/common/search-filter';
import { BreadcrumbComponent } from '@components/common';
import Page from '@components/common/layout/page';
import { getResponseError } from 'src/lib/utils';
import PayoutRequestTable from '@components/payout-request/table-list';
import { IPayoutRequest } from 'src/interfaces';
import { payoutRequestService } from 'src/services';

interface IProps {}
interface IStates {
  loading: boolean;
  data: IPayoutRequest[];
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
  query?: {};
  status?: string;
  sourceType: string;
}

class PayoutRequestPage extends PureComponent<IProps, IStates> {
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
      filter: {},
      sourceType: 'performer'
    };
  }

  componentDidMount() {
    this.getList();
  }

  async getList() {
    const {
      filter,
      offset,
      data,
      pagination,
      sort,
      query,
      sourceType
    } = this.state;
    try {
      const resp = await payoutRequestService.search({
        ...filter,
        ...sort,
        offset,
        ...query,
        sourceType,
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

  async updateStatus(id: string, value: string) {
    await payoutRequestService.update(id, { status: value });
    this.getList();
  }

  async onHandleTabChange(pagination, filters, sorter) {
    const { sort } = this.state;
    if (filters && filters.length) {
    }
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

  async handleFilter(filter) {
    await this.setState({ filter: filter });
    this.getList();
  }

  async setDateRanger(_, dateStrings: string[]) {
    if (!dateStrings[0] && !dateStrings[1]) {
      await this.setState({
        query: {},
        sort: { sortBy: 'createdAt', sorter: 'desc' }
      });
      this.getList();
    }
    if (dateStrings[0] && dateStrings[1]) {
      await this.setState({
        query: { fromDate: dateStrings[0], toDate: dateStrings[1] }
      });
      this.getList();
    } else {
      return;
    }
  }

  render() {
    const { data, loading, pagination } = this.state;
    const statuses = [
      { text: 'All', key: '' },
      { text: 'Pending', key: 'pending' },
      { text: 'Approved', key: 'resolved' },
      { text: 'Rejected', key: 'rejected' },
      { text: 'Paid', key: 'done' }
    ];
    return (
      <>
        <Head>
          <title>payout request</title>
        </Head>
        <BreadcrumbComponent breadcrumbs={[{ title: 'Payout Request' }]} />
        <Page>
          <SearchFilter
            notWithKeyWord={true}
            statuses={statuses}
            onSubmit={this.handleFilter.bind(this)}
            searchWithPerformer={true}
            withDatePicker={true}
            setDateRanger={this.setDateRanger.bind(this)}
          />
          <div style={{ marginBottom: '20px' }}></div>
          {data ? (
            <PayoutRequestTable
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
export default PayoutRequestPage;
