"""
Testimonial videos: Google Drive link (source) -> Cloudinary (delivery).

The admin pastes a Drive link; a background task pulls the file into Cloudinary,
pre-generates an optimized 720p H.264 MP4 and a JPG poster (eager_async), and the
testimonial row is marked "ready" once those exist (webhook or polling).
"""
import os
import re
import asyncio
import subprocess
import logging
import tempfile
from datetime import datetime
from typing import Optional
from urllib.parse import urlparse, parse_qs

import httpx
import cloudinary
import cloudinary.api
import cloudinary.uploader
import cloudinary.utils
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".env"))
load_dotenv()

logger = logging.getLogger("cloudinary_videos")
if not logger.handlers:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")

# --- Config (secrets come only from the environment) ---
CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
API_KEY = os.getenv("CLOUDINARY_API_KEY")
API_SECRET = os.getenv("CLOUDINARY_API_SECRET")
# Public HTTPS URL of this backend's webhook, e.g. https://api.example.com/api/cloudinary/webhook
NOTIFICATION_URL = os.getenv("CLOUDINARY_NOTIFICATION_URL") or None
# Plan limits (Free plan: 100 MB upload, 40 MB video transformation)
MAX_UPLOAD_MB = int(os.getenv("CLOUDINARY_MAX_VIDEO_MB", "100"))
MAX_TRANSFORM_MB = int(os.getenv("CLOUDINARY_MAX_TRANSFORM_MB", "40"))
# Auto-compress big Drive videos with ffmpeg before uploading, so they fit the plan limits
AUTO_COMPRESS = os.getenv("VIDEO_AUTO_COMPRESS", "1").lower() not in ("0", "false", "no")
MAX_SOURCE_MB = int(os.getenv("VIDEO_MAX_SOURCE_MB", "1024"))  # largest Drive file we will download
COMPRESS_TARGET_MB = max(min(MAX_TRANSFORM_MB, MAX_UPLOAD_MB) - 3, 5)
COMPRESS_TIMEOUT = 30 * 60  # seconds

FOLDER = "testimonials"
MAX_ATTEMPTS = 3
UPLOAD_TIMEOUT = 600          # seconds per Cloudinary upload call
EAGER_POLL_INTERVAL = 15      # seconds
EAGER_POLL_TIMEOUT = 20 * 60  # seconds

cloudinary.config(cloud_name=CLOUD_NAME, api_key=API_KEY, api_secret=API_SECRET, secure=True)

# Delivery transformations. These must match the eager ones exactly so the
# pre-generated files are served instead of being transformed on the fly.
# f_auto is deliberately not used: it would bypass the pre-built MP4 and
# trigger on-the-fly processing, which fails for videos above the plan's
# transformation limit.
VIDEO_TRANSFORMATION = {"width": 720, "crop": "limit", "quality": "auto", "video_codec": "h264"}
POSTER_TRANSFORMATION = {"start_offset": "1", "width": 720, "crop": "limit", "quality": "auto"}
EAGER = [
    {**VIDEO_TRANSFORMATION, "format": "mp4"},
    {**POSTER_TRANSFORMATION, "format": "jpg"},
]

DRIVE_HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
DRIVE_ID_RE = re.compile(r"^[A-Za-z0-9_-]{10,}$")
ALLOWED_DRIVE_HOSTS = {"drive.google.com"}


class VideoError(Exception):
    """An error with a message that can be shown to the admin as-is."""
    def __init__(self, message: str, retryable: bool = True):
        super().__init__(message)
        self.retryable = retryable


def is_configured() -> bool:
    return bool(CLOUD_NAME and API_KEY and API_SECRET)


# --- Drive link handling ---
def extract_drive_file_id(url: str) -> Optional[str]:
    """Returns the file ID for drive.google.com links only (/file/d/<ID>/ or ?id=<ID>)."""
    if not url:
        return None
    try:
        parsed = urlparse(url.strip())
    except ValueError:
        return None
    if parsed.scheme not in ("http", "https") or (parsed.hostname or "").lower() not in ALLOWED_DRIVE_HOSTS:
        return None
    match = re.search(r"/file/d/([^/?#]+)", parsed.path)
    file_id = match.group(1) if match else (parse_qs(parsed.query).get("id") or [None])[0]
    return file_id if file_id and DRIVE_ID_RE.match(file_id) else None


