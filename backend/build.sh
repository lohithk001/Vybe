#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "==> Installing production requirements..."
pip install --upgrade pip
pip install -r requirements/production.txt

echo "==> Collecting static assets..."
python manage.py collectstatic --no-input

echo "==> Applying database migrations..."
python manage.py migrate --no-input

echo "==> Render build finished successfully!"
