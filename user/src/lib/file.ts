import { getGlobalConfig } from '@services/config';
import { message } from 'antd';
import { RcFile } from 'antd/lib/upload';

function beforeImageUpload(file: RcFile, limitInMb: number): boolean {
  const ext = file.name.split('.').pop().toLowerCase();
  const config = getGlobalConfig();
  const isImageAccept = config.NEXT_PUBLIC_IMAGE_ACCPET
    .split(',')
    .map((item: string) => item.trim())
    .indexOf(`.${ext}`);
  if (isImageAccept === -1) {
    message.error(`You can only upload ${config.NEXT_PUBLIC_IMAGE_ACCPET} file!`);
    return false;
  }
  const isLtLimit = file.size / 1024 / 1024 < limitInMb;
  if (!isLtLimit) {
    message.error(
      `Image must smaller than ${limitInMb}MB!`
    );
    return false;
  }
  return true;
}

export function beforeAvatarUpload(file: RcFile): boolean {
  const config = getGlobalConfig();
  return beforeImageUpload(file, config.NEXT_PUBLIC_MAXIMUM_SIZE_UPLOAD_AVATAR || 2);
}

export function beforeHeaderUpload(file: RcFile): boolean {
  const config = getGlobalConfig();
  return beforeImageUpload(file, config.NEXT_PUBLIC_MAXIMUM_SIZE_UPLOAD_HEADER || 3);
}
