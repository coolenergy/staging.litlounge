import React from 'react';
import PrimaryLayout from './primary-layout';
import PublicLayout from './public-layout';
import { IAppConfig } from 'src/interfaces';
import Head from 'next/head';
import withReduxSaga from '@redux/withReduxSaga';
import { connect } from 'react-redux';

interface DefaultProps {
  children: any;
  appConfig?: IAppConfig;
  layout?: string;
  settings?: any;
}

const LayoutMap = {
  primary: PrimaryLayout,
  public: PublicLayout
};

class BaseLayout extends React.PureComponent<DefaultProps> {
  render() {
    const { children, layout, appConfig, settings } = this.props;
    
    const Container = layout && LayoutMap[layout] ? LayoutMap[layout] : LayoutMap.primary;
    return (
      <React.Fragment>
        <Head>
          <link href="/css/antd.min.css" rel="stylesheet" key="antd" />
          <link
            rel="icon"
            href={settings && settings.favicon}
            sizes="64x64"
          ></link>
        </Head>

        <Container>{children}</Container>
      </React.Fragment>
    );
  }
}
const mapStates = (state) => ({
  settings: state.settings
});
export default connect(mapStates)(BaseLayout);
