"""
One-time migration: move existing Google Drive testimonials to Cloudinary.

Old rows stored the Drive link in `video_url`. This script moves it to `drive_url`,
fills `drive_file_id`, and uploads each video to Cloudinary one by one.

Usage (from the backend folder):
    python migrate_testimonials_to_cloudinary.py            # migrate everything not ready yet
    python migrate_testimonials_to_cloudinary.py --dry-run  # only show what would happen
    python migrate_testimonials_to_cloudinary.py --failed   # retry only failed rows
"""
import sys
import asyncio
import argparse

from database import testimonials_collection
import cloudinary_videos


async def main(dry_run: bool, only_failed: bool):
    if not cloudinary_videos.is_configured() and not dry_run:
        print("Cloudinary configure nathi. .env ma CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET muko.")
        sys.exit(1)

    query = {"status": "failed"} if only_failed else {"status": {"$ne": "ready"}}
    rows = [doc async for doc in testimonials_collection.find(query).sort("display_order", 1)]
    print(f"{len(rows)} testimonial(s) to migrate")

    seen_file_ids = set()
    summary = {"ready": 0, "failed": 0, "skipped": 0}

    for doc in rows:
        title = doc.get("title") or str(doc["_id"])
        # Old rows keep the Drive link in video_url
        drive_url = doc.get("drive_url") or doc.get("video_url") or ""
        file_id = cloudinary_videos.extract_drive_file_id(drive_url)

        if not file_id:
            print(f"- SKIP  {title}: not a Google Drive link ({drive_url!r})")
            summary["skipped"] += 1
            continue
        if file_id in seen_file_ids:
            print(f"- SKIP  {title}: duplicate of another testimonial's Drive file {file_id}")
            summary["skipped"] += 1
            continue
        seen_file_ids.add(file_id)

        if dry_run:
            print(f"- WOULD MIGRATE {title}: {file_id}")
            continue

        await testimonials_collection.update_one({"_id": doc["_id"]}, {
            "$set": {
                "drive_url": drive_url,
                "drive_file_id": file_id,
                "status": "processing",
                "video_url": None,
                "thumbnail_url": None,
                "error": None,
            },
            "$unset": {"direct_url": ""},
        })
        print(f"- START {title}: {file_id}")
        await cloudinary_videos.process_testimonial_video(testimonials_collection, doc["_id"], file_id)

        result = await testimonials_collection.find_one({"_id": doc["_id"]})
        status = result.get("status")
        note = f" ({result['error']})" if result.get("error") else ""
        print(f"  -> {status}{note}")
        summary[status if status in summary else "failed"] += 1

    print(f"\nDone: {summary}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--dry-run", action="store_true", help="show what would be migrated without changing anything")
    parser.add_argument("--failed", action="store_true", help="retry only rows with status 'failed'")
    args = parser.parse_args()
    asyncio.run(main(args.dry_run, args.failed))
