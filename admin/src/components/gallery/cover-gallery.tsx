import { PureComponent } from 'react';
import { IGallery } from 'src/interfaces';

interface IProps {
  gallery?: IGallery;
  style?: Record<string, string>;
}

export class CoverGallery extends PureComponent<IProps> {
  render() {
    const { coverPhoto } = this.props.gallery;
    const url =
      coverPhoto && coverPhoto.thumbnails && coverPhoto.thumbnails.length > 0
        ? coverPhoto.thumbnails[0]
        : '/gallery.png';
    return <img src={url} style={this.props.style || { width: 90 }} />;
  }
}
