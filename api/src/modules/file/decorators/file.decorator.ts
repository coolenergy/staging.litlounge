import { createParamDecorator } from '@nestjs/common';

export const FileUploaded = createParamDecorator((data, req) => {
  const file = req.file || req.args[0].file;
  return file;
});

export const FilesUploaded = createParamDecorator((data, req) => {
  const files = req.files || req.args[0].files;
  return files;
});
