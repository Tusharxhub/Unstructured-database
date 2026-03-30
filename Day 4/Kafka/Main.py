"""Kafka producer that simulates IoT sensor events in real-time.

Run:
	python Main.py

Environment variables (optional):
	KAFKA_BOOTSTRAP_SERVERS=localhost:9092
	KAFKA_TOPIC=iot_sensor_data
	SENSOR_ID=sensor-001
	PRODUCER_INTERVAL_SECONDS=1
"""

from __future__ import annotations

import json
import os
import random
import time
from datetime import datetime, timezone

from kafka import KafkaProducer
from kafka.errors import KafkaError, NoBrokersAvailable


def build_sensor_payload(sensor_id: str) -> dict:
	"""Generate one random sensor reading payload."""
	return {
		"sensor_id": sensor_id,
		"timestamp": datetime.now(timezone.utc).isoformat(),
		"temperature_c": round(random.uniform(18.0, 38.0), 2),
		"humidity_pct": round(random.uniform(30.0, 95.0), 2),
	}


def create_producer(bootstrap_servers: str) -> KafkaProducer:
	"""Create a JSON Kafka producer."""
	return KafkaProducer(
		bootstrap_servers=bootstrap_servers,
		value_serializer=lambda v: json.dumps(v).encode("utf-8"),
		retries=5,
		acks="all",
		linger_ms=100,
	)


def wait_for_kafka(bootstrap_servers: str, retry_seconds: int = 5) -> KafkaProducer:
	"""Keep retrying until Kafka broker is reachable."""
	while True:
		try:
			producer = create_producer(bootstrap_servers)
			return producer
		except NoBrokersAvailable:
			print(
				f"Kafka not available at {bootstrap_servers}. "
				f"Retrying in {retry_seconds}s..."
			)
			time.sleep(retry_seconds)


def main() -> None:
	bootstrap_servers = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
	topic = os.getenv("KAFKA_TOPIC", "iot_sensor_data")
	sensor_id = os.getenv("SENSOR_ID", "sensor-001")
	interval_seconds = float(os.getenv("PRODUCER_INTERVAL_SECONDS", "1"))

	producer = wait_for_kafka(bootstrap_servers)
	print(f"Producer started -> topic={topic}, bootstrap={bootstrap_servers}")

	try:
		while True:
			payload = build_sensor_payload(sensor_id)
			future = producer.send(topic, value=payload)

			try:
				metadata = future.get(timeout=10)
				print(
					f"Sent: {payload} | partition={metadata.partition}, "
					f"offset={metadata.offset}"
				)
			except KafkaError as err:
				print(f"Failed to send message: {err}")

			time.sleep(interval_seconds)
	except KeyboardInterrupt:
		print("\nProducer stopped by user.")
	finally:
		producer.flush()
		producer.close()


if __name__ == "__main__":
	main()
