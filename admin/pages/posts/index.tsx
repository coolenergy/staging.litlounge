import Head from 'next/head';
import Link from 'next/link';
import { PureComponent, Fragment } from 'react';
import { Table, message, Tag, Breadcrumb, Dropdown, Menu, Button } from 'antd';
import {
  HomeOutlined,
  DownOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons';
import Page from '@components/common/layout/page';
import { postService } from '@services/post.service';
import { formatDate } from '@lib/date';
import { connect } from 'react-redux';
import { SearchFilter } from '@components/post/search-filter';
import { IPost } from 'src/interfaces';

interface IProps {
  settings: any;
}

class Posts extends PureComponent<IProps> {
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
  async search(page = 1) {
    try {
      await this.setState({ searching: true });
      const resp = await postService.search({
        ...this.state.filter,
        limit: this.state.limit,
        offset: (page - 1) * this.state.limit,
        sortBy: this.state.sortBy,
        sort: this.state.sort
      });
      await this.setState({
        searching: false,
        list: resp.data.data,
        pagination: {
          ...this.state.pagination,
          total: resp.data.total
        }
      });
    } catch (e) {
      message.error('An error occurred, please try again!');
      await this.setState({ searching: false });
    }
  }

  handleTableChange = (pagination, filters, sorter) => {
    const pager = { ...this.state.pagination };
    pager.current = pagination.current;
    this.setState({
      pagination: pager,
      sortBy: sorter.field || 'updatedAt',
      sort: sorter.order ? (sorter.order === 'descend' ? 'desc' : 'asc') : 'desc'
    });
    this.search(pager.current);
  };

  async handleFilter(filter) {
    await this.setState({ filter });
    this.search();
  }

  async deletePost(id: string) {
    if (!confirm('Are you sure you want to delete this post?')) {
      return false;
    }
    try {
      await postService.delete(id);
      await this.search(this.state.pagination.current);
    } catch (e) {
      const err = (await Promise.resolve(e)) || {};
      message.error(err.message || 'An error occurred, please try again!');
    }
  }

  render() {
    const { settings } = this.props;
    const { list, searching, pagination } = this.state;
    const columns = [
      {
        title: 'Title',
        dataIndex: 'title',
        sorter: true,
        render(data, record) {
          return (
            <Fragment>
              <Link
                href={{
                  pathname: '/posts/update',
                  query: {
                    id: record._id
                  }
                }}
              >
                <a style={{ fontWeight: 'bold' }}>{record.title}</a>
              </Link>
              {/* <small>{record.shortDescription}</small> */}
            </Fragment>
          );
        }
      },
      {
        title: 'Status',
        dataIndex: 'status',
        sorter: true,
        render(status: string) {
          let color = 'default';
          switch (status) {
            case 'published':
              color = 'green';
              break;
          }
          return (
            <Tag color={color} key={status}>
              {status.toUpperCase()}
            </Tag>
          );
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
        render: (id: string, record: IPost) => {
          return (
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item key="view-url">
                    <a target="_blank" href={`${settings.userUrl}/page/${record.slug}`}><EyeOutlined /> View </a>
                  </Menu.Item>
                  <Menu.Item key="edit">
                    <Link
                      href={{
                        pathname: '/posts/update',
                        query: { id }
                      }}
                      as={`/posts/update?id=${id}`}
                    >
                      <a>
                        <EditOutlined /> Update
                      </a>
                    </Link>
                  </Menu.Item>
                  <Menu.Item
                    key="delete"
                    onClick={this.deletePost.bind(this, id)}
                  >
                    <span>
                      <DeleteOutlined /> Delete
                    </span>
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
          <title>Posts</title>
        </Head>
        <div style={{ marginBottom: '16px' }}>
          <Breadcrumb>
            <Breadcrumb.Item href="/dashboard">
              <HomeOutlined />
            </Breadcrumb.Item>
            <Breadcrumb.Item>Posts</Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <Page>
          <SearchFilter onSubmit={this.handleFilter.bind(this)} />
          <div style={{ marginBottom: '20px' }}></div>
          <Table
            dataSource={list}
            columns={columns}
            rowKey="_id"
            loading={searching}
            pagination={pagination}
            onChange={this.handleTableChange.bind(this)}
          />
        </Page>
      </Fragment>
    );
  }
}

const mapStates = (state: any) => ({
  settings: state.settings
});

export default connect(mapStates)(Posts);
