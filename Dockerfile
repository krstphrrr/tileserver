# original dockerfile: https://github.com/jawg/docker-mapnik3/blob/master/v3.1/Dockerfile
FROM jawg/mapnik3:latest


# get node
RUN apt-get update && \
    apt-get install curl -y && \ 
    curl -sL https://deb.nodesource.com/setup_16.x | bash && \
    apt-get install nodejs

# install dependencies 
WORKDIR /usr/src


# copying from local context into docker container directory
COPY ./ /usr/src

RUN npm install
RUN npm i mapnik

# exposing port where the node app is listening
EXPOSE 3000

# run app
CMD ["npm", "start"]
