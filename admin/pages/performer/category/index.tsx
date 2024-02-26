import Head from 'next/head';
import Link from 'next/link';
import { PureComponent, Fragment } from 'react';
import { Table, message, Breadcrumb, Dropdown, Menu, Button } from 'antd';
import {
  HomeOutlined,
  DownOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import Page from '@components/common/layout/page';
import { performerCategoryService } from '@services/perfomer-category.service';
import { formatDate } from '@lib/date';
import { SearchFilter } from '@components/performer/category/search-filter';

interface IProps {}

class Categories extends PureComponent<IProps> {
  state = {
    pagination: {} as any,
    searching: false,
    list: [],
    limit: 10,
    filter: {} as any,
    sortBy: 'ordering',
    sort: 'asc'
  };

  componentDidMount() {
    this.search();
  }
  async search(page = 1) {
    try {
      await this.setState({ searching: true });
      const resp = await performerCategoryService.search({
        ...this.state.filter,
        limit: this.state.limit,
        offset: (page - 1) * this.state.limit,
        sort: this.state.sort,
        sortBy: this.state.sortBy
      });
      await this.setState({
        searching: false,
        list: resp.data.data,
        pagination: {
          ...this.state.pagination,
          total: resp.data.total,
          pageSize: this.state.limit
        }
      });
    } catch (e) {
      message.error('An error occurred, please try again!');
      await this.setState({ searching: false });
    }
  }

  async deleteCategory(id: string) {
    if (!confirm('Are you sure you want to delete this category?')) {
      return false;
    }
    try {
      await performerCategoryService.delete(id);
      message.success('Deleted successfully');
      await this.search(this.state.pagination.current);
    } catch (e) {
      const err = (await Promise.resolve(e)) || {};
      message.error(err.message || 'An error occurred, please try again!');
    }
  }

  handleTableChange = (pagination, filters, sorter) => {
    const pager = { ...this.state.pagination };
    pager.current = pagination.current;
    this.setState({
      pagination: pager,
      sortBy: sorter.field || 'ordering',
      sort: sorter.order ? (sorter.order === 'descend' ? 'desc' : 'asc') : 'desc'
    });
    this.search(pager.current);
  };

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
        render(data, record) {
          return (
            <Fragment>
              <Link
                href={{
                  pathname: '/performer/category/update',
                  query: {
                    id: record._id
                  }
                }}
              >
                <a style={{ fontWeight: 'bold' }}>{record.name}</a>
              </Link>
            </Fragment>
          );
        }
      },
      {
        title: 'Ordering',
        dataIndex: 'ordering',
        sorter: true,
        render(ordering: number) {
          return <span>{ordering}</span>;
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
        render: (id: string) => {
          return (
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item key="edit">
                    <Link
                      href={{
                        pathname: '/performer/category/update',
                        query: { id }
                      }}
                      as={`/performer/category/update?id=${id}`}
                    >
                      <a>
                        <EditOutlined /> Update
                      </a>
                    </Link>
                  </Menu.Item>
                  <Menu.Item
                    key="delete"
                    onClick={this.deleteCategory.bind(this, id)}
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
          <title>Categories</title>
        </Head>
        <div style={{ marginBottom: '16px' }}>
          <Breadcrumb>
            <Breadcrumb.Item href="/dashboard">
              <HomeOutlined />
            </Breadcrumb.Item>
            <Breadcrumb.Item>Categories</Breadcrumb.Item>
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

export default Categories;
