import { Table, Tag, Select } from 'antd';
import { IRefundRequest } from 'src/interfaces';
import { formatDate } from 'src/lib/date';

interface IProps {
  rowKey?: string;
  data?: IRefundRequest[];
  loading?: boolean;
  pagination?: {};
  onChange?: Function;
  updateStatus?: Function;
}

const RefundRequestTable = ({
  rowKey,
  data,
  loading,
  pagination,
  onChange,
  updateStatus
}: IProps) => {
  const columns = [
    {
      title: 'User',
      dataIndex: 'userId',
      key: 'userId',
      // sorter: true,
      render(data, record: IRefundRequest) {
        return (
          <span>{(record.userInfo && record.userInfo.username) || 'N/A'}</span>
        );
      }
    },
    {
      title: 'Performer',
      dataIndex: 'performerId',
      key: 'performerId',
      // sorter: true,
      render(data, record: IRefundRequest) {
        return (
          <span>
            {(record.performerInfo && record.performerInfo.username) || 'N/A'}
          </span>
        );
      }
    },
    {
      title: 'Product',
      dataIndex: 'sourceId',
      key: 'sourceId',
      // sorter: true,
      render(data, record: IRefundRequest) {
        return (
          <span>
            {(record.productInfo && record.productInfo.name) || 'N/A'}
          </span>
        );
      }
    },
    {
      title: 'Qty',
      dataIndex: 'sourceId',
      render(data, record) {
        return <span>{record.orderInfo && record.orderInfo.quantity || 'N/A'}</span>;
      }
    },
    {
      title: 'Token',
      dataIndex: 'token',
      align: 'center' as 'center',
      key: 'token',
      sorter: true,
      render(data, record) {
        return <span>{data}</span>;
      }
    },
    {
      title: 'Order Number',
      align: 'center' as 'center',
      render(data, record) {
        return <span>{record.orderInfo && record.orderInfo.orderNumber || 'N/A'}</span>;
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center' as 'center',
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Resolved', value: 'resolved' },
        { text: 'Rejected', value: 'rejected' }
      ],
      onFilter: (value: string, record: IRefundRequest) =>
        record.status.includes(value),
      render(status: string) {
        switch (status) {
          case 'resolved':
            return <Tag color="green">Resolved</Tag>;
          case 'pending':
            return <Tag color="warning">Pending</Tag>;
          case 'rejected':
            return <Tag color="volcano">Rejected</Tag>;
        }
      }
    },
    {
      title: 'Last updated at',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      sorter: true,
      render(date: Date) {
        return <span>{formatDate(date)}</span>;
      }
    },
    {
      title: 'Actions',
      dataIndex: '_id',
      fixed: 'right' as 'right',
      render: (data, record: IRefundRequest) => {
        return (
          <Select
            onChange={(value) => {
              updateStatus(record._id, value);
            }}
            defaultValue={record.status}
          >
            <Select.Option key="pending" value="pending">
              Pending
            </Select.Option>
            <Select.Option key="resolved" value="resolved">
              Resolved
            </Select.Option>
            <Select.Option key="rejected" value="rejected">
              Rejected
            </Select.Option>
          </Select>
        );
      }
    }
  ];
  return (
    <Table
      columns={columns}
      rowKey={rowKey}
      dataSource={data}
      loading={loading}
      pagination={pagination}
      onChange={onChange.bind(this)}
      scroll={{ x: 700, y: 650 }}
    />
  );
};

export default RefundRequestTable;
