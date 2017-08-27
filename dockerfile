# Base docker image
FROM ubuntu:16.04

## PART 1: Core components
## =======================

# Install utilities
RUN apt-get update --fix-missing && apt-get -y upgrade &&\
apt-get install -y sudo curl wget unzip git

# Install node 7 Using Ubuntu
RUN curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash - &&\
sudo apt-get install -y nodejs

# dependencies for node-gyp which is needed for nsqjs module
# build base includes g++ and gcc and Make
RUN sudo apt-get install -y python build-essential 

## PART 2: TrackinOps
## ==================

# # Download TrackinOps from git source.
# RUN git clone https://github.com/darvydas/trackinops-results /usr/src/app/trackinops-results &&\
# cd /usr/src/app/trackinops-results 
# &&\
# git checkout tags/v0.1 &&\
# npm install

# Build TrackinOps from source locally.
COPY . /usr/src/app/trackinops-results
RUN mkdir -p /usr/src/app/trackinops-results

# Copy configuration file from local source
COPY ./configuration.js /usr/src/app/trackinops-results/configuration.js

# Set up Working Directory
WORKDIR /usr/src/app/trackinops-results
RUN npm install

## PART 3: Final run
## ===================

CMD NODE_ENV=production node --max_old_space_size=4096 index.js