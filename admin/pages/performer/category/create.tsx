import Head from 'next/head';
import { PureComponent, Fragment } from 'react';
import Page from '@components/common/layout/page';
import Link from 'next/link';
import { Form, Input, Button, Breadcrumb, message, InputNumber } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { performerCategoryService } from '@services/perfomer-category.service';
import Router from 'next/router';

interface IFormValue {
  name: string;
  slug: string;
  ordering: number;
  description: string;
}

class CategoryCreate extends PureComponent<any> {
  state = {
    submitting: false
  };

  async submit(data: any) {
    try {
      this.setState({ submitting: true });

      const submitData = {
        ...data
      };
      const resp = await performerCategoryService.create(submitData);
      message.success('Created successfully');
      Router.back();
      // TODO - redirect
    } catch (e) {
      // TODO - check and show error here
      const err = (await Promise.resolve(e)) || {};
      message.error(err.message || 'An error occurred, please try again!');
    } finally  {
      this.setState({ submitting: false });
    }
  }

  render() {
    return (
      <Fragment>
        <Head>
          <title>Create new category</title>
        </Head>
        <div style={{ marginBottom: '16px' }}>
          <Breadcrumb>
            <Breadcrumb.Item href="/dashboard">
              <HomeOutlined />
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link href={'/performer/category'} as={'/performer/category'}>
                <a>{'Categories'}</a>
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Create new category</Breadcrumb.Item>
          </Breadcrumb>
        </div>

        <Page>
          <Form
            onFinish={this.submit.bind(this)}
            initialValues={
              {
                name: '',
                slug: '',
                ordering: 0,
                description: ''
              } as IFormValue
            }
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 20 }}
          >
            <Form.Item
              name="name"
              rules={[{ required: true, message: 'Please input name!' }]}
              label="Name"
            >
              <Input placeholder="Enter category name" />
            </Form.Item>

            <Form.Item name="slug" label="Slug">
              <Input placeholder="Custom friendly slug" />
            </Form.Item>

            <Form.Item name="ordering" label="Ordering">
              <InputNumber />
            </Form.Item>

            <Form.Item name="description" label="Description">
              <Input.TextArea rows={3} />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              style={{ float: 'right' }}
              loading={this.state.submitting}
            >
              Submit
            </Button>
          </Form>
        </Page>
      </Fragment>
    );
  }
}

export default CategoryCreate;
