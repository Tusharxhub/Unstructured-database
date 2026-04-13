
# !MongoDB + PyMongo (3 parts)

#! (a) Unique Index in MongoDB

#! FastAPI logs configuration changes in a collection called config_audit with fields:
#! config_key (string)
#! old_value (string)
#! new_value (string)
#! changed_by (string)
#! changed_at (Date)
#! Tasks:
#! Create a unique index on config_key to avoid duplicate active configs
#! Create a compound index on {changed_by: 1, changed_at: -1}
#! Write PyMongo commands for these indexes
#! Explain why unique indexes are important

#! (b) Aggregation to find top users

#! Use PyMongo aggregation to find top 5 users (changed_by) who made the most changes in the last 30 days
#! Use .explain() to check if the $match stage uses an index (IXSCAN)
#! If not, create a proper index and re-run .explain()

#! (c) Index maintenance for large collections

#! config_audit can grow very large
#! Use db.collection.stats() to inspect collection size and index sizes
#! Explain how to identify unused indexes with $indexStats
#! Safely drop unused indexes
#! Demonstrate with an example showing before and after index removal







from datetime import datetime, timedelta, timezone

from pymongo import MongoClient, ASCENDING, DESCENDING


#! -----------------------------------------------------------------------------
#! Connection setup
#! -----------------------------------------------------------------------------
#! Update the connection string and database name if your lab environment uses
#! different values.
client = MongoClient("mongodb://localhost:27017")
db = client["lab_exam"]
collection = db["config_audit"]


#! -----------------------------------------------------------------------------
#! (a) Create indexes
#! -----------------------------------------------------------------------------
def create_part_a_indexes() -> None:
	"""Create the required indexes for config_audit."""

	#! 1) Unique index on config_key.
	collection.create_index(
		[("config_key", ASCENDING)],
		unique=True,
		name="ux_config_key",
	)

	#! 2) Compound index on changed_by ascending, changed_at descending.
	collection.create_index(
		[("changed_by", ASCENDING), ("changed_at", DESCENDING)],
		name="ix_changed_by_changed_at",
	)


def print_part_a_shell_commands() -> None:
	"""Print the Mongo shell equivalents for part (a)."""

	print("\n(a) Mongo shell commands")
	print("db.config_audit.createIndex({ config_key: 1 }, { unique: true, name: 'ux_config_key' })")
	print("db.config_audit.createIndex({ changed_by: 1, changed_at: -1 }, { name: 'ix_changed_by_changed_at' })")


#! Explanation for part (a):
#! - A unique index guarantees that no two documents can store the same value
#!   in config_key.
#! - This prevents duplicate configuration records and speeds up lookups by
#!   config_key.
#! - A compound index on changed_by and changed_at helps queries that filter or
#!   sort by those fields.


# -----------------------------------------------------------------------------
# (b) Aggregation: top 5 users in the last 30 days
# -----------------------------------------------------------------------------
def top_5_users_last_30_days() -> list[dict]:
	"""Return the top 5 users who made the most changes in the last 30 days."""

	thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)

	pipeline = [
		{
			"$match": {
				"changed_at": {"$gte": thirty_days_ago}
			}
		},
		{
			"$group": {
				"_id": "$changed_by",
				"total_changes": {"$sum": 1},
			}
		},
		{
			"$sort": {"total_changes": -1}
		},
		{
			"$limit": 5
		},
	]

	return list(collection.aggregate(pipeline))


def explain_match_stage() -> dict:
	"""Show the explain plan for the $match filter used in part (b)."""

	thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)

	# Using find().explain() is the simplest way to confirm whether the filter
	# can use an IXSCAN.
	return collection.find(
		{"changed_at": {"$gte": thirty_days_ago}}
	).explain()


def create_best_index_for_part_b() -> None:
	"""Create the best supporting index if the explain plan does not use IXSCAN."""

	# The query filters on changed_at first, so the best supporting index begins
	# with changed_at. We include changed_by next because the pipeline groups by
	# that field.
	collection.create_index(
		[("changed_at", DESCENDING), ("changed_by", ASCENDING)],
		name="ix_changed_at_changed_by",
	)


def print_part_b_shell_commands() -> None:
	"""Print the Mongo shell equivalents for part (b)."""

	print("\n(b) Mongo shell commands")
	print("db.config_audit.aggregate([")
	print("  { $match: { changed_at: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },")
	print("  { $group: { _id: '$changed_by', total_changes: { $sum: 1 } } },")
	print("  { $sort: { total_changes: -1 } },")
	print("  { $limit: 5 }")
	print("])")
	print("db.config_audit.find({ changed_at: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }).explain('executionStats')")
	print("db.config_audit.createIndex({ changed_at: -1, changed_by: 1 }, { name: 'ix_changed_at_changed_by' })")


#! Explanation for part (b):
#! - The aggregation counts configuration changes per user in the last 30 days.
#! - If the explain plan shows COLLSCAN instead of IXSCAN, the query is scanning
#!   the entire collection.
#! - Creating an index that starts with changed_at helps the $match stage filter
#!   recent documents faster.


#! -----------------------------------------------------------------------------
#! (c) Index maintenance
#! -----------------------------------------------------------------------------
def collection_statistics() -> dict:
	"""Return collection and index size statistics."""

	return db.command("collstats", "config_audit")


def show_index_usage() -> list[dict]:
	"""Return index usage details from $indexStats."""

	pipeline = [{"$indexStats": {}}]
	return list(collection.aggregate(pipeline))


def drop_unused_indexes(unused_index_names: list[str]) -> None:
	"""Safely drop indexes that are no longer needed."""

	for index_name in unused_index_names:
		# Never drop the default _id index.
		if index_name == "_id_":
			continue
		collection.drop_index(index_name)


def print_part_c_shell_commands() -> None:
	"""Print the Mongo shell equivalents for part (c)."""

	print("\n(c) Mongo shell commands")
	print("db.config_audit.stats()")
	print("db.config_audit.aggregate([{ $indexStats: {} }])")
	print("db.config_audit.dropIndex('ix_changed_by_changed_at')")


#! Explanation for part (c):
#! - stats() shows document count, collection size, storage size, and index size.
#! - $indexStats helps identify indexes that are rarely or never used.
#! - Unused indexes should be removed carefully because every index adds storage
#!   cost and slows down inserts and updates.


# -----------------------------------------------------------------------------
# Example runner
# -----------------------------------------------------------------------------
if __name__ == "__main__":
	# Part (a)
	create_part_a_indexes()
	print_part_a_shell_commands()

	# Part (b)
	print("\n(b) Top 5 users in the last 30 days")
	for row in top_5_users_last_30_days():
		print(row)

	print("\n(b) Explain plan for recent changes query")
	print(explain_match_stage())

	# If the explain plan does not use IXSCAN, uncomment the next line:
	# create_best_index_for_part_b()

	print_part_b_shell_commands()

	# Part (c)
	print("\n(c) Collection stats")
	print(collection_statistics())

	print("\n(c) Index usage")
	for row in show_index_usage():
		print(row)

	# Example of safe cleanup:
	# drop_unused_indexes(["ix_changed_by_changed_at"])

	print_part_c_shell_commands()


