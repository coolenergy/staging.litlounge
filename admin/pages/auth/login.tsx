import { Form, Input, Button, Row, Alert } from 'antd';
import { Fragment, PureComponent } from 'react';
import { connect } from 'react-redux';
import { CopyrightCircleOutlined } from '@ant-design/icons';
import './index.less';
import Head from 'next/head';
import { login } from '@redux/auth/actions';
import Link from 'next/link';
import { getResponseError } from '@lib/utils';

const FormItem = Form.Item;

interface IProps {
  loginAuth: any;
  ui: any;
  login: Function;
}

export async function getStaticProps() {
  return {
    props: {}
  };
}
class Login extends PureComponent<IProps> {
  static layout: string = 'public';
  static authenticate: boolean = false;

  handleOk = (data) => {
    this.props.login(data);
  };

  render() {
    const { siteName, logo } = this.props.ui;
    const {
      loginAuth = { requesting: false, error: null, success: false }
    } = this.props;
    return (
      <Fragment>
        <Head>
          <title>Login</title>
        </Head>
        <div className="form">
          <div className="logo">
            {logo && <img alt="logo" src={logo} />}
            <span>{siteName}</span>
          </div>
          {loginAuth.error && (
            <Alert
              message="Error"
              description={getResponseError(loginAuth.error)}
              type="error"
              showIcon
            />
          )}
          {loginAuth.success ? (
            <Alert
              message="Login success"
              type="success"
              description="Redirecting..."
            />
          ) : (
            <Form
              onFinish={this.handleOk}
              initialValues={{
                email: '',
                password: ''
              }}
            >
              <FormItem
                hasFeedback
                // label="Username"
                name="email"
                rules={[
                  { required: true, message: 'Please input your email!' },
                  { type: 'email', message: 'The input is not valid E-mail!' }
                ]}
              >
                <Input placeholder="youremail@example.com" />
              </FormItem>
              <FormItem
                hasFeedback
                // label="Password"
                name="password"
                rules={[
                  { required: true, message: 'Please input your password!' }
                ]}
              >
                <Input type="password" placeholder="Password" />
              </FormItem>
              <FormItem>
                <Button
                  type="primary"
                  disabled={loginAuth.requesting}
                  loading={loginAuth.requesting}
                  htmlType="submit"
                >
                  Sign in
                </Button>
              </FormItem>
            </Form>
          )}

          <p>
            <Link href="/auth/forgot">
              <a style={{ float: 'right' }}>Forgot?</a>
            </Link>
          </p>
        </div>
        <div className="footer">
          {siteName} <CopyrightCircleOutlined />
          {` Copy right ${new Date().getFullYear()}`}
        </div>
      </Fragment>
    );
  }
}

const mapStates = (state: any) => ({
  loginAuth: state.auth.login,
  ui: state.ui
});
const mapDispatch = { login };
export default connect(mapStates, mapDispatch)(Login);
