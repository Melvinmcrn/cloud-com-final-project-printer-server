FROM node:14-alpine

# update packages
RUN apk update

# create root application folder
WORKDIR /app

# copy source code to /app/src folder
COPY . /app/

ENV PROJECT_ID="cloud-comp-final-project"
ENV PUBSUB_TOPIC_NAME="paas-post-printing"
ENV PUBSUB_SUBSCRIPTION_NAME="printer-1-subscription"

RUN yarn install

CMD [ "yarn", "start" ]