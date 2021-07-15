FROM jawg/mapnik3:latest

EXPOSE 3000
# get node
RUN apt-get update && \
    apt-get install curl -y && \ 
    curl -sL https://deb.nodesource.com/setup_16.x | bash && \
    apt-get install nodejs

# get app directory 
RUN mkdir /usr/src/app
COPY ./ /usr/src

# install dependencies 
WORKDIR /usr/src
RUN npm install
RUN npm i mapnik
RUN npm i @mapbox/geojson-mapnikify
# run app

CMD ["npm", "start"]
