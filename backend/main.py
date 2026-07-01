import asyncio
import json
import os
import sys
import tempfile
import time
from datetime import datetime
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

app = FastAPI(title="Vectorizer API")

# CORS configuration: allow localhost for dev, production domain from env
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
]
prod_origin = os.getenv("ALLOWED_ORIGINS")
if prod_origin:
    allowed_origins.extend(prod_origin.split(","))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024
ALLOWED_CONTENT_TYPES = {"image/png", "image/jpeg", "image/jpg"}
ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg"}

PYTHON_EXEC = sys.executable
WORKER_SCRIPT = str(Path(__file__).parent / "worker.py")


def log_event(event_type: str, data: dict) -> None:
    """
    Log an event to stderr in JSON format for analytics.

    Events logged:
    - vectorization: Image vectorization start/success/failure
    - download_attempt: User clicked Download button
    - ad_start: Ad began playing
    - ad_complete: Ad completed successfully
    - ad_reject: User declined to watch ad

    Each entry includes: timestamp, event type, client_ip, and event-specific data.

    Example:
        {"timestamp": "2026-06-30T10:15:00Z", "event": "vectorization", "filename": "logo.png", "status": "success", ...}
    """
    timestamp = datetime.utcnow().isoformat() + "Z"
    log_entry = {"timestamp": timestamp, "event": event_type, **data}
    print(json.dumps(log_entry), file=sys.stderr, flush=True)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/vectorize")
async def vectorize(file: UploadFile = File(...), request: Request = None):
    start_time = time.time()
    client_ip = request.client.host if request else "unknown"

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type: {file.content_type}. Use PNG or JPEG.",
        )

    suffix = Path(file.filename or "upload").suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        suffix = ".png"

    body = await file.read(MAX_FILE_SIZE_BYTES + 1)
    if len(body) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail="File too large. Maximum size is 10 MB.",
        )

    tmp_in_path = ""
    tmp_out_path = ""
    try:
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp_in:
            tmp_in.write(body)
            tmp_in_path = tmp_in.name

        tmp_out_path = tmp_in_path + ".svg"

        # Run vtracer in a subprocess — the Python bindings segfault inside uvicorn's
        # async context, so we isolate it in a separate process via worker.py.
        proc = await asyncio.create_subprocess_exec(
            PYTHON_EXEC,
            WORKER_SCRIPT,
            tmp_in_path,
            tmp_out_path,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        _, stderr = await proc.communicate()

        if proc.returncode != 0:
            detail = stderr.decode().strip() or "Vectorization failed"
            raise HTTPException(status_code=422, detail=detail)

        with open(tmp_out_path) as f:
            svg_str = f.read()

        # Log successful vectorization
        duration_ms = int((time.time() - start_time) * 1000)
        log_event(
            "vectorization",
            {
                "filename": file.filename,
                "size_bytes": len(body),
                "duration_ms": duration_ms,
                "status": "success",
                "client_ip": client_ip,
            },
        )

    except HTTPException:
        # Log vectorization failure
        duration_ms = int((time.time() - start_time) * 1000)
        log_event(
            "vectorization",
            {
                "filename": file.filename,
                "error": str(exc) if "exc" in locals() else "HTTP error",
                "status": "failure",
                "duration_ms": duration_ms,
                "client_ip": client_ip,
            },
        )
        raise
    except Exception as exc:
        # Log unexpected errors
        duration_ms = int((time.time() - start_time) * 1000)
        log_event(
            "vectorization",
            {
                "filename": file.filename,
                "error": str(exc),
                "status": "failure",
                "duration_ms": duration_ms,
                "client_ip": client_ip,
            },
        )
        raise HTTPException(
            status_code=422,
            detail=f"Vectorization failed: {str(exc)}",
        )
    finally:
        for p in (tmp_in_path, tmp_out_path):
            try:
                Path(p).unlink(missing_ok=True)
            except Exception:
                pass

    return Response(
        content=svg_str,
        media_type="image/svg+xml",
        headers={"Content-Disposition": 'attachment; filename="output.svg"'},
    )


@app.post("/api/log")
async def log_analytics(data: dict, request: Request):
    """Receive analytics events from the frontend."""
    client_ip = request.client.host if request else "unknown"
    event_type = data.get("event", "unknown")
    log_event(event_type, {**data, "client_ip": client_ip})
    return {"status": "logged"}
