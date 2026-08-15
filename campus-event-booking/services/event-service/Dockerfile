FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY src ./src
RUN mkdir -p uploads
EXPOSE 4002
CMD ["npm", "start"]