def drive_direct_url(file_id: str) -> str:
    return f"https://drive.google.com/uc?export=download&id={file_id}"


# --- Delivery URLs ---
def video_delivery_url(public_id: str) -> str:
    return cloudinary.utils.cloudinary_url(
        public_id, resource_type="video", format="mp4", transformation=[VIDEO_TRANSFORMATION]
    )[0]


def thumbnail_delivery_url(public_id: str) -> str:
    return cloudinary.utils.cloudinary_url(
        public_id, resource_type="video", format="jpg", transformation=[POSTER_TRANSFORMATION]
    )[0]


def original_delivery_url(public_id: str) -> str:
    return cloudinary.utils.cloudinary_url(public_id, resource_type="video", format="mp4")[0]


# --- Uploading ---
def _upload_options(file_id: str) -> dict:
    # Eager transformations are requested afterwards via explicit(), once we know the size
    return {
        "resource_type": "video",
        "folder": FOLDER,
        "public_id": file_id,
        "overwrite": True,
        "invalidate": True,
        "timeout": UPLOAD_TIMEOUT,
    }


def _friendly_cloudinary_error(exc: Exception) -> VideoError:
    text = str(exc)
    lowered = text.lower()
    if "file size too large" in lowered or "413" in lowered:
        return VideoError(
            f"Video Cloudinary plan ni limit ({MAX_UPLOAD_MB} MB) thi moti chhe. Video compress karine navi link muko.",
            retryable=False,
        )
    if "invalid api_key" in lowered or "must supply api_key" in lowered or "api_secret mismatch" in lowered:
        return VideoError("Cloudinary keys khoti chhe. .env ma CLOUDINARY_* check karo.", retryable=False)
    return VideoError(f"Cloudinary upload failed: {text}")


async def _download_drive_to_temp(file_id: str, max_mb: int) -> tuple[str, int]:
    """Streams a Drive file to a temp file (never the whole file in RAM). Handles the virus-scan page."""
    max_bytes = max_mb * 1024 * 1024
    url = f"https://drive.google.com/uc?export=download&confirm=t&id={file_id}"
    timeout = httpx.Timeout(60.0, connect=10.0)

    async with httpx.AsyncClient(follow_redirects=True, timeout=timeout, headers=DRIVE_HEADERS) as client:
        for _ in range(2):  # second pass follows the virus-scan confirmation form
            async with client.stream("GET", url) as r:
                content_type = r.headers.get("content-type", "")
                final_host = r.url.host or ""

                if "accounts.google.com" in final_host or r.status_code in (401, 403):
                    raise VideoError("Drive link private chhe. Link ne 'Anyone with the link' kari do.", retryable=False)
                if r.status_code == 404:
                    raise VideoError("Drive file mali nahi. Link sachi chhe ane file delete nathi thai e check karo.", retryable=False)
                if r.status_code >= 400:
                    raise VideoError(f"Drive download failed (HTTP {r.status_code}).")

                if "text/html" in content_type:
                    html = (await r.aread()).decode("utf-8", errors="ignore")
                    uuid_match = re.search(r'name="uuid"\s+value="([^"]+)"', html)
                    confirm_match = re.search(r"confirm=([0-9A-Za-z_-]+)", html)
                    if uuid_match:
                        url = (f"https://drive.usercontent.google.com/download?id={file_id}"
                               f"&export=download&confirm=t&uuid={uuid_match.group(1)}")
                        continue
                    if confirm_match:
                        url = f"https://drive.google.com/uc?export=download&id={file_id}&confirm={confirm_match.group(1)}"
                        continue
                    if "ServiceLogin" in html or "accounts.google.com" in html:
                        raise VideoError("Drive link private chhe. Link ne 'Anyone with the link' kari do.", retryable=False)
                    raise VideoError("Drive e video ni jagyae HTML page aapyu. Link public video file ni chhe e check karo.")

                declared = int(r.headers.get("content-length") or 0)
                if declared > max_bytes:
                    raise VideoError(
                        f"Video {declared // (1024 * 1024)} MB nu chhe, limit {max_mb} MB chhe. "
                        "Video compress karine navi link muko.",
                        retryable=False,
                    )

                fd, path = tempfile.mkstemp(prefix=f"drive_{file_id}_", suffix=".mp4")
                written = 0
                try:
                    with os.fdopen(fd, "wb") as f:
                        async for chunk in r.aiter_bytes(chunk_size=1024 * 1024):
                            written += len(chunk)
                            if written > max_bytes:
                                raise VideoError(
                                    f"Video {max_mb} MB thi moti chhe. "
                                    "Video compress karine navi link muko.",
                                    retryable=False,
                                )
                            f.write(chunk)
                except BaseException:
                    _remove_quietly(path)
                    raise
                return path, written

    raise VideoError("Drive confirmation page par atki gayu. Thodi var pachhi Retry karo.")


