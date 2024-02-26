import { PureComponent, Fragment } from 'react';
import { IProductUpdate } from 'src/interfaces';

interface IProps {
  product?: IProductUpdate;
  style?: Record<string, string>;
}

export class ImageProduct extends PureComponent<IProps> {
  render() {
    const { image } = this.props.product;
    const url = image ? image : '/product.png';
    return <img src={url} style={this.props.style || { width: 70 }} />;
  }
}
