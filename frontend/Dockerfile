# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG VITE_API_URL=http://localhost:3000/api
ARG VITE_SANITY_PROJECT_ID
ARG VITE_SANITY_DATASET=production
ARG VITE_SANITY_TOKEN
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SANITY_PROJECT_ID=$VITE_SANITY_PROJECT_ID
ENV VITE_SANITY_DATASET=$VITE_SANITY_DATASET
ENV VITE_SANITY_TOKEN=$VITE_SANITY_TOKEN

RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
