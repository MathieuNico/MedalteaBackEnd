"""
Vector Database API with FastAPI and LangChain.
Provides similarity search and document management for PGVector.
"""

from contextlib import asynccontextmanager
from typing import Any, Dict, List
import os
import tempfile
from pathlib import Path

from fastapi import FastAPI, HTTPException, UploadFile, File
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings
from langchain_postgres import PGVector
from langchain_community.document_loaders import TextLoader, PyPDFLoader, CSVLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pydantic import BaseModel
import psycopg
from sqlalchemy import create_engine

from .config import config, logger

class SearchRequest(BaseModel):
    """Similarity search request."""
    query: str
    k: int = 3


class RemoveDocumentRequest(BaseModel):
    """Document removal request."""
    source: str
    filename: str


# Global app state
app_state: Dict[str, Any] = {}


def _load_document_from_file(file_path: str, filename: str) -> List[Document]:
    """Load document from file (txt, md, pdf, csv)."""
    file_ext = Path(file_path).suffix.lower()

    try:
        if file_ext in ['.txt', '.md']:
            loader = TextLoader(file_path, encoding='utf-8')
            docs = loader.load()
        elif file_ext == '.pdf':
            loader = PyPDFLoader(file_path)
            docs = loader.load()
        elif file_ext == '.csv':
            # Use CSVLoader. source_column can be useful if one column is the "key", 
            # effectively each row becomes a document.
            # Default behavior: each row is a document, content is all columns formatted as key: value
            loader = CSVLoader(file_path, encoding='utf-8') 
            docs = loader.load()
        else:
            raise ValueError(f"Unsupported file type: {file_ext}")

        for doc in docs:
            doc.metadata.update({
                "source": "uploaded",
                "filename": filename,
                "file_type": file_ext.lstrip('.')
            })

        return docs

    except Exception as e:
        logger.error(f"Error loading file {filename}: {e}")
        raise


def _split_documents(documents: List[Document]) -> List[Document]:
    """Split documents into chunks."""
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        add_start_index=True,
    )
    return text_splitter.split_documents(documents)


def _remove_documents_from_db(source: str, filename: str) -> bool:
    """Remove documents from vector DB."""
    try:
        if not config.connection_string_pgvector:
            raise ValueError("PGVector connection not configured")

        psycopg_connection_string = _convert_sqlalchemy_to_psycopg_connection_string(
            config.connection_string_pgvector
        )

        with psycopg.connect(psycopg_connection_string) as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    DELETE FROM langchain_pg_embedding
                    WHERE (cmetadata->>'source' = %s AND cmetadata->>'filename' = %s)
                       OR (collection_id IN (
                           SELECT uuid FROM langchain_pg_collection WHERE name = %s
                       ) AND cmetadata->>'filename' = %s)
                    """,
                    (source, filename, config.collection_name, filename)
                )
                
                deleted_count = cur.rowcount
                conn.commit()

                if deleted_count > 0:
                    logger.info(f"✓ Deleted {deleted_count} chunks: {filename}")
                    return True
                else:
                    logger.warning(f"No documents found: {filename}")
                    return False

    except psycopg.Error as e:
        logger.error(f"Database error removing documents: {e}")
        raise


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage app startup and shutdown."""
    try:
        logger.info("Starting Vector DB API...")
        logger.info(f"Initializing embeddings: {config.embedding_model}")
        app_state["embeddings"] = OpenAIEmbeddings(model=config.embedding_model)

        logger.info(f"Connecting to PGVector (collection: {config.collection_name})")
        if not config.connection_string_pgvector:
            raise ValueError("PGVector connection string not configured")
        
        # Create SQLAlchemy engine from connection string
        engine = _get_sqlalchemy_engine(config.connection_string_pgvector)
        
        app_state["vector_store"] = PGVector(
            embeddings=app_state["embeddings"],
            collection_name=config.collection_name,
            connection=engine,
        )
        logger.info("✓ PGVector connection established")
        yield
    except Exception as e:
        logger.error(f"Fatal error during startup: {e}")
        raise
    finally:
        logger.info("Shutting down Vector DB API...")


app = FastAPI(
    title="Vector Database RAG API",
    description="API for adding and searching documents in PGVector",
    lifespan=lifespan,
)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "vector_store_initialized": "vector_store" in app_state}


@app.post("/search")
async def search_documents(request: SearchRequest):
    """Search for similar documents."""
    try:
        vector_store: PGVector = app_state["vector_store"]
        logger.info(f"Searching: '{request.query}' (k={request.k})")
        retrieved_docs = vector_store.similarity_search(request.query, k=request.k)

        results = [
            {"page_content": doc.page_content, "metadata": doc.metadata}
            for doc in retrieved_docs
        ]

        logger.info(f"✓ {len(results)} documents found.")
        return {"status": "success", "results": results}

    except Exception as e:
        logger.error(f"Error during search: {e}")
        raise HTTPException(status_code=500, detail=str(e))


