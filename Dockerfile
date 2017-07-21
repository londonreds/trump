FROM node:boron

ENV IS_DOCKER=true

ADD package.json /tmp/package.json
RUN cd /tmp && npm install --production

RUN mkdir -p /usr/src/app
RUN cp -a /tmp/node_modules /usr/src/app/

WORKDIR usr/src/app

ADD . /usr/src/app

RUN npm install --production

EXPOSE 3000

CMD ["npm", "start"]