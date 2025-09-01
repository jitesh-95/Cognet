from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.mindmap import router as mindmap_router
from core.logging import setup_logging

setup_logging()

app = FastAPI(title="Mindmap Backend", version="0.1.0")

# CORS - adjust origins in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change to your frontend URL in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(mindmap_router)

@app.get("/")
def root():
    return {"message": "Mindmap backend running 🚀"}