def _convert_sqlalchemy_to_psycopg_connection_string(connection_string: str) -> str:
    """Convert SQLAlchemy connection string to psycopg format."""
    if connection_string.startswith("postgresql+psycopg://"):
        return connection_string.replace("postgresql+psycopg://", "postgresql://")
    return connection_string


def _get_sqlalchemy_engine(connection_string: str):
    """Create SQLAlchemy engine from connection string."""
    return create_engine(connection_string)


@app.get("/documents")
async def get_documents_info():
    """Get document information from vector database."""
    try:
        if not config.connection_string_pgvector:
            raise HTTPException(
                status_code=500,
                detail="PGVector connection not configured"
            )

        psycopg_connection_string = _convert_sqlalchemy_to_psycopg_connection_string(
            config.connection_string_pgvector
        )

        with psycopg.connect(psycopg_connection_string) as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT COUNT(*) as total_chunks
                    FROM langchain_pg_embedding
                    WHERE cmetadata->>'collection_name' = %s OR collection_id IN (
                        SELECT uuid FROM langchain_pg_collection WHERE name = %s
                    )
                    """,
                    (config.collection_name, config.collection_name)
                )
                total_chunks_result = cur.fetchone()
                total_chunks = total_chunks_result[0] if total_chunks_result else 0

                cur.execute(
                    """
                    SELECT 
                        cmetadata->>'source' as source,
                        cmetadata->>'filename' as filename,
                        cmetadata->>'file_type' as file_type,
                        COUNT(*) as chunks_count
                    FROM langchain_pg_embedding
                    WHERE cmetadata->>'collection_name' = %s OR collection_id IN (
                        SELECT uuid FROM langchain_pg_collection WHERE name = %s
                    )
                    GROUP BY cmetadata->>'source', cmetadata->>'filename', cmetadata->>'file_type'
                    ORDER BY cmetadata->>'filename' ASC
                    """,
                    (config.collection_name, config.collection_name)
                )
                
                documents_data = cur.fetchall()
                documents_info = []
                for source, filename, file_type, chunks_count in documents_data:
                    documents_info.append({
                        'source': source or 'Unknown',
                        'filename': filename or source or 'Unknown',
                        'file_type': file_type or 'unknown',
                        'chunks_count': chunks_count
                    })

                return {
                    "status": "success",
                    "total_chunks": total_chunks,
                    "total_documents": len(documents_info),
                    "documents": documents_info
                }

    except psycopg.Error as e:
        logger.error(f"Database error retrieving document information: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        logger.error(f"Error retrieving document information: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/add_document")
async def add_document(file: UploadFile = File(...)):
    """Add document to vector database."""
    try:
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")

        file_ext = Path(file.filename).suffix.lower()
        if file_ext not in ['.txt', '.md', '.pdf', '.csv']:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type: {file_ext}. Supported: .txt, .md, .pdf, .csv"
            )

        vector_store: PGVector = app_state["vector_store"]
        embeddings: OpenAIEmbeddings = app_state["embeddings"]

        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_file_path = tmp_file.name

        try:
            logger.info(f"Processing file: {file.filename}")
            documents = _load_document_from_file(tmp_file_path, file.filename)

            if not documents:
                raise HTTPException(status_code=400, detail="File is empty or could not be read")

            logger.info(f"Loaded {len(documents)} document(s)")

            chunks = _split_documents(documents)
            logger.info(f"Split into {len(chunks)} chunks")

            # Add documents in batches to avoid huge transactions
            batch_size = 1000
            total_added = 0
            
            for i in range(0, len(chunks), batch_size):
                batch = chunks[i:i + batch_size]
                logger.info(f"Adding batch {i//batch_size + 1}/{len(chunks)//batch_size + 1} ({len(batch)} chunks)")
                # Run synchronous add_documents in a thread pool to avoid blocking the event loop
                from starlette.concurrency import run_in_threadpool
                ids = await run_in_threadpool(vector_store.add_documents, documents=batch)
                total_added += len(ids)

            logger.info(f"✓ Added {total_added} chunks: {file.filename}")

            return {
                "status": "success",
                "filename": file.filename,
                "file_type": file_ext.lstrip('.'),
                "chunks_added": total_added,
                "message": f"Successfully added {file.filename} ({total_added} chunks)"
            }

        finally:
            if os.path.exists(tmp_file_path):
                os.remove(tmp_file_path)

    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error adding document: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")


@app.post("/remove_document")
async def remove_document(request: RemoveDocumentRequest):
    """Remove document from vector database."""
    try:
        logger.info(f"Removing document: {request.filename} (source: {request.source})")

        # Remove from database
        removed = _remove_documents_from_db(request.source, request.filename)

        if removed:
            return {
                "status": "success",
                "filename": request.filename,
                "message": f"Successfully removed {request.filename} from knowledge base"
            }
        else:
            raise HTTPException(
                status_code=404,
                detail=f"Document not found: {request.filename}"
            )

    except HTTPException:
        raise
    except psycopg.Error as e:
        logger.error(f"Database error removing document: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        logger.error(f"Error removing document: {e}")
        raise HTTPException(status_code=500, detail=str(e))
