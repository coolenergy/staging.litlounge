import Head from 'next/head';
import { PureComponent, Fragment } from 'react';
import { message } from 'antd';
import Page from '@components/common/layout/page';
import { videoService } from '@services/video.service';
import { SearchFilter } from '@components/common/search-filter';
import { TableListVideo } from '@components/video/table-list';
import { BreadcrumbComponent } from '@components/common';

interface IProps {
  performerId: string;
}

class Videos extends PureComponent<IProps> {
  static async getInitialProps({ ctx }) {
    return ctx.query;
  }
  state = {
    pagination: {} as any,
    searching: false,
    list: [] as any,
    limit: 10,
    filter: {} as any,
    sortBy: 'createdAt',
    sort: 'desc'
  };

  async componentDidMount() {
    if (this.props.performerId) {
      await this.setState({
        filter: {
          ...this.state.filter,
          ...{ performerId: this.props.performerId }
        }
      });
    }
    this.search();
  }
  async search(page = 1) {
    try {
      await this.setState({ searching: true });
      const resp = await videoService.search({
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

  handleTableChange = (pagination, filters, sorter) => {
    const pager = { ...this.state.pagination };
    pager.current = pagination.current;
    this.setState({
      pagination: pager,
      sortBy: sorter.field || 'createdAt',
      sort: sorter.order
        ? sorter.order === 'descend'
          ? 'desc'
          : 'asc'
        : 'desc'
    });
    this.search(pager.current);
  };

  async handleFilter(filter) {
    await this.setState({ filter });
    this.search();
  }

  async deleteVideo(id: string) {
    if (!confirm('Are you sure you want to delete this video?')) {
      return false;
    }
    try {
      await videoService.delete(id);
      message.success('Deleted successfully');
      await this.search(this.state.pagination.current);
    } catch (e) {
      const err = (await Promise.resolve(e)) || {};
      message.error(err.message || 'An error occurred, please try again!');
    }
  }

  render() {
    const { list, searching, pagination } = this.state;
    const statuses = [
      {
        key: '',
        text: 'All'
      },
      {
        key: 'draft',
        text: 'Draft'
      },
      {
        key: 'active',
        text: 'Active'
      },
      {
        key: 'inactive',
        text: 'Inactive'
      }
    ];

    return (
      <Fragment>
        <Head>
          <title>Videos</title>
        </Head>
        <BreadcrumbComponent breadcrumbs={[{ title: 'Videos' }]} />
        <Page>
          <SearchFilter
            searchWithPerformer={true}
            statuses={statuses}
            onSubmit={this.handleFilter.bind(this)}
            performerId={this.props.performerId || ''}
          />
          <div style={{ marginBottom: '20px' }}></div>
          <TableListVideo
            dataSource={list}
            rowKey="_id"
            loading={searching}
            pagination={pagination}
            onChange={this.handleTableChange.bind(this)}
            deleteVideo={this.deleteVideo.bind(this)}
          />
        </Page>
      </Fragment>
    );
  }
}

export default Videos;
