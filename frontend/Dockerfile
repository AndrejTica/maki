# --- STAGE 1: Build the application ---
FROM node:18 AS build

WORKDIR /app

COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

# FROM nginx:alpine
#
# COPY nginx.conf /etc/nginx/conf.d/default.conf
#
#
# WORKDIR /usr/share/nginx/html
# COPY --from=build /app/dist .

# Expose port 80 and start Nginx in the foreground
EXPOSE 80
CMD ["npm", "run", "start"]
