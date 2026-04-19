from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import create_tables
from app.routers import scan, stack, chemical, drug


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_tables()
    yield


app = FastAPI(
    title="VEDA API",
    description="Scan anything. Know if it's safe. In your language.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scan.router)
app.include_router(stack.router)
app.include_router(chemical.router)
app.include_router(drug.router)


@app.get("/")
async def root():
    return {
        "app": "VEDA",
        "tagline": "Scan anything. Know if it's safe. In your language.",
        "version": "1.0.0",
        "endpoints": {
            "scan_label": "POST /scan/label",
            "scan_barcode": "POST /scan/barcode",
            "scan_pill": "POST /scan/pill",
            "scan_text": "POST /scan/text",
            "stack": "GET/POST /stack/{user_id}",
            "interactions": "GET /stack/{user_id}/interactions",
            "search_drug": "GET /drug/search?q=",
            "search_herb": "GET /herb/search?q=",
            "search_chemical": "GET /chemical/search/{name}",
        },
    }


@app.get("/health")
async def health():
    return {"status": "ok"}
