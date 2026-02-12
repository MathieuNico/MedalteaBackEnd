
import os
import argparse
import requests
from pathlib import Path

def ingest_file(file_path: str, api_url: str):
    """
    Ingests a single file into the vector database via the API.
    """
    path = Path(file_path)
    if not path.exists():
        print(f"Error: File '{file_path}' does not exist.")
        return

    print(f"Checking if '{path.name}' already exists...", end=" ", flush=True)
    try:
        response = requests.get(f"{api_url}/documents")
        if response.status_code == 200:
            data = response.json()
            existing_files = {doc.get("filename") for doc in data.get("documents", [])}
            if path.name in existing_files:
                print(f"Skipping (already exists).")
                return
        else:
            print(f"Warning: Could not fetch documents (Status: {response.status_code}). Proceeding with upload...")
    except Exception as e:
        print(f"Warning: Connection error ({e}). Proceeding with upload...")

    print(f"Uploading '{path.name}'...", end=" ", flush=True)
    try:
        with open(path, "rb") as f:
            response = requests.post(
                f"{api_url}/add_document",
                files={"file": (path.name, f, "text/csv")}
            )
        
        if response.status_code == 200:
            print("Success.")
            print(f"Response: {response.json()}")
        else:
            print(f"Failed. Status code: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingest products CSV into the vector database.")
    # Default to the specific file requested
    default_path = "/Users/leohoareau/Documents/perso/projects/Medaltea/data/products/biocoop_produits.csv"
    parser.add_argument("--file", "-f", default=default_path, help=f"Path to the file to ingest (default: {default_path})")
    parser.add_argument("--api-url", default="http://localhost:8001", help="URL of the Vector DB API (default: http://localhost:8001)")
    
    args = parser.parse_args()
    
    ingest_file(args.file, args.api_url)
