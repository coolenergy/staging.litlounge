import Head from 'next/head';
import { PureComponent, Fragment } from 'react';
import { connect } from 'react-redux';
import { Table, message } from 'antd';
import Page from '@components/common/layout/page';
import { performerService } from '@services/performer.service';
import { BreadcrumbComponent } from '@components/common';
import { getDiffToNow } from 'src/lib';

interface IProps {

}
class Performers extends PureComponent<IProps> {
  static async getInitialProps({ ctx }) {
    return ctx.query;
  }

  state = {
    searching: false,
    list: [],
    pagination: {} as any,
    query: {
      limit: 10,
      sortBy: 'updatedAt',
      sort: 'desc',
    }
  };

  componentDidMount() {
    this.search();
  }

  async search(page = 1, pagination = {}, sorter = {} as any) {
    try {
      this.setState({ searching: true });
      let query = { ...this.state.query } as any;
      query = {
        ...query,
        offset: (page - 1) * query.limit,
      }
      if(sorter) {
        query.sortBy = sorter.field || 'updatedAt';
        query.sort = sorter.order ? (sorter.order === 'descend' ? 'desc' : 'asc') : 'desc';
      }

      const resp = await performerService.searchOnline(query);
      this.setState({
        query,
        list: resp.data.data,
        pagination: {
          ...pagination,
          total: resp.data.total
        }
      });
    } catch (e) {
      message.error('An error occurred, please try again!');
    } finally {
      this.setState({ searching: false })
    }
  }

  async handleTableChange(pagination, filters, sorter) {
    this.search(pagination.current, pagination, sorter);
  }

  render() {
    const {
      list,
      searching,
      pagination,
    } = this.state;
    const columns = [
      {
        title: 'ID',
        dataIndex: '_id',
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
        title: 'Last Streaming Time',
        dataIndex: 'lastStreamingTime',
        render: (lastStreamingTime) => lastStreamingTime && getDiffToNow(lastStreamingTime),
        sorter: true
      },
      {
        title: 'Watching',
        dataIndex: 'watching',
      }
    ];
    return (
      <Fragment>
        <Head>
          <title>Manage Performers</title>
        </Head>
        <BreadcrumbComponent breadcrumbs={[{ title: 'Performers', href: '/performer' }, { title: 'Models online'}]} />
        <Page>
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

const mapStates = (state: any) => ({
  currentUser: state.user.current
});
export default connect(mapStates)(Performers);
