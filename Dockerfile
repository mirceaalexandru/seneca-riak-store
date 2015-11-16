############################################################
# Dockerfile to build seneca-riak test container
# Based on Node image
############################################################

FROM node

MAINTAINER Mircea Alexandru <mircea.alexandru@gmail.com>

ENV DEBIAN_FRONTEND noninteractive

#############################################
##  Clone store
#############################################

WORKDIR /opt/app
COPY package.json package.json
COPY riak-store.js riak-store.js
COPY .eslintrc .eslintrc
COPY test test
COPY lib lib

#############################################
# Install dependencies
#############################################
RUN npm install


ENTRYPOINT npm run test
