# KanBan_Board

## Installálás

### Automatizált

#### Dependenciák
 + Make
 + (running) mysql server

#### Hogyan?
A project gyökerében található Make script igénybe vételével:
```Bash
make
```
Ez inicializálja a projecktet,
utánna kézzel szerkeszd a `backend/.env` fájl-t.
Egy átlagos installálásnál elég a:
```BASH
DB_USERNAME=    # ...
DB_PASSWORD=    # ...
```
sorokat átírni.
Ezután a
```Bash
make bootstrap
```
parancs migrálja és seedeli az adatbázist.

Kényelmi okokból, a:
```Bash
make serve
```
is elérhető a project futtatására.

### Manuális
frontend indítása:

cd frontend -> npm install (ez először kell csak / minden pullnál) -> npm start


backend setupolása:

- cd backend
- composer install
- '.env' fájl létrehozása
- '.env.example' tartalmának átmásolása a '.env-be'
- ezen belül: DB_DATABASE=kanban_board
- php artisan key:generate
- php artisan migrate:fresh
- php artisan db:seed
- php artisan serve

backend elindítása:

- cd backend
- php artisan serve


main:
cd backend
- php artisan vendor:publish --provider="Tymon\JWTAuth\Providers\LaravelServiceProvider"
- composer require tymon/jwt-auth
- php artisan jwt:secret



AGI_Integration_Tests branchben a .env fájlban:

- OPENAI_API_KEY=ide jön a openai kulcs
- PYTHON_SCRIPT_PATH='ide jön a python script elérési útvonala'
