import { PureComponent } from 'react';
import { IPhotoUpdate } from 'src/interfaces';

interface IProps {
  photo?: IPhotoUpdate;
  style?: Record<string, string>;
}

export class ThumbnailPhoto extends PureComponent<IProps> {
  render() {
    const { photo } = this.props.photo;
    const urlThumb =
      photo && photo.thumbnails && photo.thumbnails.length > 0
        ? photo.thumbnails[0]
        : '/camera.png';
    return <img src={urlThumb} style={this.props.style || { width: 90 }} />;
  }
}
