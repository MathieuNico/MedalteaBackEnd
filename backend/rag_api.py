"""
RAG API using FastAPI.
Provides chat endpoint with vector similarity search, history management.
"""

import asyncio
import time
import json
import logging
import os
from contextlib import asynccontextmanager
from typing import Any, Dict, List, Optional

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage, BaseMessage
from pydantic import BaseModel, Field

load_dotenv()

# On suppose que config.py est dans le même dossier
from .config import config, logger

# --- Data Models ---

class ChatRequest(BaseModel):
    """Chat request with message and history."""
    message: str
    # Format: [["user message", "bot response"], ...]
    history: List[List[str]] = [] 

class RetrievedDoc(BaseModel):
    """Document retrieved from vector database."""
    page_content: str
    metadata: Dict[str, Any]

# --- Global State ---
app_state: Dict[str, Any] = {}

def build_system_prompt(retrieved_docs: List[RetrievedDoc]) -> str:
    """
    Génère le prompt système optimisé pour Medaltea avec le contexte RAG injecté.
    
    Args:
        docs_content (str): Le contenu récupéré via RAG.
        
    Returns:
        str: Le prompt formaté.
    """
    # Formatage du contenu RAG
    if retrieved_docs:
        docs_content = "\n\n".join([f"Source: {d.metadata.get('source', 'Doc')}\nContenu: {d.page_content}" for d in retrieved_docs])
    else:
        docs_content = "Aucune documentation spécifique trouvée pour cette requête."

    return f"""Tu es Medaltea, l'assistant expert en médecines douces (Naturopathie, MTC, Phytothérapie).
Ta mission : Démocratiser la santé naturelle avec bienveillance, concision et empathie.

### DONNÉES D'ENTRÉE (CONTEXTE RAG)
<context>
{docs_content}
</context>

### PROTOCOLE DE SÉCURITÉ (Priorité Absolue)
Avant toute chose, analyse la demande :
- Si urgence vitale (douleur poitrine, souffle court, malaise grave) : Réponds UNIQUEMENT : "STOP. Cela ressemble à une urgence. Appelle immédiatement le 15 ou rends-toi aux urgences. Je ne suis pas médecin."
- Rappel constant : Tu ne poses pas de diagnostic médical.

### RÈGLES DE FORMATAGE (Strictes)
1.  **Langue :** Français uniquement.
2.  **Style "Plain Text" :** - AUCUN formatage Markdown (pas de gras `**`, pas d'italique `*`, pas de titres `#`).
    - Utilise des tirets simples (-) pour les listes.
    - AUCUN émoji.
3.  **Fidélité :** Réponds UNIQUEMENT basé sur les informations présentes dans les balises <context>. Si l'info n'y est pas, dis : "Je n'ai pas cette information dans mes fiches actuelles."

### PROCESSUS DE RÉPONSE
Construis ta réponse en suivant scrupuleusement ces 4 étapes :

ÉTAPE 1 : EMPATHIE & CAUSE
- Valide le ressenti de l'utilisateur.
- Si le <context> l'explique, mentionne la cause selon l'approche holistique en 1 phrase simple.

ÉTAPE 2 : CONSEILS PRATIQUES
- Liste les conseils d'hygiène de vie ou alimentaires trouvés dans le <context>.
- Utilise des tirets (-) pour lister les points.
- Sois concis.

ÉTAPE 3 : LE PRODUIT BIOCOOP (Optionnel)
- VERIFICATION : Cherche dans le <context> un produit spécifique vendu chez Biocoop lié au conseil.
- SI TROUVÉ : Ajoute la phrase exacte : "Pour t'aider, tu peux utiliser [Nom du Produit](URL) disponible chez Biocoop."
- SI NON TROUVÉ : Ne dis rien pour cette étape.

ÉTAPE 4 : L'EXPERT (Optionnel)
- VERIFICATION : Cherche dans le <context> une recommandation de praticien localisé.
- CAS A (Praticien trouvé) : Écris "Pour un suivi complet, je te suggère [Nom], [Spécialité] à [Adresse]."
- CAS B (Besoin expert mentionné mais pas de lieu) : Écris "Veux-tu que je cherche un spécialiste près de chez toi ? Si oui, dis-moi dans quelle ville tu es."

---
Génère maintenant ta réponse en appliquant ces directives à la lettre."""

def _format_history(history: List[List[str]]) -> List[BaseMessage]:
    """Convertit l'historique brut (list of lists) en objets LangChain Message."""
    messages = []
    for turn in history:
        if len(turn) >= 2:
            user_msg, bot_msg = turn[0], turn[1]
            if user_msg:
                messages.append(HumanMessage(content=user_msg))
            if bot_msg:
                messages.append(AIMessage(content=bot_msg))
    return messages

# --- Lifecycle & Main Endpoint ---

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        logger.info("Starting RAG API...")
        # Initialisation du modèle Groq
        app_state["model"] = ChatGroq(
            model=config.chat_model,
            temperature=1,
            max_tokens=8192,
        )
        
        # Client HTTP pour la Vector DB (si séparée)
        app_state["http_client"] = httpx.AsyncClient(base_url=config.vector_db_api_url)
        yield
    finally:
        if "http_client" in app_state:
            await app_state["http_client"].aclose()

app = FastAPI(lifespan=lifespan)

async def stream_chat_response(request: ChatRequest):
    """
    Gère le flux de conversation : Retrieval -> Prompt -> LLM -> Response
    """
    client: httpx.AsyncClient = app_state["http_client"]
    model = app_state["model"]
    
    # 1. Retrieval (Recherche de documents)
    try:
        # On cherche dans la base vectorielle
        search_res = await client.post("/search", json={"query": request.message, "k": 3})
        docs = [RetrievedDoc(**d) for d in search_res.json().get("results", [])]
    except Exception as e:
        logger.warning(f"Retrieval failed (ignoring for chat): {e}")
        docs = []

    # 2. Préparation des Messages
    system_prompt = build_system_prompt(docs)
    messages = [SystemMessage(content=system_prompt)]
    
    # Ajout de l'historique pour la mémoire contextuelle
    messages.extend(_format_history(request.history))
    
    # Ajout du message utilisateur actuel
    messages.append(HumanMessage(content=request.message))

    # 3. Invocation du Modèle
    # Plus besoin de bind_tools ni de boucle complexe car on a retiré le function calling
    
    response = await model.ainvoke(messages)
    
    # 4. Envoi de la réponse
    if response.content:
        yield response.content

@app.post("/chat")
async def chat(request: ChatRequest):
    return StreamingResponse(stream_chat_response(request), media_type="text/plain")

@app.get("/health")
async def health():
    return {"status": "ok"}