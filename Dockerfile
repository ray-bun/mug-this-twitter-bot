FROM node:16

# Working dir

WORKDIR /usr/app

COPY package*.json ./

RUN npm install

# Copy source files
COPY . .

RUN npx prisma generate

RUN npm run build
COPY .env ./dist/
WORKDIR ./dist

CMD node index.js