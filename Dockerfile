From node:alpine as builder

WORKDIR "/app"

COPY package*.json ./

RUN npm i

COPY ./ ./

RUN ["npm","run","prisma" ]

CMD ["npm","start"]