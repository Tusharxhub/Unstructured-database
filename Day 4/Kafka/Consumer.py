

# ! Implement a real-time data streaming pipeline using Apache Kafka. Create a producer that generates random sensor data (e.g., temperature, humidity) and sends it to a kafka to simulate IOT sensor data and store in MongoDB.





"""Kafka consumer that stores IoT sensor events into MongoDB.

Run:
	python Consumer.py

Environment variables (optional):
	KAFKA_BOOTSTRAP_SERVERS=localhost:9092
	KAFKA_TOPIC=iot_sensor_data
	KAFKA_GROUP_ID=iot-consumer-group
	MONGO_URI=mongodb://localhost:27017/
	MONGO_DB=iot_data
	MONGO_COLLECTION=sensor_readings
"""

from __future__ import annotations

import json
import os
import time

from kafka import KafkaConsumer
from kafka.errors import NoBrokersAvailable
from pymongo import MongoClient
from pymongo.errors import PyMongoError


def create_consumer(bootstrap_servers: str, topic: str, group_id: str) -> KafkaConsumer:
	"""Create Kafka consumer configured for JSON sensor events."""
	return KafkaConsumer(
		topic,
		bootstrap_servers=bootstrap_servers,
		group_id=group_id,
		auto_offset_reset="earliest",
		enable_auto_commit=True,
		value_deserializer=lambda x: json.loads(x.decode("utf-8")),
	)


def wait_for_kafka_consumer(
	bootstrap_servers: str,
	topic: str,
	group_id: str,
	retry_seconds: int = 5,
) -> KafkaConsumer:
	"""Keep retrying until Kafka broker is reachable."""
	while True:
		try:
			return create_consumer(bootstrap_servers, topic, group_id)
		except NoBrokersAvailable:
			print(
				f"Kafka not available at {bootstrap_servers}. "
				f"Retrying in {retry_seconds}s..."
			)
			time.sleep(retry_seconds)


def wait_for_mongo(mongo_uri: str, retry_seconds: int = 5) -> MongoClient:
	"""Keep retrying until MongoDB is reachable."""
	while True:
		try:
			client = MongoClient(mongo_uri, serverSelectionTimeoutMS=3000)
			client.admin.command("ping")
			return client
		except Exception as err:
			print(f"MongoDB not available at {mongo_uri}: {err}. Retrying in {retry_seconds}s...")
			time.sleep(retry_seconds)


def main() -> None:
	bootstrap_servers = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
	topic = os.getenv("KAFKA_TOPIC", "iot_sensor_data")
	group_id = os.getenv("KAFKA_GROUP_ID", "iot-consumer-group")
	mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
	mongo_db = os.getenv("MONGO_DB", "iot_data")
	mongo_collection = os.getenv("MONGO_COLLECTION", "sensor_readings")

	mongo_client = wait_for_mongo(mongo_uri)
	collection = mongo_client[mongo_db][mongo_collection]
	consumer = wait_for_kafka_consumer(bootstrap_servers, topic, group_id)

	print(
		"Consumer started -> "
		f"topic={topic}, bootstrap={bootstrap_servers}, mongo={mongo_db}.{mongo_collection}"
	)

	try:
		for message in consumer:
			sensor_data = message.value
			try:
				result = collection.insert_one(sensor_data)
				print(f"Stored in MongoDB _id={result.inserted_id}: {sensor_data}")
			except PyMongoError as err:
				print(f"MongoDB insert error: {err}")
	except KeyboardInterrupt:
		print("\nConsumer stopped by user.")
	finally:
		consumer.close()
		mongo_client.close()


if __name__ == "__main__":
	main()


