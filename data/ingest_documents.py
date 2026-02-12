
import os
import argparse
import requests
from pathlib import Path

def ingest_documents(directory: str, api_url: str):
    """
    Ingests all PDF documents from the specified directory into the vector database
    via the API.
    """
    directory_path = Path(directory)
    if not directory_path.exists():
        print(f"Error: Directory '{directory}' does not exist.")
        return

    files = list(directory_path.glob("*.pdf"))
    if not files:
        print(f"No PDF files found in '{directory}'.")
        return

    print(f"Found {len(files)} PDF file(s) in '{directory}'.")

    success_count = 0
    failure_count = 0

    # Get existing documents to avoid duplicates
    existing_files = set()
    try:
        response = requests.get(f"{api_url}/documents")
        if response.status_code == 200:
            data = response.json()
            for doc in data.get("documents", []):
                existing_files.add(doc.get("filename"))
            print(f"Index contains {len(existing_files)} existing documents.")
        else:
            print(f"Warning: Could not fetch existing documents (Status: {response.status_code})")
    except Exception as e:
        print(f"Warning: Could not connect to API to check existing documents: {e}")

    for file_path in files:
        if file_path.name in existing_files:
            print(f"Skipping '{file_path.name}' (already exists).")
            continue

        print(f"Uploading '{file_path.name}'...", end=" ", flush=True)
        try:
            with open(file_path, "rb") as f:
                response = requests.post(
                    f"{api_url}/add_document",
                    files={"file": (file_path.name, f, "application/pdf")}
                )
            
            if response.status_code == 200:
                print("Success.")
                success_count += 1
            else:
                print(f"Failed. Status code: {response.status_code}")
                # print(f"Response: {response.text}")
                failure_count += 1
        except Exception as e:
            print(f"Error: {e}")
            failure_count += 1

    print("-" * 30)
    print(f"Ingestion complete.")
    print(f"Successfully added: {success_count}")
    print(f"Failed: {failure_count}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingest PDF documents into the vector database.")
    parser.add_argument("--directory", "-d", required=True, help="Directory containing PDF files")
    parser.add_argument("--api-url", default="http://localhost:8001", help="URL of the Vector DB API (default: http://localhost:8001)")
    
    args = parser.parse_args()
    
    ingest_documents(args.directory, args.api_url)
