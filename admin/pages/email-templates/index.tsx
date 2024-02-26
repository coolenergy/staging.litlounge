import Head from 'next/head';
import Link from 'next/link';
import { PureComponent, Fragment } from 'react';
import {
  Table, message, Breadcrumb, Dropdown, Menu, Button
} from 'antd';
import {
  HomeOutlined,
  DownOutlined,
  EditOutlined
} from '@ant-design/icons';
import Page from '@components/common/layout/page';
import { formatDate } from '@lib/date';
import { emailTemplateService } from '@services/email-template.service';

interface IProps {}

class EmailTemplates extends PureComponent<IProps> {
  state = {
    searching: false,
    list: []
  };

  componentDidMount() {
    this.search();
  }

  async search() {
    try {
      await this.setState({ searching: true });
      const resp = await emailTemplateService.findAll();
      await this.setState({
        searching: false,
        list: resp.data
      });
    } catch (e) {
      message.error('An error occurred, please try again!');
      await this.setState({ searching: false });
    }
  }

  render() {
    const { list, searching } = this.state;
    const columns = [
      {
        title: 'Key',
        dataIndex: 'key'
      },
      {
        title: 'Name',
        dataIndex: 'name',
        render(data, record) {
          return (
            <>
              <Link
                href={{
                  pathname: '/email-templates/update',
                  query: {
                    id: record._id
                  }
                }}
              >
                <a style={{ fontWeight: 'bold' }}>{record.name}</a>
              </Link>
              <br />
              <small>{record.description}</small>
            </>
          );
        }
      },
      {
        title: 'Subject',
        dataIndex: 'subject'
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
        render: (id: string) => (
          <Dropdown
            overlay={(
              <Menu>
                <Menu.Item key="edit">
                  <Link
                    href={{
                      pathname: '/email-templates/update',
                      query: { id }
                    }}
                    as={`/email-templates/update?id=${id}`}
                  >
                    <a>
                      <EditOutlined />
                      {' '}
                      Update
                    </a>
                  </Link>
                </Menu.Item>
              </Menu>
              )}
          >
            <Button>
              Actions
              {' '}
              <DownOutlined />
            </Button>
          </Dropdown>
        )
      }
    ];
    return (
      <>
        <Head>
          <title>Email templates</title>
        </Head>
        <div style={{ marginBottom: '16px' }}>
          <Breadcrumb>
            <Breadcrumb.Item href="/dashboard">
              <HomeOutlined />
            </Breadcrumb.Item>
            <Breadcrumb.Item>Email templates</Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <Page>
          <Table
            dataSource={list}
            columns={columns}
            rowKey="_id"
            loading={searching}
          />
        </Page>
      </>
    );
  }
}

export default EmailTemplates;
