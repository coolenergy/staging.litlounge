import { PureComponent } from 'react';
import { Table, Tag } from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { formatDate } from '@lib/date';
import Link from 'next/link';
import { CoverGallery } from '@components/gallery/cover-gallery';
import { DropdownAction } from '@components/common/dropdown-action';
interface IProps {
  dataSource: [];
  rowKey: string;
  loading: boolean;
  pagination: {};
  onChange: Function;
  deleteGallery?: Function;
}

export class TableListGallery extends PureComponent<IProps> {
  render() {
    const columns = [
      {
        title: '',
        render(data, record) {
          return <CoverGallery gallery={record} />;
        }
      },
      {
        title: 'Name',
        dataIndex: 'name',
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
        render: (data, record) => {
          return (
            <DropdownAction
              menuOptions={[
                {
                  key: 'view-photo',
                  name: 'View photo',
                  children: (
                    <Link
                      href={{
                        pathname: '/photos',
                        query: {
                          galleryId: record._id,
                          performerId: record.performerId
                        }
                      }}
                      as={`/photos?galleryId=${record._id}`}
                    >
                      <a>
                        <EyeOutlined /> View photo
                      </a>
                    </Link>
                  )
                },
                {
                  key: 'add-photo',
                  name: 'Add photo',
                  children: (
                    <Link
                      href={{
                        pathname: '/photos/upload',
                        query: {
                          galleryId: record._id,
                          performerId: record.performerId
                        }
                      }}
                      as={`/photos/upload?galleryId=${record._id}&performerId=${record.performerId}`}
                    >
                      <a>
                        <PlusOutlined /> Add photo
                      </a>
                    </Link>
                  )
                },
                {
                  key: 'add-more-photo',
                  name: 'Add more photo',
                  children: (
                    <Link
                      href={{
                        pathname: '/photos/bulk-upload',
                        query: {
                          galleryId: record._id,
                          performerId: record.performerId
                        }
                      }}
                      as={`/photos/bulk-upload?galleryId=${record._id}&performerId=${record.performerId}`}
                    >
                      <a>
                        <PlusOutlined /> Add more photo
                      </a>
                    </Link>
                  )
                },
                {
                  key: 'update',
                  name: 'Update',
                  children: (
                    <Link
                      href={{
                        pathname: '/gallery/update',
                        query: { id: record._id }
                      }}
                      as={`/gallery/update?id=${record._id}`}
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
                  onClick: () =>
                    this.props.deleteGallery &&
                    this.props.deleteGallery(record._id)
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
