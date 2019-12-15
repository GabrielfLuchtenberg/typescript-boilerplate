FROM node:alpine
WORKDIR /usr/yourapplication-name
COPY package.json .
RUN npm install\
    && npm install tsc -g\
    && npm install -g typescript
COPY . .
RUN tsc
CMD ["node", "./dist/server.js"]
