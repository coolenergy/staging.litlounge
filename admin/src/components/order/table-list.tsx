import { Table, Tag, Button } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { IOrder } from 'src/interfaces/order';
import { formatDate } from '@lib/date';
import Link from 'next/link';
import { capitalizeFirstLetter } from '@lib/string';

interface IProps {
  dataSource: IOrder[];
  pagination: {};
  rowKey: string;
  loading: boolean;
  onChange: Function;
}

const OrderTableList = ({
  dataSource,
  pagination,
  rowKey,
  loading,
  onChange
}: IProps) => {
  const columns = [
    {
      title: 'Buyer',
      dataIndex: 'buyerId',
      key: 'buyerInfo',
      sorter: true,
      render(data, record) {
        return <p>
          <span>@{record?.buyerInfo?.username || 'N/A'}</span>
        </p>
      }
    },
    {
      title: 'Seller',
      dataIndex: 'sellerInfo',
      key: 'sellerInfo',
      sorter: true,
      render(sellerInfo, record) {
        if (record.sellerSource === 'system') return 'System';
        return (
          <span>
            @{sellerInfo?.username || 'N/A'}
          </span>
        );
      }
    },
    {
      title: 'Product info',
      dataIndex: 'name',
      sorter: false,
      render(q, record) {
        return <p>
          <span>{record.name}</span> <br />
          <small>{record.description}</small>
        </p>
      }
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      sorter: true,
      render(quantity) {
        return <span>{quantity}</span>;
      }
    },
    {
      title: 'Total Price (token)',
      dataIndex: 'totalPrice',
      sorter: true,
      render(totalPrice) {
        return <span>{totalPrice?.toFixed(2)}</span>;
      }
    },
    {
      title: 'Delivery Status',
      dataIndex: 'deliveryStatus',
      render(deliveryStatus: string) {

        switch (deliveryStatus) {
          case 'processing':
            return <Tag color="default">Processing</Tag>;
          case 'shipping':
            return <Tag color="warning">Shipping</Tag>;
          case 'delivered':
            return <Tag color="success">Delivered</Tag>;
          case 'refunded':
            return <Tag color="volcano">Refunded</Tag>;
          default:
            return <Tag>{capitalizeFirstLetter(deliveryStatus)}</Tag>;
        }
      }
    },
    {
      title: 'Last updated at',
      dataIndex: 'createdAt',
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
          <Link href={{ pathname: '/order/detail', query: { id } }}>
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
      dataSource={dataSource}
      columns={columns}
      pagination={pagination}
      rowKey={rowKey}
      loading={loading}
      onChange={onChange.bind(this)}
    />
  );
};
export default OrderTableList;
