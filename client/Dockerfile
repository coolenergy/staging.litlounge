FROM node:18.14.0

WORKDIR /usr/src/xc/client

COPY package.json package-lock.json ./
RUN npm install

COPY . ./
RUN npm run build

CMD npm run start
