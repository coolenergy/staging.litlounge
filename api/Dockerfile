FROM node:12

# Change version of global Yarn installation
# See: https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md#upgradingdowngrading-yarn
ENV YARN_VERSION 1.16.0
RUN curl -fSLO --compressed "https://yarnpkg.com/downloads/$YARN_VERSION/yarn-v$YARN_VERSION.tar.gz" \
    && tar -xzf yarn-v$YARN_VERSION.tar.gz -C /opt/ \
    && ln -snf /opt/yarn-v$YARN_VERSION/bin/yarn /usr/local/bin/yarn \
    && ln -snf /opt/yarn-v$YARN_VERSION/bin/yarnpkg /usr/local/bin/yarnpkg \
    && rm yarn-v$YARN_VERSION.tar.gz

RUN apt-get update
RUN apt-get --yes install ffmpeg

WORKDIR /usr/src/xc/api

COPY package.json yarn.lock ./
RUN yarn

COPY . ./
RUN yarn build

CMD yarn migrate && yarn start:prod
