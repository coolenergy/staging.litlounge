import { Form, Input, Button, Row } from 'antd';
import { Fragment, PureComponent } from 'react';
import { connect } from 'react-redux';
import { CopyrightCircleOutlined } from '@ant-design/icons';
import './index.less';
import Head from 'next/head';
import { authService } from '@services/auth.service';
import Link from 'next/link';
import { message } from 'antd';
const FormItem = Form.Item;

interface IProps {
  auth: any;
  ui: any;
}

class Forgot extends PureComponent<IProps> {
  static layout: string = 'public';
  static authenticate: boolean = false;

  state = {
    loading: false
  };

  handleOk = async (data) => {
    try {
      await authService.forgotPassword(data.email, 'user');
      message.success('New password have been sent to your email');
    } catch (e) {

    }
  };

  render() {
    const { siteName, logo } = this.props.ui;
    const { loading } = this.state;
    return (
      <Fragment>
        <Head>
          <title>Forgot password</title>
        </Head>
        <div className="form" style={{ height: '240px' }}>
          <div className="logo">
            {logo && <img alt="logo" src={logo} />}
            <span>{siteName}</span>
          </div>
          <Form
            onFinish={this.handleOk}
          >
            <FormItem
              hasFeedback
              // label="Username"
              name="email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email' }
              ]}
            >
              <Input
                placeholder="youremail@example.com"
              />
            </FormItem>
            <Row>
              <Button
                type="primary"
                loading={loading}
                htmlType="submit"
              >
                Submit
              </Button>
            </Row>
          </Form>
          <p>
            <Link href="/auth/login">
              <a style={{ float: 'right' }}>Login</a>
            </Link>
          </p>
        </div>
        <div className="footer">{siteName}{' '}<CopyrightCircleOutlined /> {` Copy right ${new Date().getFullYear()}`}</div>
      </Fragment>
    );
  }
}

const mapStates = (state: any) => ({
  ui: state.ui
});
export default connect(mapStates)(Forgot);
