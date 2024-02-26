import { Modal, message, Descriptions } from 'antd';
import Head from 'next/head';
import { PureComponent } from 'react';
import { SearchFilter } from '@components/common/search-filter';
import { BreadcrumbComponent } from '@components/common';
import Page from '@components/common/layout/page';
import { getResponseError } from 'src/lib/utils';
import { TableListPaymentInformation } from '@components/payment/table-list-payment-information';
import { paymentService } from 'src/services';
import { omit } from 'lodash';

const { Item } = Descriptions;
const invisibleField = [
  '_id',
  '__v',
  'sourceType',
  'sourceInfo',
  'sourceId',
  'type',
  'createdAt',
  'updatedAt'
];
interface P {}
interface S {
  loading: boolean;
  modalVisible: boolean;
  data: any;
  info: any;
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
  status?: string;
}

class PaymentInformationPage extends PureComponent<P, S> {
  constructor(props: P) {
    super(props);
    this.state = {
      loading: false,
      modalVisible: false,
      data: [],
      info: null,
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

  componentDidUpdate(_, prevState: S) {
    const {sort, filter, offset} = this.state;
    if (filter !== prevState.filter || sort !== prevState.sort || offset !== prevState.offset) {
      this.getList();
    }
  }

  async getList() {
    const {
      filter,
      offset,
      pagination,
      sort,
    } = this.state;
    try {
      this.setState({ loading: true })
      const resp = await paymentService.paymentInformationSearch({
        ...filter,
        ...sort,
        offset,
        limit: pagination.pageSize
      });
      this.setState({
        data: resp.data.data,
        pagination: { ...pagination, total: resp.data.total }
      });
    } catch (e) {
      this.showError(e);
    } finally {
      this.setState({ loading: false });
    }
  }

  async showError(e: any) {
    const err = await Promise.resolve(e);
    message.error(getResponseError(err));
  }

  async onHandleTabChange(pagination, filters, sorter) {
    const { sort } = this.state;
    if (filters && filters.length) {
    }
    this.setState({
      offset: (pagination.current - 1) * this.state.pagination.pageSize,
      sort: {
        ...sort,
        sorter: sorter.order === 'ascend' ? 'asc' : 'desc',
        ...(sorter.field && {sortBy: sorter.field})
      }
    });
  }

  async handleFilter({ performerId, studioId }) {
    if (performerId) {
      this.setState({ filter: { sourceId: performerId, sourceType: 'performer'}});
    } else if (studioId) {
      this.setState({ filter: { sourceId: studioId, sourceType: 'studio'}});
    } else {
      this.setState({ filter: {}});
    }
  }

  async showDetailPaymentInformation(id: string) {
    try {
      const { info } = this.state;
      if(info && info._id === id) {
        this.setState({ modalVisible: true });
        return;
      }
      const resp = await paymentService.detail(id);
      this.setState({ info: resp.data, modalVisible: true });
    } catch(e) {
      this.showError(e);
    }
  }


  render() {
    const { data, loading, pagination, modalVisible, info } = this.state;
    const modalContent = <Descriptions column={1}>
      {info?.sourceInfo && <Item label="Username">{info.sourceInfo.username}</Item>}
      {info && Object.keys(omit(info, invisibleField)).map(field => <Item label={field}>{info[field]}</Item>)}
    </Descriptions>
    return (
      <>
        <Head>
          <title>Payment Information</title>
        </Head>
        <BreadcrumbComponent breadcrumbs={[{ title: 'Payment Information' }]} />
        <Page>
          <SearchFilter
            notWithKeyWord={true}
            searchWithPerformer={true}
            searchWithStudio={true}
            onSubmit={this.handleFilter.bind(this)}
          />
          <div style={{ marginBottom: '20px' }}></div>
          {data ? (
            <TableListPaymentInformation
              dataSource={data}
              loading={loading}
              rowKey="_id"
              pagination={pagination}
              onChange={this.onHandleTabChange.bind(this)}
              onViewDeital={this.showDetailPaymentInformation.bind(this)}
            />
          ) : (
            <p>No data found.</p>
          )}
          <Modal width={900} visible={modalVisible} onCancel={() => this.setState({ modalVisible: false })} okButtonProps={{hidden: true}}>
            {modalContent}
          </Modal>
        </Page>
      </>
    );
  }
}
export default PaymentInformationPage;
