import React from 'react';
import { Layout, Drawer, BackTop } from 'antd';
import { enquireScreen, unenquireScreen } from 'enquire-js';
import { connect } from 'react-redux';
import { updateUIValue, loadUIValue } from 'src/redux/ui/actions';
import Sider from '@components/common/layout/sider';
import { IUIConfig } from 'src/interfaces/ui-config';
import {
  PieChartOutlined,
  ContainerOutlined,
  UserOutlined,
  WomanOutlined,
  VideoCameraOutlined,
  WalletOutlined,
  DollarOutlined,
  CameraOutlined,
  SkinOutlined,
  OrderedListOutlined,
  BankOutlined,
  MenuOutlined,
  MenuUnfoldOutlined,
  FileImageOutlined,
  BankFilled,
  MailOutlined
} from '@ant-design/icons';
import Header from '@components/common/layout/header';
import { Router } from 'next/router';
import Loader from '@components/common/base/loader';

import './primary-layout.less';

interface DefaultProps extends IUIConfig {
  children: any;
  config: IUIConfig;
  updateUIValue: Function;
  loadUIValue: Function;
}

export async function getInitialProps() {
  return {
    props: {}
  };
}

class PrimaryLayout extends React.PureComponent<DefaultProps> {
  static authenticate = true;
  state = {
    isMobile: false,
    // security request for primary layout
    checkingUser: false,
    routerChange: false
  };
  enquireHandler: any;

  componentDidMount() {
    this.props.loadUIValue();
    this.enquireHandler = enquireScreen((mobile) => {
      const { isMobile } = this.state;
      if (isMobile !== mobile) {
        this.setState({
          isMobile: mobile
        });
      }
    });

    process.browser && this.handleStateChange();
  }

  handleStateChange() {
    Router.events.on(
      'routeChangeStart',
      async () => await this.setState({ routerChange: true })
    );
    Router.events.on(
      'routeChangeComplete',
      async () => await this.setState({ routerChange: false })
    );
  }

  componentWillUnmount() {
    unenquireScreen(this.enquireHandler);
  }

  onCollapseChange = (collapsed) => {
    this.props.updateUIValue({ collapsed });
  };

  onThemeChange = (theme: string) => this.props.updateUIValue({ theme });

