/* eslint-disable import/first */
// global config for temmplates dir
process.env.TEMPLATE_DIR = `${__dirname}/templates`;

require('dotenv').config();

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { renderFile } from './kernel/helpers/view.helper';
import { HttpExceptionLogFilter } from './kernel/logger/http-exception-log.filter';
import { RedisIoAdapter } from './modules/socket/redis-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const httpAdapter = app.getHttpAdapter();
  // TODO - config for domain
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionLogFilter(httpAdapter));
  app.engine('html', renderFile);
  app.set('view engine', 'html');
  app.useWebSocketAdapter(new RedisIoAdapter(app));
  app.disable('x-powered-by');

  // generate api docs
  const options = new DocumentBuilder()
    .setTitle('API docs')
    .setDescription('The API docs')
    .setVersion('1.0')
    .addTag('api')
    .addSecurity('authorization', { name: 'JWT Web Token', type: 'apiKey', in: 'header' })
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('apidocs', app, document);

  await app.listen(process.env.HTTP_PORT);
  // eslint-disable-next-line no-console
  console.log(`Application is running on: http://localhost:${process.env.HTTP_PORT}`);
}
bootstrap();
