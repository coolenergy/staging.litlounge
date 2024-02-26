import Head from 'next/head';
import { PureComponent, Fragment, createRef } from 'react';
import { Tabs, message } from 'antd';
import Page from '@components/common/layout/page';
import { AccountForm } from '@components/performer/AccountForm';
import { PerformerDocument } from '@components/performer/Document';
import { PerformerSchedule } from '@components/performer/Schedule';
import nextCookie from 'next-cookies';
import {
  ICountry,
  ILangguges,
  IPhoneCodes,
  IPerformerUpdate,
  IPerformerCategory,
  ISchedule,
  IStudio
} from 'src/interfaces';
import {
  authService,
  performerService,
  performerCategoryService,
  studioService
} from '@services/index';
import Loader from '@components/common/base/loader';
import { utilsService } from '@services/utils.service';
import { UpdatePaswordForm } from '@components/user/update-password-form';
import { BreadcrumbComponent } from '@components/common';
import { SocialsForm } from '@components/performer/socialsForm';
import { CommissionSettingForm } from '@components/performer/commission-setting';

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 }
};

interface IProps {
  id: string;
  countries: ICountry[];
  languages: ILangguges[];
  phoneCodes: IPhoneCodes[];
  studios: IStudio[];
  categories: IPerformerCategory[];
}
class PerformerUpdate extends PureComponent<IProps> {
  static async getInitialProps({ ctx }) {
    try {
      const { token } = nextCookie(ctx);
      const [countries, languages, phoneCodes, categories, studios] =
        await Promise.all([
          utilsService.countriesList(),
          utilsService.languagesList(),
          utilsService.phoneCodesList(),
          performerCategoryService.search({
            sortBy: 'ordering',
            sort: 'asc',
            limit: 100
          }),
          studioService.search(
            {
              limit: 100
            },
            {
              Authorization: token
            }
          )
        ]);

      return {
        countries: countries.data,
        languages: languages.data,
        phoneCodes: phoneCodes.data,
        studios: studios.data.data,
        categories:
          categories.data && categories.data.data ? categories.data.data : [],
        ...ctx.query
      };
    } catch (e) {
      const error = await Promise.resolve(e);
      console.log(error);
      return;
    }
  }

  formRef = createRef() as any;

  state = {
    pwUpdating: false,
    updating: false,
    fetching: false,
    performer: {} as IPerformerUpdate,
    settingUpdating: false
  };

  customFields = {};
  scheduleValue = {
    mon: {
      start: '00:00',
      end: '',
      closed: true
    },
    tue: {
      start: '00:00',
      end: '',
      closed: true
    },
    wed: {
      start: '00:00',
      end: '',
      closed: true
    },
    thu: {
      start: '00:00',
      end: '',
      closed: true
    },
    fri: {
      start: '00:00',
      end: '',
      closed: true
    },
    sat: {
      start: '00:00',
      end: '',
      closed: true
    },
    sun: {
      start: '00:00',
      end: '',
      closed: true
    }
  } as ISchedule;

  dates = null;

  async componentDidMount() {
    try {
      this.setState({ fetching: true });
      const resp = await performerService.findById(this.props.id);
      this.setState({ performer: resp.data });
      if (resp.data && resp.data.schedule) {
        this.scheduleValue = { ...this.scheduleValue, ...resp.data.schedule };
      }
    } catch (e) {
      message.error('Error while fecting performer!');
    } finally {
      this.setState({ fetching: false });
    }
  }

