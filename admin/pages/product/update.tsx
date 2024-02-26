import Head from 'next/head';
import { PureComponent, Fragment } from 'react';
import Page from '@components/common/layout/page';
import { message } from 'antd';
import { productService } from '@services/product.service';
import { IProductUpdate } from 'src/interfaces';
import Loader from '@components/common/base/loader';
import { BreadcrumbComponent } from '@components/common';
import { FormProduct } from '@components/product/form-product';
interface IProps {
  id: string;
}

interface IFiles {
  fieldname: string;
  file: File;
}

class ProductUpdate extends PureComponent<IProps> {
  state = {
    submitting: false,
    fetching: true,
    product: {} as IProductUpdate,
    uploadPercentage: 0
  };

  static async getInitialProps({ ctx }) {
    return ctx.query;
  }

  async componentDidMount() {
    try {
      const resp = await productService.findById(this.props.id);
      this.setState({ product: resp.data });
    } catch (e) {
      message.error('Product not found!');
    } finally {
      this.setState({ fetching: false });
    }
  }

  _files: {
    image: File;
    digitalFile: File;
  } = {
    image: null,
    digitalFile: null
  };

  beforeUpload(file: File, field: string) {
    this._files[field] = file;
  }

  onUploading(resp: any) {
    if (this._files['image'] || this._files['digitalFile']) {
      this.setState({ uploadPercentage: resp.percentage });
    }
  }

  async submit(data: any) {
    try {
      const files = Object.keys(this._files).reduce((files, key) => {
        if (this._files[key]) {
          files.push({
            fieldname: key,
            file: this._files[key] || null
          });
        }
        return files;
      }, [] as IFiles[]) as [IFiles];

      this.setState({ submitting: true });

      const submitData = {
        ...data
      };
      await productService.update(
        this.props.id,
        files,
        submitData,
        this.onUploading.bind(this)
      );
      message.success('Updated successfully');
      this.setState({ submitting: false });
    } catch (e) {
      // TODO - check and show error here
      message.error('Something went wrong, please try again!');
      this.setState({ submitting: false });
    }
  }

  render() {
    const { product, submitting, fetching, uploadPercentage } = this.state;
    return (
      <Fragment>
        <Head>
          <title>Update Product</title>
        </Head>
        <BreadcrumbComponent
          breadcrumbs={[
            { title: 'Product', href: '/product' },
            { title: product.name ? product.name : 'Detail product' },
            { title: 'Update' }
          ]}
        />
        <Page>
          {fetching ? (
            <Loader />
          ) : (
            <FormProduct
              product={product}
              submit={this.submit.bind(this)}
              uploading={submitting}
              beforeUpload={this.beforeUpload.bind(this)}
              uploadPercentage={uploadPercentage}
            />
          )}
        </Page>
      </Fragment>
    );
  }
}

export default ProductUpdate;
