import {
  Row,
  Col,
  DatePicker,
  Space,
  Statistic,
  PageHeader,
  message,
  Select
} from 'antd';
import Head from 'next/head';
import { PureComponent } from 'react';
import Page from '@components/common/layout/page';
// import { SearchFilter } from '@components/common/search-filter';
import EarningTable from 'src/components/earning/table-list';
import { earningService } from 'src/services';
import { IEarning } from 'src/interfaces';
import { getResponseError } from 'src/lib/utils';
import { connect } from 'react-redux';
import { SearchFilter } from '@components/common/search-filter';
import { SelectStudioDropdown } from '@components/studio/select-studio.dropdown';
import { Button } from 'antd';
import './earning.less';

const Option = Select;

interface IProps {
  conversionRate: number;
}
interface IStates {
  data: IEarning[];
  loading: boolean;
  pagination: {
    pageSize: number;
    total: number;
  };
  offset: number;
  sort: { sortBy: string; sorter: string };
  filter: {};
  stats?: any;
  query?: any;
  target?: string;
  targetId?: any;
  payoutStatus?: string;
}

class StudioEarningPage extends PureComponent<IProps, IStates> {
  static async getInitialProps({ ctx }) {
    return ctx.query;
  }
  constructor(props: IProps) {
    super(props);
    this.state = {
      offset: 0,
      data: [],
      loading: false,
      pagination: { pageSize: 10, total: 0 },
      filter: {},
      sort: { sortBy: 'createdAt', sorter: 'asc' },
      stats: null,
      target: 'studio',
      targetId: '',
      payoutStatus: ''
    };
  }
  componentDidMount() {
    this.loadData();
    this.loadStats();
  }

  async loadData() {
    const { offset, pagination, filter, sort, query, target, payoutStatus, targetId } = this.state;
    // var query = {};
    // if (fromDate && toDate) {
    //   query = Object.assign(query, fromDate, toDate);
    // }
    try {
      await this.setState({ loading: true });
      const resp = await earningService.search({
        offset,
        limit: pagination.pageSize,
        ...filter,
        ...sort,
        ...query,
        target,
        targetId,
        payoutStatus
      });
      await this.setState({
        data: resp.data.data,
        pagination: { ...this.state.pagination, total: resp.data.total }
      });
    } catch (e) {
      this.showError(e);
    } finally {
      await this.setState({ loading: false });
    }
  }
  async loadStats() {
    const { query, target, filter, targetId } = this.state;
    try {
      const resp = await earningService.stats({ ...query, target, targetId, ...filter });
      await this.setState({ stats: resp });
    } catch (error) {
      this.showError(error);
    }
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
    this.loadData();
  }

  async handleFilter(filter) {
    await this.setState({ filter });
    this.loadData();
    this.loadStats();
  }

  async setDateRanger(_, dateStrings: string[]) {
    if (!dateStrings[0] && !dateStrings[1]) {
      await this.setState({
        query: {},
        sort: { sortBy: 'createdAt', sorter: 'desc' }
      });
      this.loadData();
      this.loadStats();
    }
    if (dateStrings[0] && dateStrings[1]) {
      await this.setState({
        query: { fromDate: new Date(dateStrings[0]).toISOString(), toDate: new Date(dateStrings[1]).toISOString() }
      });
      this.loadData();
      this.loadStats();
    }
  }

  async showError(e) {
    const err = await Promise.resolve(e);
    message.error(getResponseError(err));
  }

  handleSearchStudio(){
    this.loadData();
    this.loadStats();
  }

