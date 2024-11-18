#!/bin/bash

# Ensure .env exists inside the container
if [ ! -f /var/www/html/.env ]; then
    echo "Creating .env file from .env.example"
    cp /var/www/html/.env.example /var/www/html/.env
fi

# Check if APP_KEY is set; if not, generate it
if ! grep -q "APP_KEY=" /var/www/html/.env || [ -z "$(grep 'APP_KEY=' /var/www/html/.env | cut -d '=' -f 2)" ]; then
    echo "APP_KEY not found or empty. Generating key..."
    php artisan key:generate --no-interaction --force
else
    echo "APP_KEY already set in .env"
fi

# Ensure the SQLite database file exists
if [ ! -f /var/www/html/database/database.sqlite ]; then
    echo "Creating SQLite database file"
    touch /var/www/html/database/database.sqlite
    echo "SQLite database file created at /var/www/html/database/database.sqlite"
fi

# Run database migrations
echo "Running migrations..."
php artisan migrate --force

# Continue with the default container command
exec "$@"
