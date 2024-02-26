import Head from 'next/head';
import { PureComponent, Fragment } from 'react';
import { connect } from 'react-redux';
import { Tabs, message } from 'antd';
import Page from '@components/common/layout/page';
import { AccountForm } from '@components/user/account-form';
import { IUser, ICountry } from 'src/interfaces';
import { updateUser, updateCurrentUserAvatar } from 'src/redux/user/actions';
import { authService, userService } from '@services/index';
import { UpdateAdminAccountPasswordForm } from '@components/setting/update-admin-account-password-form';
import { utilsService } from '@services/utils.service';

interface IProps {
  currentUser: IUser;
  updateUser: Function;
  updating?: boolean;
  updateCurrentUserAvatar: Function;
  countries: ICountry[];
  updateSuccess?: boolean;
}
class AccountSettings extends PureComponent<IProps> {
  static async getInitialProps({ ctx }) {
    const resp = await utilsService.countriesList();
    return {
      countries: resp.data,
      ...ctx.query
    };
  }
  state = {
    pwUpdating: false
  };

  submit(data: any) {
    this.props.updateUser(data);
    // TODO - show alert success for update?
    // or move to sagas
  }

  onAvatarUploaded(data: any) {
    message.success('Avatar has been updated!');
    this.props.updateCurrentUserAvatar(data.base64);
  }

  async updatePassword(data: any) {
    try {
      this.setState({ pwUpdating: true });
      await authService.updateAdminPassword(data);
      message.success('Password has been updated!');
    } catch (e) {
      message.error('An error occurred, please try again!');
    } finally {
      this.setState({ pwUpdating: false });
    }
  }

  componentDidUpdate(prevProps: any) {
    if (
      prevProps.updateSuccess !== this.props.updateSuccess &&
      this.props.updateSuccess
    ) {
      message.success('Updated successfully!');
    }
  }

  render() {
    const { currentUser, updating, countries } = this.props;
    const { pwUpdating } = this.state;
    const uploadHeaders = {
      authorization: authService.getToken()
    };
    return (
      <Fragment>
        <Head>
          <title>Account Settings</title>
        </Head>
        <Page>
          <Tabs defaultActiveKey="basic" tabPosition="left">
            <Tabs.TabPane tab={<span>Basic info</span>} key="basic">
              <AccountForm
                onFinish={this.submit.bind(this)}
                user={currentUser}
                updating={updating}
                options={{
                  uploadHeaders,
                  avatarUploadUrl: userService.getAvatarUploadUrl(),
                  onAvatarUploaded: this.onAvatarUploaded.bind(this)
                }}
                countries={countries}
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab={<span>Change password</span>} key="password">
              <UpdateAdminAccountPasswordForm
                onFinish={this.updatePassword.bind(this)}
                updating={pwUpdating}
              />
            </Tabs.TabPane>
          </Tabs>
        </Page>
      </Fragment>
    );
  }
}

const mapStates = (state: any) => ({
  currentUser: state.user.current,
  updating: state.user.updating,
  updateSuccess: state.user.updateSuccess
});
const mapDispatch = { updateUser, updateCurrentUserAvatar };
export default connect(mapStates, mapDispatch)(AccountSettings);
