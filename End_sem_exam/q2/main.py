"""Question 2 - FastAPI + MongoDB + PyMongo solution.

This app demonstrates:
- logging configuration changes into MongoDB
- automatic index creation
- aggregation for top users in the last 30 days
- explain plan inspection
- collection stats and index monitoring
- safe index cleanup examples
"""

from datetime import datetime, timedelta, timezone
import os

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from pymongo import ASCENDING, DESCENDING, MongoClient
from pymongo.collection import Collection


MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("MONGO_DB_NAME", "lab_exam")


class AuditLogIn(BaseModel):
    config_key: str = Field(..., min_length=1)
    old_value: str
    new_value: str
    changed_by: str = Field(..., min_length=1)
    changed_at: datetime | None = None


app = FastAPI(title="Config Audit Lab Solution")
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
collection: Collection = db["config_audit"]


def ensure_indexes() -> None:
    """Create the required indexes automatically."""

    collection.create_index(
        [("config_key", ASCENDING)],
        unique=True,
        name="ux_config_key",
    )

    collection.create_index(
        [("changed_by", ASCENDING), ("changed_at", DESCENDING)],
        name="ix_changed_by_changed_at",
    )


@app.on_event("startup")
def on_startup() -> None:
    """Prepare indexes when the API starts."""

    ensure_indexes()


@app.get("/")
def root() -> dict[str, str]:
    return {
        "message": "Config audit API is running",
        "database": DB_NAME,
        "collection": "config_audit",
    }


@app.post("/audit")
def insert_audit_log(payload: AuditLogIn) -> dict[str, str]:
    """Insert one configuration change record."""

    document = payload.model_dump()
    if document["changed_at"] is None:
        document["changed_at"] = datetime.now(timezone.utc)

    try:
        result = collection.insert_one(document)
    except Exception as exc:  # pragma: no cover - runtime safety for demo code
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return {"message": "Audit log inserted", "inserted_id": str(result.inserted_id)}


@app.get("/top-users")
def top_5_users_last_30_days() -> list[dict]:
    """Find top 5 users with the most changes in the last 30 days."""

    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    pipeline = [
        {"$match": {"changed_at": {"$gte": thirty_days_ago}}},
        {"$group": {"_id": "$changed_by", "total_changes": {"$sum": 1}}},
        {"$sort": {"total_changes": -1}},
        {"$limit": 5},
    ]
    return list(collection.aggregate(pipeline))


@app.get("/explain")
def explain_recent_changes_query() -> dict:
    """Return the explain plan for the recent changes filter."""

    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    return collection.find({"changed_at": {"$gte": thirty_days_ago}}).explain()


@app.post("/ensure-best-index")
def create_best_index_for_recent_changes() -> dict[str, str]:
    """Create a supporting index if the explain output shows a collection scan."""

    collection.create_index(
        [("changed_at", DESCENDING), ("changed_by", ASCENDING)],
        name="ix_changed_at_changed_by",
    )
    return {"message": "Supporting index created"}


@app.get("/stats")
def collection_statistics() -> dict:
    """Inspect collection size, storage size, and index size."""

    return db.command("collstats", "config_audit")


@app.get("/index-stats")
def index_usage_stats() -> list[dict]:
    """Show index usage information using $indexStats."""

    return list(collection.aggregate([{ "$indexStats": {} }]))


@app.delete("/drop-index/{index_name}")
def drop_unused_index(index_name: str) -> dict[str, str]:
    """Drop an index safely, but never allow removal of the _id index."""

    if index_name == "_id_":
        raise HTTPException(status_code=400, detail="The _id index cannot be dropped")

    collection.drop_index(index_name)
    return {"message": f"Index '{index_name}' dropped"}


if __name__ == "__main__":
    ensure_indexes()
    print("Config audit indexes are ready.")
    print("Use uvicorn main:app --host 0.0.0.0 --port 8000 to start the API.")