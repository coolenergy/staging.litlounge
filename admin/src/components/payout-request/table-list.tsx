import { Table, Tag } from 'antd';
import { IPayoutRequest } from 'src/interfaces';
import { formatDate } from 'src/lib/date';
import Link from 'next/link';
import { EyeOutlined } from '@ant-design/icons';

interface IProps {
  rowKey?: string;
  data?: IPayoutRequest[];
  loading?: boolean;
  pagination?: {};
  onChange?: Function;
  updateStatus?: Function;
}

const PayoutRequestTable = ({
  rowKey,
  data,
  loading,
  pagination,
  onChange
}: IProps) => {
  const columns = [
    {
      title: 'From',
      key: 'username',
      // sorter: true,
      render(_, record: IPayoutRequest) {
        return (
          <span>
            {record.performerInfo?.username ||
              record.studioInfo?.username ||
              'N/A'}
          </span>
        );
      }
    },
    {
      title: 'Pay Period',
      dataIndex: 'fromDate',
      key: 'fromDate',
      render(data, record: IPayoutRequest) {
        return (
          <span>
            {formatDate(record.fromDate, 'DD/MM/YYYY')} -{' '}
            {formatDate(record.toDate, 'DD/MM/YYYY')}
          </span>
        );
      }
    },
    {
      title: 'Total Token',
      dataIndex: 'tokenMustPay',
      align: 'center' as 'center',
      key: 'tokenMustPay',
      sorter: true
    },
    {
      title: 'Paid Token',
      dataIndex: 'previousPaidOut',
      align: 'center' as 'center',
      key: 'pendingToken',
      sorter: true
    },
    {
      title: 'Remaining Token',
      dataIndex: 'pendingToken',
      align: 'center' as 'center',
      key: 'pendingToken',
      sorter: true
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center' as 'center',
      // sotrter: true,
      // filterMultiple: false,
      // filters: [
      // { text: 'Pending', value: 'pending' },
      // { text: 'Resolved', value: 'resolved' },
      // { text: 'Rejected', value: 'rejected' },
      // { text: 'Done', value: 'done' }
      // ],
      // onFilter: (value: string, record: IPayoutRequest) =>
      //   record.status.includes(value),
      render(status: string) {
        switch (status) {
          case 'approved':
            return <Tag color="blue">Approved</Tag>;
          case 'pending':
            return <Tag color="warning">Pending</Tag>;
          case 'rejected':
            return <Tag color="volcano">Rejected</Tag>;
          case 'done':
            return <Tag color="green">Paid</Tag>;
        }
      }
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: true,
      render(date: Date) {
        return <span>{formatDate(date)}</span>;
      }
    },
    {
      title: 'Actions',
      dataIndex: '_id',
      fixed: 'right' as 'right',
      sorter: true,
      render(id: string) {
        return (
          <Link href={{ pathname: '/payout-request/detail', query: { id } }}>
            <a>
              <EyeOutlined></EyeOutlined>
            </a>
          </Link>
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

export default PayoutRequestTable;