def _remove_quietly(path: Optional[str]):
    if path and os.path.exists(path):
        try:
            os.remove(path)
        except OSError as e:
            logger.warning("Could not delete temp file %s: %s", path, e)


def _ffmpeg_exe() -> str:
    import imageio_ffmpeg  # bundles a static ffmpeg binary, no system install needed
    return imageio_ffmpeg.get_ffmpeg_exe()


def _video_duration_seconds(ffmpeg: str, path: str) -> Optional[float]:
    probe = subprocess.run([ffmpeg, "-hide_banner", "-i", path], capture_output=True, text=True, errors="ignore", timeout=120)
    match = re.search(r"Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)", probe.stderr)
    if not match:
        return None
    h, m, sec = match.groups()
    return int(h) * 3600 + int(m) * 60 + float(sec)


def _compress_video(src: str) -> str:
    """Re-encodes to 720p H.264/AAC with faststart, sized to fit COMPRESS_TARGET_MB. Returns the new temp path."""
    ffmpeg = _ffmpeg_exe()
    duration = _video_duration_seconds(ffmpeg, src)
    if not duration:
        raise VideoError("Video ni length vanchi na shakaya; file sachi video chhe e check karo.", retryable=False)

    audio_kbps = 96
    target_bits = COMPRESS_TARGET_MB * 1024 * 1024 * 8
    video_kbps = int(target_bits / duration / 1000) - audio_kbps
    video_kbps = max(min(video_kbps, 2500), 250)  # 2.5 Mbps is plenty for 720p

    fd, dst = tempfile.mkstemp(prefix="compressed_", suffix=".mp4")
    os.close(fd)
    target_bytes = COMPRESS_TARGET_MB * 1024 * 1024
    try:
        for _ in range(2):  # second pass with a lower bitrate if the first overshoots
            cmd = [
                ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-i", src,
                "-vf", "scale='min(720,iw)':-2",
                "-c:v", "libx264", "-preset", "veryfast", "-pix_fmt", "yuv420p",
                "-b:v", f"{video_kbps}k", "-maxrate", f"{int(video_kbps * 1.3)}k", "-bufsize", f"{video_kbps * 2}k",
                "-c:a", "aac", "-b:a", f"{audio_kbps}k", "-ac", "2",
                "-movflags", "+faststart", "-map_metadata", "-1",
                dst,
            ]
            result = subprocess.run(cmd, capture_output=True, text=True, errors="ignore", timeout=COMPRESS_TIMEOUT)
            if result.returncode != 0:
                raise VideoError(f"Video compress na thai shakyo: {result.stderr.strip()[-300:]}")
            if os.path.getsize(dst) <= target_bytes:
                break
            video_kbps = max(int(video_kbps * 0.7), 150)
        size_mb = os.path.getsize(dst) / (1024 * 1024)
        if size_mb > MAX_UPLOAD_MB:
            raise VideoError(
                f"Compress karya pachhi pan video {size_mb:.0f} MB nu chhe (limit {MAX_UPLOAD_MB} MB). Video nano (tunko) karo.",
                retryable=False,
            )
        logger.info("Compressed %s: %.0fs, %d kbps -> %.1f MB", src, duration, video_kbps, size_mb)
        return dst
    except BaseException:
        _remove_quietly(dst)
        raise


