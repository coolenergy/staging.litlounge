import Head from 'next/head';
import Link from 'next/link';
import { PureComponent, Fragment } from 'react';
import { Table, message, Dropdown, Button, Menu, Tag } from 'antd';
import Page from '@components/common/layout/page';
import { studioService } from '@services/index';
import { DownOutlined, EditOutlined } from '@ant-design/icons';
import { formatDate } from '@lib/date';

interface Props {
  status: string;
}

class Studios extends PureComponent<Props> {
  static async getInitialProps({ ctx }) {
    return { ...ctx.query };
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
    const { status } = this.props;
    if (status !== prevProps.status) {
      this.search();
    }
  }

  async search(page = 1) {
    try {
      this.setState({ searching: true });
      let { filter } = this.state;
      const { status } = this.props;
      if (status) {
        filter.status = status;
      } else {
        delete filter.status;
      }
      const query = {
        limit: this.state.limit,
        offset: (page - 1) * this.state.limit,
        ...filter,
        sort: this.state.sort,
        sortBy: this.state.sortBy
      };
      const resp = await studioService.search(query);
      this.setState({
        filter,
        searching: false,
        list: resp.data.data,
        pagination: {
          ...this.state.pagination,
          pageSize: this.state.limit,
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

  render() {
    const { list, searching, pagination } = this.state;
    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        sorter: true,
        fixed: 'left' as 'left'
      },
      {
        title: 'Username',
        dataIndex: 'username',
        sorter: true,
        fixed: 'left' as 'left'
      },
      {
        title: 'Email',
        dataIndex: 'email',
        sorter: true
      },
      {
        title: 'Total Models',
        key: 'totalModels',
        render: ({ _id, stats }) => (
          <Link href={'/performer?studioId=' + _id}>
            <a>View {stats.totalPerformer} model(s)</a>
          </Link>
        )
      },
      {
        title: 'Status',
        dataIndex: 'status',
        render(status) {
          switch (status) {
            case 'active':
              return <Tag color="green">Active</Tag>;
            case 'inactive':
              return <Tag color="red">Suspend</Tag>;
            case 'pending-email-confirmation':
              return <Tag color="default">Pending</Tag>;
          }
          return <Tag color="default">{status}</Tag>;
        }
      },
      {
        title: 'Email Verified',
        dataIndex: 'emailVerified',
        render(emailVerified: boolean) {
          switch (emailVerified) {
            case true:
              return <Tag color="green">Yes</Tag>;
            case false:
              return <Tag color="red">No</Tag>;
          }
        }
      },
      {
        title: 'Balance',
        dataIndex: 'balance',
        key: 'balance',
        render: (balance: number) => balance.toFixed(2),
        sorter: true
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
                        pathname: '/studios/update',
                        query: { id }
                      }}
                      as={`/studios/update?id=${id}`}
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
          <title>Studios</title>
        </Head>
        <Page>
          {/* <SearchFilter
            onSubmit={this.handleFilter.bind(this)}
            onExportCsv={this.onExportCsv.bind(this)}
          /> */}
          <div style={{ marginBottom: '20px' }}></div>
          <Table
            dataSource={list}
            columns={columns}
            rowKey="_id"
            loading={searching}
            pagination={pagination}
            onChange={this.handleTableChange.bind(this)}
            scroll={{ x: 700, y: 650 }}
          />
        </Page>
      </Fragment>
    );
  }
}

export default Studios;
