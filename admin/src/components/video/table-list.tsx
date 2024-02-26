import { PureComponent } from 'react';
import { Table, Tag } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { formatDate } from '@lib/date';
import Link from 'next/link';
import { ThumbnailVideo } from '@components/video/thumbnail-video';
import { DropdownAction } from '@components/common/dropdown-action';
interface IProps {
  dataSource: [];
  rowKey: string;
  loading: boolean;
  pagination: {};
  onChange: Function;
  deleteVideo?: Function;
}

export class TableListVideo extends PureComponent<IProps> {
  render() {
    const columns = [
      {
        title: '',
        dataIndex: 'thumbnail',
        render(data, record) {
          return <ThumbnailVideo video={record} />;
        }
      },
      {
        title: 'Title',
        dataIndex: 'title',
        sorter: true
      },
      {
        title: 'Token',
        dataIndex: 'token',
        sorter: true,
        render(token: number) {
          return <span>{token}</span>;
        }
      },
      {
        title: 'Status',
        dataIndex: 'status',
        sorter: true,
        render(status: string) {
          switch (status) {
            case 'active':
              return <Tag color="green">Active</Tag>;
            case 'inactive':
              return <Tag color="red">Inactive</Tag>;
          }
          return <Tag color="default">{status}</Tag>;
        }
      },
      {
        title: 'Performer',
        dataIndex: 'performer',
        render(data, record) {
          return <span>{record.performer && record.performer.username}</span>;
        }
      },
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
                        pathname: '/video/update',
                        query: { id }
                      }}
                      as={`/video/update?id=${id}`}
                    >
                      <a>
                        <EditOutlined /> Update
                      </a>
                    </Link>
                  )
                }
                // {
                //   key: 'delete',
                //   name: 'Delete',
                //   children: (
                //     <span>
                //       <DeleteOutlined /> Delete
                //     </span>
                //   ),
                //   onClick: () =>
                //     this.props.deleteVideo && this.props.deleteVideo(id)
                // }
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