async def _upload_file(file_id: str, path: str) -> dict:
    try:
        return await asyncio.to_thread(
            cloudinary.uploader.upload_large, path, chunk_size=20 * 1024 * 1024,
            **_upload_options(file_id)
        )
    except Exception as e:
        raise _friendly_cloudinary_error(e)


async def _upload_to_cloudinary(file_id: str) -> dict:
    """Uploads a Drive video to Cloudinary. Returns the upload result."""
    if AUTO_COMPRESS:
        # Download first so big videos can be compressed to fit the plan limits
        source = compressed = None
        try:
            source, size = await _download_drive_to_temp(file_id, MAX_SOURCE_MB)
            size_mb = size / (1024 * 1024)
            logger.info("Downloaded %s from Drive (%.1f MB)", file_id, size_mb)
            if size_mb > COMPRESS_TARGET_MB:
                compressed = await asyncio.to_thread(_compress_video, source)
            return await _upload_file(file_id, compressed or source)
        finally:
            _remove_quietly(source)
            _remove_quietly(compressed)

    # Step 1: let Cloudinary fetch the Drive URL itself (works for smaller public files)
    try:
        result = await asyncio.to_thread(
            cloudinary.uploader.upload, drive_direct_url(file_id), **_upload_options(file_id)
        )
        logger.info("Remote upload ok for %s (%s bytes)", file_id, result.get("bytes"))
        return result
    except Exception as e:
        friendly = _friendly_cloudinary_error(e)
        if not friendly.retryable:
            raise friendly
        logger.info("Remote upload failed for %s, falling back to download: %s", file_id, e)

    # Step 2: stream from Drive to a temp file, then chunked upload
    path = None
    try:
        path, size = await _download_drive_to_temp(file_id, MAX_UPLOAD_MB)
        logger.info("Downloaded %s from Drive (%s bytes), uploading with upload_large", file_id, size)
        return await _upload_file(file_id, path)
    finally:
        _remove_quietly(path)


async def _request_eager(public_id: str):
    """Asks Cloudinary to pre-generate the optimized MP4 + poster on the uploaded asset."""
    options = {"type": "upload", "resource_type": "video", "eager": EAGER, "eager_async": True}
    if NOTIFICATION_URL:
        options["eager_notification_url"] = NOTIFICATION_URL
    await asyncio.to_thread(cloudinary.uploader.explicit, public_id, **options)


async def _wait_for_eager(collection, row_id, public_id: str):
    """Polling fallback for when no webhook arrives (e.g. local dev)."""
    expected = len(EAGER)
    waited = 0
    while waited < EAGER_POLL_TIMEOUT:
        await asyncio.sleep(EAGER_POLL_INTERVAL)
        waited += EAGER_POLL_INTERVAL
        row = await collection.find_one({"_id": row_id}, {"status": 1, "cloudinary_public_id": 1})
        if not row or row.get("cloudinary_public_id") != public_id or row.get("status") != "processing":
            return  # webhook already handled it, row deleted, or video changed
        try:
            resource = await asyncio.to_thread(cloudinary.api.resource, public_id, resource_type="video")
        except Exception as e:
            logger.warning("Polling Cloudinary for %s failed: %s", public_id, e)
            continue
        if len(resource.get("derived") or []) >= expected:
            await mark_ready(collection, public_id)
            return
    # Took too long: serve the original upload so the testimonial still shows
    logger.warning("Eager transformations for %s not confirmed after %ss; using original", public_id, EAGER_POLL_TIMEOUT)
    await mark_ready(collection, public_id, optimized=False,
                     note="Optimized version samay sar taiyar na thayu, original video vaprayu chhe.")


async def mark_ready(collection, public_id: str, optimized: bool = True, note: Optional[str] = None):
    update = {
        "status": "ready",
        "video_url": video_delivery_url(public_id) if optimized else original_delivery_url(public_id),
        "thumbnail_url": thumbnail_delivery_url(public_id),
        "error": note,
        "updated_at": datetime.utcnow(),
    }
    await collection.update_one({"cloudinary_public_id": public_id, "status": "processing"}, {"$set": update})
    logger.info("Testimonial video ready: %s (optimized=%s)", public_id, optimized)


