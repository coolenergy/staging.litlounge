import Head from 'next/head';
import { PureComponent, Fragment, createRef } from 'react';
import { message, Tabs } from 'antd';
import Page from '@components/common/layout/page';
import { ICountry } from 'src/interfaces';
import Router from 'next/router';
import { studioService, performerCategoryService } from '@services/index';
import { utilsService } from '@services/utils.service';
import { validateUsername, getResponseError } from '@lib/utils';
import Link from 'next/link';
import StudioAccountForm from '@components/studio/studio-account-form';
import { BreadcrumbComponent } from '@components/common';
import { omit } from 'lodash';
import StudioCommissionForm from '@components/studio/studio-commission-form';
interface IProps {
  countries: ICountry[];
}
class StudioCreate extends PureComponent<IProps> {
  static async getInitialProps() {
    const [countries, categories] = await Promise.all([
      utilsService.countriesList(),
      utilsService.languagesList(),
      performerCategoryService.search({
        sortBy: 'ordering',
        sort: 'asc',
        limit: 100
      })
    ]);
    return {
      countries: countries.data
    };
  }

  state = {
    creating: false,
    fetching: false
  };

  _document: File;

  customFields = {};

  formRef = createRef() as any;

  onBeforeUpload(file) {
    this._document = file;
  }

  onFormRefSubmit() {
    this.formRef.formRefSubmit();
  }

  async submit(data: any) {
    try {
      if (data.password !== data.rePassword) {
        return message.error('Confirm password mismatch!');
      }

      if (!validateUsername(data.username)) {
        return message.error('Username is invalid!');
      }
      data = omit(data, ['rePassword']);
      this.setState({ creating: true });
      const resp = await studioService.create({
        ...data,
        ...this.customFields
      });
      Router.push(
        {
          pathname: '/studios'
        },
        `/studios`,
        {
          shallow: false
        }
      );
    } catch (e) {
      const err = (await Promise.resolve(e)) || {};
      message.error(
        getResponseError(err) || 'An error occurred, please try again!'
      );
    } finally {
      this.setState({ creating: false });
    }
  }

  // onCreateStudioCommissionSetting(values) {
  //   this.customFields['commissionSetting'] = values;
  //   this.onFormRefSubmit();
  // }

  render() {
    const { creating } = this.state;
    const { countries } = this.props;

    return (
      <Fragment>
        <Head>
          <title>Create Studio</title>
        </Head>
        <BreadcrumbComponent
          breadcrumbs={[
            { title: 'Studio', href: '/studios' },
            { title: 'Create new Studio' }
          ]}
        />
        <Page>
          <Tabs defaultActiveKey="basic" tabPosition="left">
            <Tabs.TabPane tab={<span>General info</span>} key="basic">
              <StudioAccountForm
                onFinish={this.submit.bind(this)}
                submiting={creating}
                countries={countries}
              />
            </Tabs.TabPane>
            {/* <Tabs.TabPane
              tab={<span>Commission Setting</span>}
              key="commission"
            >
              <StudioCommissionForm
                submiting={creating}
                onFinish={this.onCreateStudioCommissionSetting.bind(this)}
              />
            </Tabs.TabPane> */}
          </Tabs>
        </Page>
      </Fragment>
    );
  }
}

export default StudioCreate;
