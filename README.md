# KanBan_Board

frontend indítása:

cd frontend -> npm install (ez először kell csak / minden pullnál) -> npm start


backend setupolása:

- cd backend
- composer install
- '.env' fájl létrehozása
- '.env.example' tartalmának átmásolása a '.env-be'
- ezen belül: DB_DATABASE=kanban_board
- php artisan key:generate
- php artisan serve

backend elindítása:

- cd backend
- php artisan serve
