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


def payload(sensor_id: str) -> dict:
	return {
		"sensor_id": sensor_id,
		"timestamp": datetime.now(timezone.utc).isoformat(),
		"temperature_c": round(random.uniform(18, 38), 2),
		"humidity_pct": round(random.uniform(30, 95), 2),
	}


def get_producer(bootstrap: str) -> KafkaProducer:
	while True:
		try:
			return KafkaProducer(
				bootstrap_servers=bootstrap,
				value_serializer=lambda v: json.dumps(v).encode(),
				retries=5,
				acks="all",
			)
		except NoBrokersAvailable:
			print(f"Kafka not available at {bootstrap}, retrying...")
			time.sleep(5)


def main() -> None:
	bootstrap = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
	topic = os.getenv("KAFKA_TOPIC", "iot_sensor_data")
	sensor_id = os.getenv("SENSOR_ID", "sensor-001")
	interval = float(os.getenv("PRODUCER_INTERVAL_SECONDS", "1"))

	producer = get_producer(bootstrap)
	print(f"Producer started -> topic={topic}")

	try:
		while True:
			msg = payload(sensor_id)
			try:
				md = producer.send(topic, msg).get(timeout=10)
				print(f"Sent: {msg} | p={md.partition}, o={md.offset}")
			except KafkaError as e:
				print(f"Send failed: {e}")
			time.sleep(interval)
	except KeyboardInterrupt:
		print("\nStopped.")
	finally:
		producer.flush()
		producer.close()


if __name__ == "__main__":
	main()
