FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Build-time defaults that can still be overridden at runtime with `docker run -e`
ARG KAFKA_SERVER=localhost:9092
ARG MONGO_URI=mongodb://localhost:27017

ENV KAFKA_BOOTSTRAP_SERVERS=${KAFKA_SERVER}
ENV MONGODB_URI=${MONGO_URI}

COPY requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]