async def process_testimonial_video(collection, row_id, file_id: str):
    """Background task: Drive -> Cloudinary with 3 attempts, then wait for eager transformations."""
    if not is_configured():
        await collection.update_one({"_id": row_id}, {"$set": {
            "status": "failed",
            "error": "Cloudinary configure nathi. .env ma CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET muko.",
        }})
        return

    last_error = None
    for attempt in range(1, MAX_ATTEMPTS + 1):
        row = await collection.find_one({"_id": row_id}, {"drive_file_id": 1})
        if not row or row.get("drive_file_id") != file_id:
            logger.info("Testimonial %s changed or deleted; stopping processing of %s", row_id, file_id)
            return
        try:
            result = await _upload_to_cloudinary(file_id)
            break
        except VideoError as e:
            last_error = e
        except Exception as e:  # unexpected (network etc.)
            last_error = VideoError(f"Unexpected error: {e}")
        logger.warning("Attempt %s/%s failed for %s: %s", attempt, MAX_ATTEMPTS, file_id, last_error)
        if not last_error.retryable or attempt == MAX_ATTEMPTS:
            await collection.update_one({"_id": row_id, "drive_file_id": file_id},
                                        {"$set": {"status": "failed", "error": str(last_error)}})
            return
        await asyncio.sleep(10 * attempt)

    public_id = result["public_id"]
    size_mb = (result.get("bytes") or 0) / (1024 * 1024)
    await collection.update_one({"_id": row_id, "drive_file_id": file_id},
                                {"$set": {"cloudinary_public_id": public_id, "error": None}})

    if size_mb > MAX_TRANSFORM_MB:
        # Plan cannot transform videos this big; deliver the original instead of failing
        await mark_ready(collection, public_id, optimized=False, note=(
            f"Video {size_mb:.0f} MB nu chhe; plan {MAX_TRANSFORM_MB} MB sudhi j optimize kare chhe. "
            "Original video vaprayu chhe; fast play mate video compress karo."
        ))
        return

    try:
        await _request_eager(public_id)
    except Exception as e:
        logger.warning("Eager request failed for %s: %s; using original", public_id, e)
        await mark_ready(collection, public_id, optimized=False,
                         note="Optimization shakya na thayu, original video vaprayu chhe.")
        return
    await _wait_for_eager(collection, row_id, public_id)


async def resume_processing(collection):
    """On server start, continue videos left in 'processing' (background tasks die on restart)."""
    rows = [doc async for doc in collection.find({"status": "processing"}, {"drive_file_id": 1, "cloudinary_public_id": 1})]
    if rows:
        logger.info("Resuming %s testimonial video(s) left in processing", len(rows))
    for doc in rows:
        try:
            if doc.get("cloudinary_public_id"):
                # Already uploaded; only the optimized versions were pending
                await _wait_for_eager(collection, doc["_id"], doc["cloudinary_public_id"])
            elif doc.get("drive_file_id"):
                await process_testimonial_video(collection, doc["_id"], doc["drive_file_id"])
        except Exception as e:
            logger.error("Resume failed for %s: %s", doc["_id"], e)


async def handle_eager_notification(collection, payload: dict):
    """Webhook: Cloudinary reports that eager transformations finished."""
    if payload.get("notification_type") != "eager":
        return
    public_id = payload.get("public_id")
    if not public_id:
        return
    results = payload.get("eager") or []
    failed = [e for e in results if e.get("status") == "failed"]
    if failed:
        reason = failed[0].get("reason") or "unknown"
        await mark_ready(collection, public_id, optimized=False,
                         note=f"Optimization fail thayu ({reason}), original video vaprayu chhe.")
    else:
        await mark_ready(collection, public_id)


def verify_webhook(body: str, timestamp: str, signature: str) -> bool:
    try:
        return cloudinary.utils.verify_notification_signature(body, int(timestamp), signature, valid_for=7200)
    except Exception:
        return False


async def delete_from_cloudinary(public_id: Optional[str]):
    if not public_id or not is_configured():
        return
    try:
        result = await asyncio.to_thread(
            cloudinary.uploader.destroy, public_id, resource_type="video", invalidate=True
        )
        logger.info("Cloudinary destroy %s: %s", public_id, result.get("result"))
    except Exception as e:
        logger.error("Cloudinary destroy failed for %s: %s", public_id, e)
