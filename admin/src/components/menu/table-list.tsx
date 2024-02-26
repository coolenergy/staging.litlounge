import { PureComponent } from 'react';
import { Table, Tag } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { formatDate } from '@lib/date';
import Link from 'next/link';
import { DropdownAction } from '@components/common/dropdown-action';
interface IProps {
  dataSource: [];
  rowKey: string;
  loading: boolean;
  pagination: {};
  onChange: Function;
  deleteMenu?: Function;
}

export class TableListMenu extends PureComponent<IProps> {
  render() {
    const columns = [
      {
        title: 'Title',
        dataIndex: 'title',
        sorter: true
      },
      {
        title: 'Path',
        dataIndex: 'path',
        sorter: true
      },
      {
        title: 'Ordering',
        dataIndex: 'ordering',
        sorter: true
      },
      // {
      //   title: 'Public',
      //   dataIndex: 'public',
      //   sorter: true,
      //   render(isPublic: boolean) {
      //     switch (isPublic) {
      //       case true:
      //         return <Tag color="green">Yes</Tag>;
      //       case false:
      //         return <Tag color="red">No</Tag>;
      //     }
      //   }
      // },
      {
        title: 'Last update',
        dataIndex: 'updatedAt',
        sorter: true,
        render(date: Date) {
          return <span>{formatDate(date)}</span>;
        }
      },
      {
        title: 'Actions',
        dataIndex: '_id',
        fixed: 'right' as 'right',
        render: (data, record) => {
          return (
            <DropdownAction
              menuOptions={[
                {
                  key: 'update',
                  name: 'Update',
                  children: (
                    <Link
                      href={{
                        pathname: '/menu/update',
                        query: { id: record._id }
                      }}
                      as={`/menu/update?id=${record._id}`}>
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
                  onClick: () => this.props.deleteMenu && this.props.deleteMenu(record._id)
                }
              ]}
            />
          );
        }
      }
    ];
    const { dataSource, rowKey, loading, pagination, onChange } = this.props;
    return (
      <Table
        dataSource={dataSource}
        columns={columns}
        rowKey={rowKey}
        loading={loading}
        pagination={pagination}
        onChange={onChange.bind(this)}
        scroll={{ x: 700, y: 650 }}
      />
    );
  }
}