  render() {
    const {
      children,
      collapsed,
      fixedHeader,
      logo,
      siteName,
      theme
    } = this.props;
    const { isMobile, routerChange } = this.state;
    const headerProps = {
      collapsed,
      theme,
      onCollapseChange: this.onCollapseChange
    };

    const sliderMenus = [
      {
        id: 'dashboard',
        name: 'Dashboard',
        icon: <PieChartOutlined />,
        children: [
          {
            id: 'stats',
            name: 'Statistic',
            route: '/dashboard'
          }
        ]
      },
      {
        id: 'posts',
        name: 'Static Pages',
        icon: <ContainerOutlined />,
        children: [
          {
            id: 'post-page',
            name: 'Page',
            route: '/posts?type=page'
          },
          {
            id: 'page-create',
            name: 'Create page',
            route: '/posts/create?type=page'
          }
        ]
      },
      {
        id: 'menu',
        name: 'FE Menu',
        icon: <MenuOutlined />,
        children: [
          {
            id: 'menu-listing',
            name: 'Existing menu options',
            route: '/menu'
          },
          {
            name: 'Create',
            id: 'create-menu',
            route: '/menu/create'
          }
        ]
      },
      {
        id: 'banner',
        name: 'Banners',
        icon: <FileImageOutlined />,
        children: [
          {
            id: 'banner-listing',
            name: 'Existing Banners',
            route: '/banner'
          },
          {
            name: 'Upload',
            id: 'upload-banner',
            route: '/banner/upload'
          }
        ]
      },
      {
        id: 'email-template',
        name: 'Email templates',
        icon: <MailOutlined />,
        children: [
          {
            id: 'email-listing',
            name: 'List',
            route: '/email-templates'
          }
        ]
      },
      {
        id: 'studio',
        name: 'Studios',
        icon: <WalletOutlined />,
        children: [
          {
            name: 'List Studios',
            id: 'studios-listing',
            route: '/studios'
          },
          {
            name: 'Pending Studios',
            id: 'pending-studios',
            route: '/studios?status=pending'
          },
          {
            name: 'Create',
            id: 'studios-create',
            route: '/studios/create'
          }
        ]
      },
      {
        id: 'accounts',
        name: 'Users',
        icon: <UserOutlined />,
        children: [
          {
            name: 'User list',
            id: 'users',
            route: '/users'
          },
          {
            name: 'Create',
            id: 'users-create',
            route: '/users/create'
          }
        ]
      },
      {
        id: 'performer',
        name: 'Performers',
        icon: <WomanOutlined />,
        children: [
          {
            name: 'Current categories',
            id: 'performer-categories',
            route: '/performer/category'
          },
          {
            name: 'All Performers',
            id: 'performers',
            route: '/performer'
          },
          {
            name: 'Online Performers',
            id: 'online-performers',
            route: '/performer/online'
          },
          {
            name: 'Pending Performers',
            id: 'pending-performers',
            route: '/performer?status=pending'
          },
          {
            name: 'Create New',
            id: 'create-performers',
            route: '/performer/create'
          }
        ]
      },
      {
        id: 'performers-photos',
        name: 'Photos',
        icon: <CameraOutlined />,
        children: [
          {
            id: 'photo-listing',
            name: 'Photos',
            route: '/photos'
          },
          {
            name: 'Upload',
            id: 'upload-photo',
            route: '/photos/upload'
          },
          {
            name: 'Bulk Upload',
            id: 'bulk-upload-photo',
            route: '/photos/bulk-upload'
          },
          {
            id: 'gallery-listing',
            name: 'Existing galleries',
            route: '/gallery'
          },
          {
            name: 'Create galleries',
            id: 'create-galleries',
            route: '/gallery/create'
          }
        ]
      },
      {
        id: 'performers-products',
        name: 'Products',
        icon: <SkinOutlined />,
        children: [
          {
            id: 'product-listing',
            name: 'Inventory',
            route: '/product'
          },
          {
            name: 'Create',
            id: 'create-product',
            route: '/product/create'
          }
        ]
      },
      {
        id: 'videos',
        name: 'Videos',
        icon: <VideoCameraOutlined />,
        children: [
          {
            id: 'video-listing',
            name: 'Existing videos',
            route: '/video'
          },
          {
            id: 'video-upload',
            name: 'Upload',
            route: '/video/upload'
          }
        ]
      },
      {
        id: 'tokens',
        name: 'Token Packages',
        icon: <BankOutlined />,
        children: [
          {
            id: 'token-listing',
            name: 'Token Packages',
            route: '/token-package'
          },
          {
            id: 'create-token',
            name: 'Create',
            route: '/token-package/create'
          }
        ]
      },
      {
        id: 'earning',
        name: 'Earnings log',
        icon: <DollarOutlined />,
        children: [
          {
            id: 'earning-listing-performer',
            name: 'Performer Earnings',
            route: '/performer-earning'
          },
          {
            id: 'earning-listing-studio',
            name: 'Studio Earnings',
            route: '/earning/studios'
          }
        ]
      },
      {
        id: 'payments',
        name: 'Payments',
        icon: <DollarOutlined />,
        route: '/payment'
      },
      {
        id: 'payment-information',
        name: 'Payment Informations',
        icon: <BankFilled />,
        route: '/payment-information'
      },
      {
        id: 'order',
        name: 'Order history',
        icon: <OrderedListOutlined />,
        children: [
          {
            id: 'order-listing',
            name: 'Orders Managment',
            route: '/order'
          }
        ]
      },
      {
        id: 'payout',
        name: 'Payout requests',
        icon: <MenuUnfoldOutlined />,
        children: [
          {
            id: 'payout-listing-performer',
            name: 'Performer Requests',
            route: '/payout-request'
          },
          {
            id: 'payout-listing-studio',
            name: 'Studio Requests',
            route: '/payout-request/studios'
          }
        ]
      },
      // {
      //   id: 'refund',
      //   name: 'Refund requests',
      //   icon: <ExclamationOutlined />,
      //   children: [
      //     {
      //       id: 'refund-listing',
      //       name: 'Refund Request Managment',
      //       route: '/refund-request'
      //     }
      //   ]
      // },
      {
        id: 'settings',
        name: 'Settings',
        icon: <PieChartOutlined />,
        children: [
          {
            id: 'system-settings',
            route: '/settings',
            as: '/settings',
            name: 'System settings'
          },
          {
            name: 'Account settings',
            id: 'account-settings',
            route: '/account/settings'
          }
        ]
      }
    ];
    const siderProps = {
      collapsed,
      isMobile,
      logo,
      siteName,
      theme,
      menus: sliderMenus,
      onCollapseChange: this.onCollapseChange,
      onThemeChange: this.onThemeChange
    };

    return (
      <React.Fragment>
        <Layout>
          {isMobile ? (
            <Drawer
              maskClosable
              closable={false}
              onClose={this.onCollapseChange.bind(this, !collapsed)}
              visible={!collapsed}
              placement="left"
              width={200}
              style={{
                padding: 0,
                height: '100vh'
              }}
            >
              <Sider {...siderProps} />
            </Drawer>
          ) : (
            <Sider {...siderProps} />
          )}
          <div
            className="container"
            style={{ paddingTop: fixedHeader ? 72 : 0 }}
            id="primaryLayout"
          >
            <Header {...headerProps} />
            <Layout.Content
              className="content"
              style={{ position: 'relative' }}
            >
              {routerChange && <Loader spinning={true} />}
              {/* <Bread routeList={newRouteList} /> */}
              {children}
            </Layout.Content>
            <BackTop
              className="backTop"
              target={() => document.querySelector('#primaryLayout') as any}
            />
          </div>
        </Layout>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state: any) => ({
  ...state.ui,
  auth: state.auth
});
const mapDispatchToProps = { updateUIValue, loadUIValue };

export default connect(mapStateToProps, mapDispatchToProps)(PrimaryLayout);
