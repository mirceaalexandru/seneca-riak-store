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
COPY test/docker-options.json test/default-options.json
COPY docker/script.sh script.sh
RUN chmod a+x script.sh

#############################################
# Install dependencies
#############################################
RUN npm install


ENTRYPOINT /opt/app/script.sh
