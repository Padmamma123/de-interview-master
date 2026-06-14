import json
import os
from typing import List

import chromadb
from fastapi import FastAPI, File, UploadFile
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from pydantic import BaseModel


app = FastAPI(title="DE Interview Master RAG Service")

openai_key = os.getenv("OPENAI_API_KEY", "")
embedding_model = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
chat_model = os.getenv("CHAT_MODEL", "gpt-4o-mini")
chroma_host = os.getenv("CHROMA_HOST", "localhost")
chroma_port = int(os.getenv("CHROMA_PORT", "8000"))

embeddings = OpenAIEmbeddings(model=embedding_model, api_key=openai_key)
llm = ChatOpenAI(model=chat_model, api_key=openai_key, temperature=0.3)

chroma_client = chromadb.HttpClient(host=chroma_host, port=chroma_port)
vector_store = Chroma(
    client=chroma_client,
    collection_name="de-interview-knowledge",
    embedding_function=embeddings
)


class GenerateQuestionsRequest(BaseModel):
    topic: str
    difficulty: str
    experienceLevel: str
    questionType: str
    count: int = 20


class ChatRequest(BaseModel):
    userId: str
    question: str
    topic: str = "General"


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/generate-questions")
def generate_questions(req: GenerateQuestionsRequest):
    prompt = f"""
    Generate {req.count} Data Engineering interview questions in JSON array format.
    Topic: {req.topic}
    Difficulty: {req.difficulty}
    Experience: {req.experienceLevel}
    Question Type: {req.questionType}

    Required fields per object:
    id, topic, difficulty, experienceLevel, questionType, question, hints, expectedAnswer,
    commonMistakes, followUpQuestions, realWorldUseCases, references, approachComparisons

    For approachComparisons include:
    - Approach 1: Basic
    - Approach 2: Optimized
    - Approach 3: Enterprise Scale
    - Approach 4: Architect Level
    with cost, complexity, scalability, maintenance trade-offs.
    """
    response = llm.invoke(prompt).content
    try:
        return json.loads(response)
    except Exception:
        return [{
            "id": "fallback-1",
            "topic": req.topic,
            "difficulty": req.difficulty,
            "experienceLevel": req.experienceLevel,
            "questionType": req.questionType,
            "question": "How would you process 1 billion records daily in production?",
            "hints": ["Discuss batch vs streaming", "Talk about fault tolerance"],
            "expectedAnswer": "Compare ETL, Spark, Kafka + streaming, event-driven architecture.",
            "commonMistakes": ["Ignoring partitioning", "No cost analysis"],
            "followUpQuestions": ["How do you monitor SLA breaches?"],
            "realWorldUseCases": ["Large-scale clickstream analytics"],
            "references": ["Spark docs", "Kafka docs"],
            "approachComparisons": [
                "Traditional ETL: low complexity, limited scale",
                "Spark batch: balanced cost and performance",
                "Kafka + Spark streaming: near real-time and scalable",
                "Event-driven architecture: high flexibility, complex ops"
            ]
        }]


@app.post("/chat")
def chat(req: ChatRequest):
    docs = vector_store.similarity_search(req.question, k=4)
    context = "\n\n".join([d.page_content for d in docs]) if docs else "No indexed context available."
    prompt = f"""
    You are a Data Engineering interview coach.
    User topic: {req.topic}
    Question: {req.question}

    Use this context:
    {context}

    Return a practical answer with production considerations and trade-offs.
    """
    answer = llm.invoke(prompt).content
    sources = [d.metadata.get("source", "knowledge_base") for d in docs]
    return {"answer": answer, "sources": sources}


@app.post("/ingest-pdf")
async def ingest_pdf(file: UploadFile = File(...)):
    payload = await file.read()
    temp_path = f"/tmp/{file.filename}"
    with open(temp_path, "wb") as f:
        f.write(payload)

    with open(temp_path, "rb") as f:
        raw = f.read().decode("latin-1", errors="ignore")

    splitter = RecursiveCharacterTextSplitter(chunk_size=1200, chunk_overlap=200)
    chunks: List[str] = splitter.split_text(raw)
    vector_store.add_texts(chunks, metadatas=[{"source": file.filename}] * len(chunks))
    return {"status": "ingested", "chunks": len(chunks)}

