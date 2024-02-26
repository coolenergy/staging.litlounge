import Head from 'next/head';
import { PureComponent, Fragment } from 'react';
import { message } from 'antd';
import Page from '@components/common/layout/page';
import { galleryService } from '@services/gallery.service';
import { SearchFilter } from '@components/common/search-filter';
import { TableListGallery } from '@components/gallery/table-list';
import { BreadcrumbComponent } from '@components/common';

interface IProps {
  performerId: string;
}

class Galleries extends PureComponent<IProps> {
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
      const resp = await galleryService.search({
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

  async deleteGallery(id: string) {
    if (!confirm('Are you sure you want to delete this album?')) {
      return false;
    }
    try {
      await galleryService.delete(id);
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
          <title>Gallerys</title>
        </Head>
        <BreadcrumbComponent breadcrumbs={[{ title: 'Galleries' }]} />
        <Page>
          <SearchFilter
            searchWithPerformer={true}
            statuses={statuses}
            onSubmit={this.handleFilter.bind(this)}
            performerId={this.props.performerId || ''}
          />
          <div style={{ marginBottom: '20px' }}></div>
          <TableListGallery
            dataSource={list}
            rowKey="_id"
            loading={searching}
            pagination={pagination}
            onChange={this.handleTableChange.bind(this)}
            deleteGallery={this.deleteGallery.bind(this)}
          />
        </Page>
      </Fragment>
    );
  }
}

export default Galleries;
