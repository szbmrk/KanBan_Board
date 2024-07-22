@echo off
REM Navigate to frontend directory and start npm
cd frontend
start cmd /k "npm start"

REM Navigate back to the root directory
cd ..

REM Navigate to backend directory and start PHP server
cd backend
start cmd /k "php artisan serve"

REM Navigate back to the root directory
cd ..

REM Start soketi
start cmd /k "soketi start --config=./soketi-config.json"