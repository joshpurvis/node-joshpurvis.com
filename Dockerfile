FROM ubuntu:14.04

# install apt packages
RUN apt-get update \
    && apt-get install -y curl g++ git make npm \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# install node
RUN npm install -g n
RUN n 0.10.38

# copy application
RUN mkdir -p /src/app
COPY . /src/app
WORKDIR /src/app

# install
RUN npm install

EXPOSE 3000
ENTRYPOINT ["npm", "start"]