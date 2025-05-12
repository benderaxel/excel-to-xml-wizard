
#!/bin/bash
echo "Building Docker image..."
docker-compose build

echo "Starting containers..."
docker-compose up -d

echo "Container is running at http://localhost:8080"