  render() {
    const { data, loading, pagination, stats, payoutStatus } = this.state;
    const sourceType = [
      { key: '', text: 'All' },
      { text: 'Sale Video', key: 'sale_video' },
      { text: 'Sale Product', key: 'sale_product' },
      { text: 'Sale Photo', key: 'sale_photo' },
      { text: 'Tip', key: 'tip' },
      { text: 'Private', key: 'private' },
      { text: 'Group', key: 'group' }
    ];
    const statuses = [
      {
        key: 'pending',
        text: 'Pending'
      },
      {
        key: 'approved',
        text: 'Approved'
      },
      {
        key: 'rejected',
        text: 'Rejected'
      },
      {
        key: 'done',
        text: 'Paid'
      }
    ];
    return (
      <>
        <Head>
          <title>Earning</title>
        </Head>
        <Page>
          <PageHeader
            title="Studio Earning"
            style={{ padding: 0, marginBottom: 10 }}
          />
          <Row className="ant-page-header" style={{ padding: 0 }}>
            <Col md={12} xs={0}>{}</Col>
            <Col md={12} xs={24}>
              {!loading && stats && (
                <Space size="large" style={{ display: 'flex' }}>
                  <div className='space-display'>
                    <div className='space-column'>
                      <Statistic
                        title="Current Conversion Rate"
                        value={this.props.conversionRate || 'N/A'}
                        precision={2}
                      />
                    </div>
                    <div className='space-column'>
                      <Statistic
                        className="space-custom"
                        title="Tokens Received"
                        value={stats.data.totalPrice - stats.data.remainingPrice}
                        style={{ marginRight: '30px' }}
                        precision={2}
                      />
                      <Statistic
                        style={{ marginRight: '30px' }}
                        title="Studio share of tokens"
                        value={stats.data.sharedPrice}
                        precision={2}
                      />
                      <Statistic
                        style={{ marginRight: '30px' }}
                        title="Paid Tokens"
                        value={stats.data.paidPrice}
                        precision={2}
                      />
                      <Statistic
                        style={{ marginRight: '30px' }}
                        title="Unpaid Tokens"
                        value={stats.data.remainingPrice}
                        precision={2}
                      />
                    </div>
                  </div>
                </Space>
              )}
            </Col>
            <Col md={24} xs={24}>
              <div className='filter'>
              <Row gutter={24}>
                <Col md={6} xs={24}>
                <DatePicker.RangePicker
                  disabledDate={() => loading}
                  onCalendarChange={this.setDateRanger.bind(this)}
                /></Col>
                {statuses.length ? (
                  <Col md={8} xs={24}>
                  <Select<string>
                    style={{ width: '100%' }}
                    onSelect={(val) => this.setState({payoutStatus: val}, () => this.loadData())}
                    placeholder="Select status"
                    value={payoutStatus}
                  >
                    <Option value="">All</Option>
                    {statuses.map((s) => (
                      <Option key={s.key} value={s.key}>
                        {s.text || s.key}
                      </Option>
                    ))}
                  </Select>
                  </Col>
                ) : null}
                <Col md={10} xs={24}>
                 <SelectStudioDropdown
                  placeholder={'Search studio'}
                  style={{ width: '80%' }}
                  onSelect={(val) => this.setState({ targetId: val || ''})}
                />
                <Button
                  type="primary"
                  onClick={this.handleSearchStudio.bind(this)}
                >
                  Search
                </Button></Col>
              </Row>
              </div>
            </Col>
          </Row>
          {/* <div>
            <span>Type:</span>
            <SearchFilter
              sourceType={sourceType}
              onSubmit={this.handleFilter.bind(this)}
              notWithKeyWord={true}
            />
          </div> */}

          <div style={{ marginBottom: '20px' }}></div>
          {data ? (
            <div>
              {/* <SearchFilter
                onSubmit={this.handleFilter.bind(this)}
                notWithKeyWord={true}
                searchWithStudio={true}
              /> */}
              <div style={{ marginBottom: '20px' }} />
              <EarningTable
                dataSource={data}
                rowKey="_id"
                onChange={this.onHandleTabChange.bind(this)}
                pagination={pagination}
                loading={loading}
                role_data="studio"
              />
            </div>
          ) : (
            <p>There are no earning at this time.</p>
          )}
        </Page>
      </>
    );
  }
}

const mapStateToProps = (state) => ({ ...state.settings });
export default connect(mapStateToProps)(StudioEarningPage);
