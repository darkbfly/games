# 使用官方的nginx镜像作为基础镜像
FROM nginx:alpine

# 设置工作目录
WORKDIR /usr/share/nginx/html

# 删除nginx默认的静态文件
RUN rm -rf /usr/share/nginx/html/*

# 复制游戏文件到nginx目录
COPY . /usr/share/nginx/html/

# 创建nginx配置文件以支持SPA路由
RUN echo 'server {' > /etc/nginx/conf.d/default.conf && \
    echo '    listen 80;' >> /etc/nginx/conf.d/default.conf && \
    echo '    server_name localhost;' >> /etc/nginx/conf.d/default.conf && \
    echo '    root /usr/share/nginx/html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    index index.html;' >> /etc/nginx/conf.d/default.conf && \
    echo '' >> /etc/nginx/conf.d/default.conf && \
    echo '    # 启用gzip压缩' >> /etc/nginx/conf.d/default.conf && \
    echo '    gzip on;' >> /etc/nginx/conf.d/default.conf && \
    echo '    gzip_vary on;' >> /etc/nginx/conf.d/default.conf && \
    echo '    gzip_min_length 1024;' >> /etc/nginx/conf.d/default.conf && \
    echo '    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;' >> /etc/nginx/conf.d/default.conf && \
    echo '' >> /etc/nginx/conf.d/default.conf && \
    echo '    # 静态文件缓存' >> /etc/nginx/conf.d/default.conf && \
    echo '    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {' >> /etc/nginx/conf.d/default.conf && \
    echo '        expires 1y;' >> /etc/nginx/conf.d/default.conf && \
    echo '        add_header Cache-Control "public, immutable";' >> /etc/nginx/conf.d/default.conf && \
    echo '    }' >> /etc/nginx/conf.d/default.conf && \
    echo '' >> /etc/nginx/conf.d/default.conf && \
    echo '    # 主页面路由' >> /etc/nginx/conf.d/default.conf && \
    echo '    location / {' >> /etc/nginx/conf.d/default.conf && \
    echo '        try_files $uri $uri/ /index.html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    }' >> /etc/nginx/conf.d/default.conf && \
    echo '' >> /etc/nginx/conf.d/default.conf && \
    echo '    # 安全头部' >> /etc/nginx/conf.d/default.conf && \
    echo '    add_header X-Frame-Options "SAMEORIGIN" always;' >> /etc/nginx/conf.d/default.conf && \
    echo '    add_header X-Content-Type-Options "nosniff" always;' >> /etc/nginx/conf.d/default.conf && \
    echo '    add_header X-XSS-Protection "1; mode=block" always;' >> /etc/nginx/conf.d/default.conf && \
    echo '}' >> /etc/nginx/conf.d/default.conf

# 暴露80端口
EXPOSE 80

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]
