import Head from 'next/head';
import { PureComponent, Fragment } from 'react';
import Page from '@components/common/layout/page';
import Router from 'next/router';
import dynamic from 'next/dynamic';
import {
  Row,
  Col,
  Form,
  Input,
  Select,
  Button,
  Breadcrumb,
  message
} from 'antd';
import { HomeOutlined, UserOutlined } from '@ant-design/icons';
import { postService } from '@services/post.service';
const WYSIWYG = dynamic(() => import('@components/wysiwyg'), {
  ssr: false
});
class PostCreate extends PureComponent<any> {
  private _content: string = '';

  state = {
    submitting: false
  };

  static async getInitialProps({ ctx }) {
    const query = ctx.query;
    if (!query.type) {
      query.type = 'post';
    }
    return query;
  }

  async submit(data: any) {
    try {
      this.setState({ submitting: true });

      const submitData = {
        ...data,
        content: this._content,
        type: this.props.type
      };
      const resp = await postService.create(submitData);
      message.success('Created successfully');
      // TODO - redirect
      this.setState({ submitting: false }, () => {
        window.setTimeout(() => {
          Router.push(
            {
              pathname: '/posts',
              query: {
                id: resp.data._id
              }
            },
            `/posts`
          );
        }, 1000);
      });
    } catch (e) {
      // TODO - check and show error here
      message.error('Something went wrong, please try again!');
      this.setState({ submitting: false });
    } finally {
      this.setState({ submitting: false });
    }
  }

  contentChange(content: { [html: string]: string }) {
    this._content = content.html;
  }

  render() {
    return (
      <Fragment>
        <Head>
          <title>Create new post</title>
        </Head>
        <div style={{ marginBottom: '16px' }}>
          <Breadcrumb>
            <Breadcrumb.Item href="/dashboard">
              <HomeOutlined />
            </Breadcrumb.Item>
            <Breadcrumb.Item href="/posts">
              <span>Posts</span>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Create new post</Breadcrumb.Item>
          </Breadcrumb>
        </div>

        <Page>
          <Form
            onFinish={this.submit.bind(this)}
            initialValues={{
              title: '',
              shortDescription: '',
              status: 'published'
            }}
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 20 }}
          >
            <Form.Item
              name="title"
              rules={[{ required: true, message: 'Please input title!' }]}
              label="Title"
            >
              <Input placeholder="Enter your title" />
            </Form.Item>

            <Form.Item name="slug" label="Slug">
              <Input placeholder="Custom friendly slug" />
            </Form.Item>

            <Form.Item name="shortDescription" label="Short description">
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item label="Content">
              <WYSIWYG
                onChange={this.contentChange.bind(this)}
                html={this._content}
              />
            </Form.Item>
            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true }]}
            >
              <Select>
                <Select.Option value="published">Publish</Select.Option>
                <Select.Option value="draft">Draft</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item wrapperCol={{ offset: 4 }}>
              <Button
                type="primary"
                htmlType="submit"
                style={{ float: 'right' }}
                loading={this.state.submitting}
              >
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Page>
      </Fragment>
    );
  }
}

export default PostCreate;
