import Head from 'next/head';
import { PureComponent, Fragment, createRef } from 'react';
import { Tabs, message } from 'antd';
import Page from '@components/common/layout/page';
import StudioAccountForm from '@components/studio/studio-account-form';
import { ICountry, IStudio } from 'src/interfaces';
import { authService, studioService } from '@services/index';
import Loader from '@components/common/base/loader';
import { utilsService } from '@services/utils.service';
import { UpdatePaswordForm } from '@components/user/update-password-form';
import { BreadcrumbComponent } from '@components/common';
import StudioCommissionForm from '@components/studio/studio-commission-form';
import { getResponseError } from '@lib/utils';
import { StudioDocumentForm } from '@components/studio/studio-document-form';
interface IProps {
  id: string;
  countries: ICountry[];
}
class PerformerUpdate extends PureComponent<IProps> {
  static async getInitialProps({ ctx }) {
    const [countries] = await Promise.all([utilsService.countriesList()]);
    return {
      countries: countries.data,
      ...ctx.query
    };
  }

  formRef = createRef() as any;

  state = {
    pwUpdating: false,
    updating: false,
    fetching: false,
    studio: {} as IStudio,
    settingUpdating: false
  };

  _document: File;

  customFields = {};

  dates = null;

  async componentDidMount() {
    try {
      this.setState({ fetching: true });
      const resp = await studioService.findById(this.props.id);
      this.setState({ studio: resp.data });
    } catch (e) {
      message.error('Error while fecting performer!');
    } finally {
      this.setState({ fetching: false });
    }
  }

  async submit(data: any) {
    try {
      this.setState({ updating: true });
      const updated = await studioService.update(this.props.id, {
        ...data,
        ...this.customFields
      });
      this.setState({ performer: updated.data });
      message.success('Updated successfully');
    } catch (e) {
      // TODO - exact error message
      message.error('An error occurred, please try again!');
    } finally {
      this.setState({ updating: false });
    }
  }

  async updatePassword(data: any) {
    try {
      this.setState({ pwUpdating: true });
      await authService.updatePassword(data.password, this.props.id, 'studio');
      message.success('Password has been updated!');
    } catch (e) {
      const err = await Promise.resolve(e);
      message.error(
        getResponseError(err) || 'An error occurred, please try again!'
      );
    } finally {
      this.setState({ pwUpdating: false });
    }
  }

  onUploaded(field: string, resp: any) {
    this.customFields[field] = resp.response.data._id;
  }

  onBeforeUpload(file) {
    this._document = file;
  }

  onFormRefSubmit() {
    this.formRef.formRefSubmit();
  }

  async updateCommissionSetting(data: any) {
    try {
      this.setState({ settingUpdating: true });
      await studioService.updateStudioCommission(this.props.id, {
        ...data,
        studioId: this.props.id
      });
      message.success('Commission setting has been updated!');
    } catch (e) {
      const err = await Promise.resolve(e);
      message.error(
        getResponseError(err) || 'An error occurred, please try again!'
      );
    } finally {
      this.setState({ settingUpdating: false });
    }
  }

  render() {
    const {
      pwUpdating,
      studio,
      updating,
      fetching,
      settingUpdating
    } = this.state;
    const { countries } = this.props;
    return (
      <Fragment>
        <Head>
          <title>Studio update</title>
        </Head>
        <BreadcrumbComponent
          breadcrumbs={[
            { title: 'Studios', href: '/studios' },
            { title: studio.username },
            { title: 'Update' }
          ]}
        />
        <Page>
          {fetching ? (
            <Loader />
          ) : studio ? (
            <Tabs defaultActiveKey="basic" tabPosition="left">
              <Tabs.TabPane tab={<span>General info</span>} key="basic">
                <StudioAccountForm
                  ref={(el) => (this.formRef = el)}
                  onFinish={this.submit.bind(this)}
                  studio={studio}
                  submiting={updating}
                  countries={countries}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab={<span>Change password</span>} key="password">
                <UpdatePaswordForm
                  onFinish={this.updatePassword.bind(this)}
                  updating={pwUpdating}
                />
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={<span>Commission Setting</span>}
                key="commission"
              >
                <StudioCommissionForm
                  submiting={settingUpdating}
                  onFinish={this.updateCommissionSetting.bind(this)}
                  studio={studio}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab={<span>Document</span>} key="document">
                <StudioDocumentForm
                  submiting={updating}
                  onUploaded={this.onUploaded.bind(this)}
                  studio={studio}
                  method="PUT"
                  // beforeUpload={this.onBeforeUpload.bind(this)}
                />
              </Tabs.TabPane>
            </Tabs>
          ) : (
            <p>Studio not found!</p>
          )}
        </Page>
      </Fragment>
    );
  }
}

export default PerformerUpdate;
