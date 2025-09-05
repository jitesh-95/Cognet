# backend/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from core.logging import setup_logging
from routes.url_validation import router as url_validation_router
from routes.mindmap import router as mindmap_router

setup_logging()

app = FastAPI(title="Cognet Backend", version="0.1.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
@app.get("/api")
def root():
    return {"message": "Cognet is running! 🔥"}

app.include_router(url_validation_router, prefix='/api')
app.include_router(mindmap_router, prefix='/api')
