
# ! Implement a real-time data streaming pipeline using Apache Kafka. Create a producer that generates random sensor data (e.g., temperature, humidity) and sends it to a kafka to simulate IOT sensor data and store in MongoDB.



"""Kafka consumer that stores IoT sensor events in MongoDB."""

from __future__ import annotations

import json
import os
import time

from kafka import KafkaConsumer
from kafka.errors import NoBrokersAvailable
from pymongo import MongoClient
from pymongo.errors import PyMongoError


def wait_for_mongo(uri: str, retry: int = 5) -> MongoClient:
	while True:
		try:
			client = MongoClient(uri, serverSelectionTimeoutMS=3000)
			client.admin.command("ping")
			return client
		except Exception as err:
			print(f"MongoDB not ready ({err}); retrying in {retry}s...")
			time.sleep(retry)


def wait_for_consumer(servers: str, topic: str, group_id: str, retry: int = 5) -> KafkaConsumer:
	while True:
		try:
			return KafkaConsumer(
				topic,
				bootstrap_servers=servers,
				group_id=group_id,
				auto_offset_reset="earliest",
				enable_auto_commit=True,
				value_deserializer=lambda v: json.loads(v.decode("utf-8")),
			)
		except NoBrokersAvailable:
			print(f"Kafka not ready at {servers}; retrying in {retry}s...")
			time.sleep(retry)


def main() -> None:
	servers = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
	topic = os.getenv("KAFKA_TOPIC", "iot_sensor_data")
	group_id = os.getenv("KAFKA_GROUP_ID", "iot-consumer-group")
	mongo = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
	db = os.getenv("MONGO_DB", "iot_data")
	col = os.getenv("MONGO_COLLECTION", "sensor_readings")

	mongo_client = wait_for_mongo(mongo)
	collection = mongo_client[db][col]
	consumer = wait_for_consumer(servers, topic, group_id)

	print(f"Consumer started: topic={topic}, kafka={servers}, mongo={db}.{col}")

	try:
		for message in consumer:
			sensor_data = message.value
			try:
				result = collection.insert_one(sensor_data)
				print(f"Saved _id={result.inserted_id}: {sensor_data}")
			except PyMongoError as err:
				print(f"Insert failed: {err}")
	except KeyboardInterrupt:
		print("\nStopped by user.")
	finally:
		consumer.close()
		mongo_client.close()


if __name__ == "__main__":
	main()


