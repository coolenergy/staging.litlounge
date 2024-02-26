import Head from 'next/head';
import { PureComponent, Fragment } from 'react';
import Page from '@components/common/layout/page';

import dynamic from 'next/dynamic';
import { Form, Input, Select, Button, Breadcrumb, message } from 'antd';
import { HomeOutlined, UserOutlined } from '@ant-design/icons';
import { postService } from '@services/post.service';
import Loader from '@components/common/base/loader';
const WYSIWYG = dynamic(() => import('@components/wysiwyg'), {
  ssr: false
});
class PostUpdate extends PureComponent<any> {
  private _content: string = '';

  state = {
    submitting: false,
    fetching: true,
    post: null
  };

  static async getInitialProps({ ctx }) {
    const query = ctx.query;
    if (!query.type) {
      query.type = 'post';
    }
    return query;
  }

  async componentDidMount() {
    try {
      const resp = await postService.findById(this.props.id);
      this._content = resp.data.content;
      this.setState({ post: resp.data });
    } catch (e) {
      message.error('Post not found!');
    } finally {
      this.setState({ fetching: false });
    }
  }

  async submit(data: any) {
    try {
      this.setState({ submitting: true });

      const submitData = {
        ...data,
        content: this._content
      };
      await postService.update(this.props.id, submitData);
      message.success('Updated successfully');
      this.setState({ submitting: false });
    } catch (e) {
      // TODO - check and show error here
      message.error('Something went wrong, please try again!');
      this.setState({ submitting: false });
    }
  }

  contentChange(content: { [html: string]: string }) {
    this._content = content.html;
  }

  render() {
    const { post } = this.state;
    return (
      <Fragment>
        <Head>
          <title>Update post</title>
        </Head>
        <div style={{ marginBottom: '16px' }}>
          <Breadcrumb>
            <Breadcrumb.Item href="/dashboard">
              <HomeOutlined />
            </Breadcrumb.Item>
            <Breadcrumb.Item href="/posts">
              <span>Posts</span>
            </Breadcrumb.Item>
            {post && <Breadcrumb.Item>{post.title}</Breadcrumb.Item>}
            <Breadcrumb.Item>Update</Breadcrumb.Item>
          </Breadcrumb>
        </div>

        <Page>
          {!post ? (
            <Loader />
          ) : (
            <Form
              onFinish={this.submit.bind(this)}
              initialValues={post}
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
          )}
        </Page>
      </Fragment>
    );
  }
}

export default PostUpdate;
