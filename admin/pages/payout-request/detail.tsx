import {
  Layout,
  message,
  Select,
  Button,
  PageHeader,
  Row,
  Col,
  Input,
  Descriptions
} from 'antd';
import Head from 'next/head';
import { PureComponent } from 'react';
import { IPayoutRequest } from 'src/interfaces';
import { BreadcrumbComponent } from '@components/common/breadcrumb';
import Page from '@components/common/layout/page';
import { payoutRequestService } from 'src/services';
import Router from 'next/router';
import { getResponseError } from '@lib/utils';
import { formatDate } from 'src/lib/date';
import { omit } from 'lodash';

const { Content } = Layout;
const { Item } = Descriptions;
const invisibleField = [
  '_id',
  '__v',
  'sourceType',
  'sourceId',
  'sourceInfo',
  'type',
  'createdAt',
  'updatedAt'
];

interface IProps {
  id: string;
}

interface IStates {
  submitting: boolean;
  request: IPayoutRequest;
  loading: boolean;
  isUpdating: boolean;
  status: string;
  adminNote: any;
}

class PayoutDetailPage extends PureComponent<IProps, IStates> {
  static authenticate = true;
  static onlyPerformer = true;
  static async getInitialProps({ ctx }) {
    return ctx.query;
  }

  constructor(props: IProps) {
    super(props);
    this.state = {
      submitting: false,
      request: null,
      loading: true,
      isUpdating: true,
      status: '',
      adminNote: ''
    };
  }

  componentDidMount() {
    this.getData();
  }

  async getData() {
    try {
      const resp = await payoutRequestService.findById(this.props.id);
      await this.setState({
        request: resp.data,
        status: resp.data.status,
        adminNote: resp.data.adminNote
      });
    } catch (e) {
      const err = await Promise.resolve(e);
      message.error(getResponseError(err));
    } finally {
      this.setState({ loading: false });
    }
  }

  async onUpdate(id: string) {
    const { status, adminNote, request } = this.state;
    try {
      await payoutRequestService.update(id, {
        status: this.state.status,
        adminNote: this.state.adminNote
      });
      message.success('Updated successfully');
      if (request.sourceType === 'studio') {
        Router.push('/payout-request/studios');
      }
      if (request.sourceType === 'performer') {
        Router.push('/payout-request');
      }
    } catch (e) {
      const err = await Promise.resolve(e);
      message.error(getResponseError(err));
    }
  }

  render() {
    const { request, adminNote } = this.state;
    const paymentInfo = [];
    if (request) {
      const { paymentAccountInfo } = request;
      paymentAccountInfo && Object.keys(omit(paymentAccountInfo, invisibleField)).forEach((field) => {
        paymentInfo.push(
          <Item label={field}>{paymentAccountInfo[field]}</Item>
        );
      });
    }

    return (
      <Layout>
        <Head>
          <title>Request Details</title>
        </Head>
        <Content>
          <div className="main-container">
            <BreadcrumbComponent
              breadcrumbs={[
                { title: 'Payout Requests', href: '/payout-request' },
                {
                  title: request?._id || 'Request Details'
                }
              ]}
            />
            {request ? (
              <Page>
                <PageHeader title="Payout Request Informations" />
                <Row>
                  <Col md={24} lg={12}>
                    <div>
                      <p>
                        Requester:{' '}
                        <strong>{request.performerInfo?.username}</strong>
                      </p>
                      <p>
                        Pay Period: {formatDate(request.fromDate, 'DD/MM/YYYY')}{' '}
                        - {formatDate(request.toDate, 'DD/MM/YYYY')}
                      </p>
                      <p>Total token request: {request.tokenMustPay}</p>
                      <p>Previous paid out: {request.previousPaidOut}</p>
                      <p>Remaining token must pay: {request.pendingToken}</p>
                      <p>Note: {request.requestNote}</p>
                      <p>Date requested: {formatDate(request.fromDate)}</p>
                      <Descriptions
                        title="Payment Account Information"
                        column={1}
                      >
                        {paymentInfo.length > 0 ? paymentInfo : ''}
                      </Descriptions>
                    </div>
                  </Col>
                  <Col md={24} lg={12}>
                    <div style={{ marginBottom: '10px' }}>
                      <p>Status:</p>
                      <Select
                        style={{ width: '100%' }}
                        onChange={(e) => this.setState({ status: e })}
                        defaultValue={this.state.status || 'N/A'}
                      >
                        <Select.Option key="approved" value="approved">
                          Approved
                        </Select.Option>
                        <Select.Option key="pending" value="pending">
                          Pending
                        </Select.Option>
                        <Select.Option key="rejected" value="rejected">
                          Rejected
                        </Select.Option>
                        <Select.Option key="done" value="done">
                          Paid
                        </Select.Option>
                      </Select>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <p>Note: </p>
                      <Input.TextArea
                        defaultValue={adminNote}
                        style={{ width: '100%' }}
                        onChange={(v) => {
                          this.setState({ adminNote: v.target.value });
                        }}
                        placeholder="Add your comment here..."
                        autoSize={{ minRows: 3 }}
                      />
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                      <Button
                        danger
                        onClick={this.onUpdate.bind(this, request._id)}
                      >
                        Update
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Page>
            ) : (
              <p>Request not found.</p>
            )}
          </div>
        </Content>
      </Layout>
    );
  }
}

export default PayoutDetailPage;
