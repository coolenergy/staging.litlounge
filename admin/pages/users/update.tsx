import Head from 'next/head';
import { PureComponent, Fragment } from 'react';
import { Tabs, message } from 'antd';
import Page from '@components/common/layout/page';
import { AccountForm } from '@components/user/account-form';
import { IUser, ICountry } from 'src/interfaces';
import { authService, userService } from '@services/index';
import { UpdatePaswordForm } from '@components/user/update-password-form';
import Loader from '@components/common/base/loader';
import { utilsService } from '@services/utils.service';
import { UpdateBalanceForm } from '@components/user/UpdateBalanceForm';
interface IProps {
  id: string;
  countries: ICountry[];
}
class UserUpdate extends PureComponent<IProps> {
  static async getInitialProps({ ctx }) {
    const resp = await utilsService.countriesList();
    return {
      countries: resp.data,
      ...ctx.query
    };
  }

  state = {
    pwUpdating: false,
    updating: false,
    fetching: false,
    user: {} as IUser
  };

  async componentDidMount() {
    try {
      this.setState({ fetching: true });
      const resp = await userService.findById(this.props.id);
      this.setState({ user: resp.data });
    } catch (e) {
      message.error('Error while fecting user!');
    } finally {
      this.setState({ fetching: false });
    }
  }

  async submit(data: any) {
    try {
      this.setState({ updating: true });
      const updated = await userService.update(this.props.id, data);
      this.setState({ user: updated.data });
      message.success('Updated successfully');
    } catch (e) {
      // TODO - exact error message
      message.error('An error occurred, please try again!');
    } finally {
      this.setState({ updating: false });
    }
  }

  onAvatarUploaded(data: any) {
    // TODO - check with current user if needed?
    message.success('Avatar has been updated!');
    // this.props.updateCurrentUserAvatar(data.base64);
  }

  async updatePassword(data: any) {
    try {
      this.setState({ pwUpdating: true });
      await authService.updatePassword(data.password, this.props.id);
      message.success('Password has been updated!');
    } catch (e) {
      message.error('An error occurred, please try again!');
    } finally {
      this.setState({ pwUpdating: false });
    }
  }

  render() {
    const { pwUpdating, user, updating, fetching } = this.state;
    const { countries } = this.props;
    const uploadHeaders = {
      authorization: authService.getToken()
    };
    return (
      <Fragment>
        <Head>
          <title>User update</title>
        </Head>
        <Page>
          {fetching ? (
            <Loader />
          ) : (
            <Tabs defaultActiveKey="basic" tabPosition="left">
              <Tabs.TabPane tab={<span>Basic info</span>} key="basic">
                <AccountForm
                  onFinish={this.submit.bind(this)}
                  user={user}
                  updating={updating}
                  options={{
                    uploadHeaders,
                    avatarUploadUrl: userService.getAvatarUploadUrl(user._id),
                    onAvatarUploaded: this.onAvatarUploaded.bind(this)
                  }}
                  countries={countries}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab={<span>Change password</span>} key="password">
                <UpdatePaswordForm
                  onFinish={this.updatePassword.bind(this)}
                  updating={pwUpdating}
                />
              </Tabs.TabPane>

              <Tabs.TabPane tab={<span>Balance</span>} key="balance">
                <UpdateBalanceForm
                  balance={user.balance}
                  onFinish={this.submit.bind(this)}
                  updating={updating}
                />
              </Tabs.TabPane>
            </Tabs>
          )}
        </Page>
      </Fragment>
    );
  }
}

export default UserUpdate;
