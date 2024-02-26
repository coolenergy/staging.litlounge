import { formatId } from '@lib/string';
import { Table, Tag } from 'antd';
import { ICommissionSetting, IEarning } from 'src/interfaces';
import { formatDate, capitalizeFirstLetter } from 'src/lib';

interface IProps {
  dataSource: IEarning[];
  rowKey?: string;
  loading?: boolean;
  onChange: Function;
  pagination?: {};
  role_data: "model" | "studio"
}

const customCell = ({children, bordered}) => <td style={{border: bordered ? '1px solid #f4f4f4' : 'none'}}>{children}</td>

const EarningTable = ({
  dataSource,
  rowKey,
  loading,
  onChange,
  pagination,
  role_data
}: IProps) => {
  const column = [
    {
      title: 'Reference',
      dataIndex: 'transactionTokenId',
      key: 'transaction',
      render: (transactionTokenId: string) => formatId(transactionTokenId)
    },
    {
      title: 'Date',
      key: 'createdAt',
      dataIndex: 'createdAt',
      render: (createdAt: Date) => formatDate(createdAt),
      sorter: true
    },
    {
      title: 'From',
      key: 'source',
      render(record: IEarning) {
        return (
          <span>
            {(record.sourceInfo && record.sourceInfo.username) || 'N/A'}
          </span>
        );
      }
    },
    {
      title: 'To',
      key: 'target',
      render(record: IEarning) {
        return (
          <span>
            {(record.targetInfo && record.targetInfo.username) || 'N/A'}
          </span>
        );
      }
    },
    {
      title: 'Transaction Type',
      dataIndex: 'type',
      key: 'type',
      render(type: string) {
        switch (type) {
          case 'sale_video':
            return <Tag color="magenta">Sale Video</Tag>;
          case 'sale_product':
            return <Tag color="volcano">Sale Product</Tag>;
          case 'sale_photo':
            return <Tag color="orange">Sale Photo</Tag>;
          case 'tip':
            return <Tag color="gold">Tip</Tag>;
          case 'stream_private':
            return <Tag color="blue">Private</Tag>;
          case 'stream_group':
            return <Tag color="green">Group</Tag>;
          default:
            return <Tag>{type}</Tag>
        }
      }
    },
    {
      title: 'Tokens Received',
      dataIndex: 'grossPrice',
      key: 'grossPrice',
      render: (grossPrice: number) => grossPrice.toFixed(2),
      sorter: true
    },
    // {
    //   title: 'Net Price',
    //   dataIndex: 'netPrice',
    //   key: 'netPrice',
    //   render: (netPrice: number) => netPrice.toFixed(2),
    //   sorter: true
    // },
    // {
    //   title: `${capitalizeFirstLetter(role_data)} Commission`,
    //   dataIndex: 'commission',
    //   key: 'commission',
    //   render(commission: number) {
    //     return <span>{commission}%</span>;
    //   }
    // },
    {
      title: 'Conversion Rate',
      dataIndex: 'conversionRate',
      key: 'conversionRate'
    },
    {
      title: 'Admin Earnings',
      key: 'earned',
      
      children: [
        {
          title: '%',
          dataIndex: 'commission',
          key: 'admincommission',
          width: 50,
          render(commission: number) {
            return <span>{100 - commission}</span>;
          },
          onCell: () => ({ bordered: true })
        },
        {
          title: 'Tks',
          key: 'adminnetPrice',
          width: 50,
          render: (_, record) =>
          ((record.grossPrice - record.netPrice) ).toFixed(2),
          onCell: () => ({ bordered: true })
        },
        {
          title: 'Amt',
          key: 'adminprice',
          width: 50,
           render: (_, record) =>
            ((record.grossPrice - record.netPrice) * record.conversionRate).toFixed(2),
            onCell: () => ({ bordered: true })
        }
      ],
      // render: ({ netPrice, conversionRate, grossPrice }) =>
      // ((grossPrice - netPrice) * conversionRate).toFixed(2)
    },
    {
      title: `${capitalizeFirstLetter(role_data)} Earnings`,
      key: 'earned',
      className: 'bordered',
     
      children: [
        {
          title: '%',
          dataIndex: 'commission',
          key: 'commission',
          width: 50,
          render(commission: number) {
            return <span>{commission}</span>;
          },
          onCell: () => ({ bordered: true })
        },
        {
          title: 'Tks',
          dataIndex: 'netPrice',
          key: 'netPrice',
          width: 50,
          render: (netPrice: number) => netPrice.toFixed(2),
          onCell: () => ({ bordered: true })
        },
        {
          title: 'Amt',
          dataIndex: 'price',
          key: 'price',
          width: 50,
          render: (price: number) => price.toFixed(2),
          onCell: () => ({ bordered: true })
        }
      ],
      // render: ({ netPrice, conversionRate }) =>
      //   (netPrice * conversionRate).toFixed(2)
    },
    {
      title: 'Payout Status',
      dataIndex: 'isPaid',
      key: 'isPaid',
      render: (isPaid: boolean) => <span>{isPaid ? 'Paid' : 'Remaining'}</span>
    }
  ] as any;
  return (
    <>
      <Table
        columns={column}
        dataSource={dataSource}
        bordered
        components={{body: {
          cell: customCell
        },
       }}
        rowKey={rowKey}
        loading={loading}
        onChange={onChange.bind(this)}
        pagination={pagination}
        scroll={{ x: 1200 }}
      />
    </>
  );
};

export default EarningTable;
