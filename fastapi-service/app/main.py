from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from uuid import uuid4
from datetime import datetime
import logging
from loguru import logger
import os

from .config import settings
from .models.research import ResearchRequest, ResearchResponse, ErrorResponse
from .auth.utils import verify_token

app = FastAPI(
    title="Research API",
    description="API for performing deep research queries",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Verify environment variables
@app.on_event("startup")
async def verify_env():
    required_vars = [
        "FIRECRAWL_KEY",
        "OPENAI_KEY",
        "API_TOKEN",
        "SECRET_KEY"
    ]
    for var in required_vars:
        if not os.getenv(var):
            logger.error(f"Missing environment variable: {var}")
            raise RuntimeError(f"Missing required environment variable: {var}")

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            detail=str(exc.detail),
            status_code=exc.status_code
        ).dict()
    )

@app.get("/")
async def root():
    return {"status": "healthy"}

@app.post("/research", 
         response_model=ResearchResponse,
         tags=["Research"],
         dependencies=[Depends(verify_token)])
async def perform_research(request: ResearchRequest):
    logger.info(f"Received research request: {request}")
    
    try:
        # Validate request
        if not request.query:
            raise HTTPException(status_code=400, detail="Query cannot be empty")
            
        # Generate response
        request_id = str(uuid4())
        current_time = datetime.utcnow()
        
        response = ResearchResponse(
            id=request_id,
            query=request.query,
            breadth=request.breadth or 4,
            depth=request.depth or 2,
            status="processing",
            created_at=current_time,
            updated_at=current_time
        )
        
        logger.info(f"Generated response: {response}")
        return response
        
    except Exception as e:
        logger.exception("Error processing research request")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)