  async submit(data: any) {
    try {
      this.setState({ updating: true });
      const updated = await performerService.update(this.props.id, {
        ...data,
        ...this.customFields,
        schedule: this.scheduleValue
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
      await authService.updatePassword(
        data.password,
        this.props.id,
        'performer'
      );
      message.success('Password has been updated!');
    } catch (e) {
      message.error('An error occurred, please try again!');
    } finally {
      this.setState({ pwUpdating: false });
    }
  }

  onUploaded(field: string, resp: any) {
    this.customFields[field] = resp.response.data._id;
  }

  onUpdateSocials(values) {
    const { performer } = this.state;
    const data = { ...performer, ...values };
    this.submit(data);
  }

  onFormRefSubmit() {
    this.formRef.formRefSubmit();
  }

  onChangeTime(dates: [], dateStrings: [string, string], key: string) {
    this.dates = dates;
    const start = dateStrings[0];
    const end = dateStrings[1];
    const objectKey = this.scheduleValue[key];
    objectKey['start'] = start;
    objectKey['end'] = end;
    this.scheduleValue[key] = { ...this.scheduleValue[key], ...objectKey };
  }

  onChangeCloded(checked: boolean, key: string) {
    const objectKey = this.scheduleValue[key];
    objectKey['closed'] = checked;
    this.scheduleValue[key] = { ...this.scheduleValue[key], ...objectKey };
  }

  async updateCommissionSetting(data: any) {
    try {
      this.setState({ settingUpdating: true });
      await performerService.updateCommissionSetting(this.props.id, {
        ...data,
        performerId: this.props.id
      });
      message.success('Commission setting has been updated!');
    } catch (error) {
      message.error('An error occurred, please try again!');
    } finally {
      this.setState({ settingUpdating: false });
    }
  }

  render() {
    const { pwUpdating, performer, updating, fetching, settingUpdating } =
      this.state;

    return (
      <Fragment>
        <Head>
          <title>Performer update</title>
        </Head>
        <BreadcrumbComponent
          breadcrumbs={[
            { title: 'Performers', href: '/performer' },
            { title: performer.username },
            { title: 'Update' }
          ]}
        />
        <Page>
          {fetching ? (
            <Loader />
          ) : (
            <Tabs defaultActiveKey="basic" tabPosition="left" {...layout}>
              <Tabs.TabPane tab={<span>General info</span>} key="basic">
                <AccountForm
                  ref={(el) => (this.formRef = el)}
                  onUploaded={this.onUploaded.bind(this)}
                  onFinish={this.submit.bind(this)}
                  performer={performer}
                  submiting={updating}
                  {...this.props}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab={<span>Socials</span>} key="socials">
                <SocialsForm
                  ref={(el) => (this.formRef = el)}
                  socials={performer.socials ? performer.socials : {}}
                  onFinish={this.onUpdateSocials.bind(this)}
                  submiting={updating}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab={<span>Change password</span>} key="password">
                <UpdatePaswordForm
                  onFinish={this.updatePassword.bind(this)}
                  updating={pwUpdating}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab={<span>Document</span>} key="document">
                <PerformerDocument
                  update={true}
                  submiting={updating}
                  onUploaded={this.onUploaded.bind(this)}
                  onFormRefSubmit={this.onFormRefSubmit.bind(this)}
                  performer={performer}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab={<span>Schedule</span>} key="schedule">
                <PerformerSchedule
                  scheduleValue={this.scheduleValue}
                  onChangeTime={this.onChangeTime.bind(this)}
                  submiting={updating}
                  onFormRefSubmit={this.onFormRefSubmit.bind(this)}
                  onChangeCloded={this.onChangeCloded.bind(this)}
                />
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={<span>Commission Setting</span>}
                key="commission"
              >
                {!performer.studioId ? (
                  <CommissionSettingForm
                    submiting={settingUpdating}
                    onFinish={this.updateCommissionSetting.bind(this)}
                    commissionSetting={performer.commissionSetting}
                  />
                ) : (
                  <ul>
                    <li>This is a studio-operated model.</li>
                    <li>
                      You can change the commission values for the studio under
                      the studio profile settings.
                    </li>
                    <li>
                      The studio will be able to define the commission for this
                      model from studio dashboard.
                    </li>
                  </ul>
                )}
              </Tabs.TabPane>
            </Tabs>
          )}
        </Page>
      </Fragment>
    );
  }
}

export default PerformerUpdate;
