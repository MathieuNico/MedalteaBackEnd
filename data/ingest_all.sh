#!/bin/bash

# Wait for the API to be potentially ready (a simple sleep or loop check is better handled by healthchecks in docker-compose, 
# but we can add a small retry loop here just in case)

API_URL="${VECTOR_DB_API_URL:-http://vector_db_api:8001}"

echo "Starting data ingestion to $API_URL..."

# Install requests if not present (assuming we are in a slim python image)
if ! python3 -c "import requests" &> /dev/null; then
    echo "Installing requests library..."
    pip install requests
fi

echo "Ingesting Books from data/books..."
python3 /app/data/ingest_documents.py --directory /app/data/books --api-url "$API_URL"

echo "Ingesting Praticiens..."
# Find the praticiens CSV dynamically or use hardcoded path based on exploration
PRATICIENS_FILE=$(find /app/data/praticiens -name "*.csv" | head -n 1)
if [ -n "$PRATICIENS_FILE" ]; then
    python3 /app/data/ingest_praticiens.py --file "$PRATICIENS_FILE" --api-url "$API_URL"
else
    echo "No praticiens CSV found."
fi

echo "Ingesting Products..."
PRODUCTS_FILE=$(find /app/data/products -name "*.csv" | head -n 1)
if [ -n "$PRODUCTS_FILE" ]; then
    python3 /app/data/ingest_products.py --file "$PRODUCTS_FILE" --api-url "$API_URL"
else
    echo "No products CSV found."
fi

echo "Data ingestion process finished."
