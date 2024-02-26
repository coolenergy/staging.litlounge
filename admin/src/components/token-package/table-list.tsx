import { ITokenPackage } from 'src/interfaces';
import { formatDate } from '@lib/date';
import { Table } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { DropdownAction } from '@components/common/dropdown-action';

interface IProps {
  dataSource: ITokenPackage[];
  rowKey: string;
  delete: Function;
}

export const TokenPackageTable = ({ ...props }: IProps) => {
  const Columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      align: 'center' as 'center'
    },
    {
      title: 'Number of Tokens',
      dataIndex: 'tokens',
      key: 'address',
      align: 'center' as 'center'
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'Updated At',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render(data, record: ITokenPackage) {
        return formatDate(record.updatedAt);
      }
    },
    {
      title: 'Actions',
      dataIndex: '_id',
      fixed: 'right' as 'right',
      key: 'action',
      render: (id: string) => {
        return (
          <DropdownAction
            menuOptions={[
              {
                key: 'update',
                name: 'Update',
                children: (
                  <Link
                    href={{
                      pathname: '/token-package/update',
                      query: { id }
                    }}
                    as={`/token-package/update?id=${id}`}
                  >
                    <a>
                      <EditOutlined /> Update
                    </a>
                  </Link>
                )
              },
              {
                key: 'delete',
                name: 'Delete',
                children: (
                  <span>
                    <DeleteOutlined /> Delete
                  </span>
                ),
                onClick: () => props.delete && props.delete(id)
              }
            ]}
          />
        );
      }
    }
  ];
  return (
    <Table
      dataSource={props.dataSource}
      columns={Columns}
      pagination={false}
      rowKey={props.rowKey}
      scroll={{ x: 700, y: 650 }}
    />
  );
};
