
#! Docker + FastAPI + Environment Variables

#! You need to write a Dockerfile that uses ENV and ARG to configure a FastAPI app.
#! The Dockerfile should allow setting:
#! Kafka bootstrap server connection parameters
#! MongoDB URI
# !You must demonstrate:
#! Building the Docker image with different ARG values
#! Running the container with overridden ENV values using docker run -e



import os

from fastapi import FastAPI


app = FastAPI(title="Environment Configured FastAPI App")


def get_settings() -> dict[str, str]:
    return {
        "kafka_bootstrap_servers": os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092"),
        "mongodb_uri": os.getenv("MONGODB_URI", "mongodb://localhost:27017"),
    }


@app.get("/")
def root() -> dict[str, object]:
    settings = get_settings()
    return {
        "message": "FastAPI app configured through environment variables",
        **settings,
    }


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}