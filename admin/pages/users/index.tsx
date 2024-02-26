import Head from 'next/head';
import Link from 'next/link';
import { PureComponent, Fragment } from 'react';
import { connect } from 'react-redux';
import { Table, message, Dropdown, Button, Menu, Tag } from 'antd';
import Page from '@components/common/layout/page';
import { IUser } from 'src/interfaces';
import { userService } from '@services/index';
import { SearchFilter } from '@components/user/search-filter';
import { DownOutlined, EditOutlined } from '@ant-design/icons';
import { formatDate, formatTime, convertMiliSecsToSecs } from '@lib/date';
import { downloadCsv } from '@lib/utils';
interface IProps {
  currentUser: IUser;
  status: string;
}
class Users extends PureComponent<IProps> {
  static async getInitialProps({ ctx }) {
    return ctx.query;
  }

  state = {
    pagination: {} as any,
    searching: false,
    list: [],
    limit: 10,
    filter: {} as any,
    sortBy: 'updatedAt',
    sort: 'desc'
  };

  componentDidMount() {
    this.search();
  }

  componentDidUpdate(prevProps) {
    if (this.props !== prevProps) {
      this.search();
    }
  }

  async search(page = 1) {
    try {
      const { status } = this.props;
      let { filter } = this.state;
      this.setState({ searching: true });
      if (status) {
        filter.status = status;
      } else {
        delete filter.status;
      }

      const query = {
        ...filter,
        limit: this.state.limit,
        offset: (page - 1) * this.state.limit,
        sort: this.state.sort,
        sortBy: this.state.sortBy
      }
      const resp = await userService.search(query);
      this.setState({
        filter,
        searching: false,
        list: resp.data.data,
        pagination: {
          ...this.state.pagination,
          total: resp.data.total
        }
      });
    } catch (e) {
      message.error('An error occurred, please try again!');
      this.setState({ searching: false });
    }
  }

  async handleTableChange(pagination, filters, sorter) {
    const pager = { ...this.state.pagination };
    pager.current = pagination.current;
    await this.setState({
      pagination: pager,
      sortBy: sorter.field || 'updatedAt',
      sort: sorter.order ? (sorter.order === 'descend' ? 'desc' : 'asc') : 'desc'
    });
    this.search(pager.current);
  }

  async handleFilter(filter) {
    await this.setState({ filter });
    this.search();
  }

  async onExportCsv(filter) {
    try {
      const page = 1;
      await this.setState({ filter });
      const url = userService.exportCsv({
        limit: this.state.limit,
        offset: (page - 1) * this.state.limit,
        ...this.state.filter,
        sort: this.state.sort,
        sortBy: this.state.sortBy
      });
      const resp = (await downloadCsv(url, 'users_export.csv')) as any;
      if (resp && resp.success) {
        return message.success('Downloading, please check in Download folder');
      }
    } catch (error) {
      return message.error('An error occurred, please try again!');
    }
  }

  render() {
    const { list, searching, pagination } = this.state;
    const columns = [
      {
        title: 'First name',
        dataIndex: 'firstName',
        sorter: true,
        fixed: 'left' as 'left'
      },
      {
        title: 'Last name',
        dataIndex: 'lastName',
        sorter: true,
        fixed: 'left' as 'left'
      },
      {
        title: 'Username',
        dataIndex: 'username',
        sorter: true
      },
      {
        title: 'Email',
        dataIndex: 'email',
        sorter: true
      },
      {
        title: 'Roles',
        dataIndex: 'roles',
        render(roles, record) {
          return <>{roles.map(role => {
            switch(role) {
              case 'admin': return  <Tag color="red" key={`admin-${record._id}`}>{role}</Tag>
              case 'user': return  <Tag color="geekblue" key={record._id}>{role}</Tag>
              default: return <Tag color="default" key={record._id}>{role}</Tag>
            }
          })}</>;
        }
      },
      {
        title: 'Gender',
        dataIndex: 'gender'
      },
      {
        title: 'Amount spent',
        dataIndex: '_id',
        render(_, record: IUser) {
          return <span>{record?.stats?.totalTokenSpent}</span>;
        }
      },
      {
        title: 'Balance',
        dataIndex: 'balance',
        sorter: true
      },
      {
        title: 'Email Verified',
        dataIndex: 'emailVerified',
        render(emailVerified) {
          switch (emailVerified) {
            case true:
              return <Tag color="green">Y</Tag>;
            case false:
              return <Tag color="red">N</Tag>;
          }
          return <Tag color="default">{emailVerified}</Tag>;
        }
      },
      {
        title: 'Status',
        dataIndex: 'status',
        render(status) {
          switch (status) {
            case 'active':
              return <Tag color="green">Active</Tag>;
            case 'inactive':
              return <Tag color="red">Inactive</Tag>;
            case 'pending-email-confirmation':
              return <Tag color="default">Pending</Tag>;
          }
          return <Tag color="default">{status}</Tag>;
        }
      },
      {
        title: 'Total view stream time (HH:mm:ss)',
        dataIndex: '_id',
        render(data, record: IUser) {
          return (
            <span>
              {record?.stats?.totalViewTime &&
                convertMiliSecsToSecs(record?.stats?.totalViewTime || 0)}
            </span>
          );
        }
      },
      {
        title: 'Total online time (HH:mm)',
        dataIndex: 'totalOnlineTime',
        render(time: number) {
          return <span>{convertMiliSecsToSecs(time || 0)}</span>;
        }
      },

      {
        title: 'CreatedAt',
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
        render(id: string) {
          return (
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item key="edit">
                    <Link
                      href={{
                        pathname: '/users/update',
                        query: { id }
                      }}
                      as={`/users/update?id=${id}`}
                    >
                      <a>
                        <EditOutlined /> Update
                      </a>
                    </Link>
                  </Menu.Item>
                </Menu>
              }
            >
              <Button>
                Actions <DownOutlined />
              </Button>
            </Dropdown>
          );
        }
      }
    ];
    return (
      <Fragment>
        <Head>
          <title>Users</title>
        </Head>
        <Page>
          <SearchFilter
            onSubmit={this.handleFilter.bind(this)}
            onExportCsv={this.onExportCsv.bind(this)}
          />
          <div style={{ marginBottom: '20px' }}></div>
          <Table
            dataSource={list}
            columns={columns}
            rowKey="_id"
            loading={searching}
            pagination={pagination}
            onChange={this.handleTableChange.bind(this)}
            scroll={{ x: 1500, y: 650 }}
          />
        </Page>
      </Fragment>
    );
  }
}

const mapStates = (state: any) => ({
  currentUser: state.user.current
});
export default connect(mapStates)(Users);
