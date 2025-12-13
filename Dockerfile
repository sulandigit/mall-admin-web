# 使用官方Node.js镜像作为基础镜像
FROM node:14-alpine

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制项目文件
COPY . .

# 暴露端口(默认webpack-dev-server使用8080端口)
EXPOSE 8080

# 启动开发服务器
CMD ["npm", "run", "dev"]