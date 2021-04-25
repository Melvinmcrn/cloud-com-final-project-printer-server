FROM node:14-alpine

# update packages
RUN apk update

# create root application folder
WORKDIR /app

# copy source code to /app/src folder
COPY . /app/

# check files list
RUN ls -a

RUN yarn install
RUN yarn compile

CMD [ "node", "./dist/index.js" ]