import { PureComponent, Fragment } from 'react';
import { IVideoUpdate } from 'src/interfaces';

interface IProps {
  video?: IVideoUpdate;
  style?: Record<string, string>;
}

export class ThumbnailVideo extends PureComponent<IProps> {
  render() {
    const { thumbnail, video } = this.props.video;
    const url = thumbnail
      ? thumbnail
      : video && video.thumbnails && video.thumbnails.length > 0
      ? video.thumbnails[0]
      : '/video.png';
    return <img src={url} style={this.props.style || { width: 90 }} />;
  }
}
