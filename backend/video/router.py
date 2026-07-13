import os
from pathlib import Path
from fastapi import APIRouter, Request, HTTPException, status
from fastapi.responses import StreamingResponse

router = APIRouter()

# Determine the absolute path to the video file
VIDEO_PATH = Path(__file__).resolve().parent.parent.parent / "frontend" / "public" / "videos" / "togetherscout_launch_vid.mov"

@router.get("/launch")
async def video_endpoint(request: Request):
    if not VIDEO_PATH.exists():
        raise HTTPException(status_code=404, detail="Video not found")

    file_size = VIDEO_PATH.stat().st_size
    range_header = request.headers.get("Range")

    if not range_header:
        headers = {
            "Accept-Ranges": "bytes",
            "Content-Length": str(file_size),
            "Content-Type": "video/quicktime",
        }
        def file_iterator():
            with open(VIDEO_PATH, "rb") as f:
                while chunk := f.read(1024 * 1024):
                    yield chunk
        return StreamingResponse(file_iterator(), headers=headers, media_type="video/quicktime")

    try:
        byte_range = range_header.strip().replace("bytes=", "").split("-")
        start = int(byte_range[0])
        end = int(byte_range[1]) if len(byte_range) > 1 and byte_range[1] else file_size - 1
    except ValueError:
        raise HTTPException(status_code=status.HTTP_416_REQUESTED_RANGE_NOT_SATISFIABLE)

    if start >= file_size or end >= file_size:
        raise HTTPException(status_code=status.HTTP_416_REQUESTED_RANGE_NOT_SATISFIABLE)

    chunk_size = end - start + 1

    headers = {
        "Content-Range": f"bytes {start}-{end}/{file_size}",
        "Accept-Ranges": "bytes",
        "Content-Length": str(chunk_size),
        "Content-Type": "video/quicktime",
    }

    def chunk_generator(start_byte: int, end_byte: int):
        with open(VIDEO_PATH, "rb") as f:
            f.seek(start_byte)
            bytes_left = end_byte - start_byte + 1
            chunk_size_bytes = 1024 * 1024
            while bytes_left > 0:
                read_size = min(chunk_size_bytes, bytes_left)
                data = f.read(read_size)
                if not data:
                    break
                bytes_left -= len(data)
                yield data

    return StreamingResponse(
        chunk_generator(start, end),
        status_code=status.HTTP_206_PARTIAL_CONTENT,
        headers=headers,
        media_type="video/quicktime",
    )
