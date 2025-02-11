#!/bin/bash
cd /maintenance/public_html/api
source venv/bin/activate
gunicorn --config gunicorn_config.py wsgi:app &