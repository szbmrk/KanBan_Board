# 1. módszer

## Frontend (root dirből)
cd frontend
npm start

## Backend (root dirből)
cd backend
php artisan serve

## Websocket (root dirből)
soketi start --config="./soketi-config.json"

## Websocket (docker)
docker run -p 6001:6001 quay.io/soketi/soketi:1.0-16-distroless

# 2. módszer
root dir -> ./run_project.bat

# 3. módszer (vs code only)
ctrl + shift + P -> run task -> start kanban