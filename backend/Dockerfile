# Use Ubuntu 22.04 as the base image
FROM ubuntu:22.04

# Set environment variables to prevent prompts during installation
ENV DEBIAN_FRONTEND=noninteractive

# Update package list and install necessary packages
RUN apt-get update && apt-get install -y \
    software-properties-common \
    curl \
    git \
    unzip \
    nginx \
    zip \
    libzip-dev \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libcurl4-openssl-dev \
    libssl-dev \
    libsqlite3-dev \
    && apt-get clean

# Install PHP 8.2 and necessary PHP extensions
RUN add-apt-repository ppa:ondrej/php && \
    apt-get update && apt-get install -y \
    php8.2 \
    php8.2-fpm \
    php8.2-cli \
    php8.2-mysql \
    php8.2-xml \
    php8.2-mbstring \
    php8.2-curl \
    php8.2-zip \
    php8.2-bcmath \
    php8.2-tokenizer \
    php8.2-opcache \
    php8.2-sqlite3 \
    php8.2-pdo \
    && apt-get clean

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Set working directory for Laravel application
WORKDIR /var/www/html

# Copy application code
COPY . .

# Install dependencies
RUN composer install --optimize-autoloader --no-interaction

# Set permissions for Laravel storage and cache
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache && \
    chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Copy the entrypoint script
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Set the entrypoint script
ENTRYPOINT ["sh", "/usr/local/bin/entrypoint.sh"]

# Expose the default Laravel port
EXPOSE 8000

# Start PHP-FPM and Laravel server
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
