FROM nginx:stable-alpine

WORKDIR /usr/share/nginx/html
COPY . /usr/share/nginx/html
