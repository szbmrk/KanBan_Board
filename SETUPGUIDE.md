# KanBan_Board

## Dependencies: NodeJS, PHP, Composer, Laravel, php, phpmyadmin

a legújabb Composer-hez, minimum PHP 7.2.5 kell. A régebbi Composer verziókhoz, minimum 5.3.2-es PHP kell.

## frontend indítása:

cd frontend -> npm install (ez először kell csak /

- minden olyan bővítés után amikor új package kerül be) -> npm start
- '.env' fájl létrehozása
- '.env.example' tartalmának átmásolása a '.env-be'
- /src/api/config.js fájl létrehozása
- /src/api/config.js.example fájl tartalmának átmásolása a 'config.js-be'
- indítás után az app a localhost:3000/agi-kanban-on érhető el

## backend setupolása:

- mysql kanban_board db létrehozása
- cd backend
- composer install
- '.env' fájl létrehozása
- '.env.example' tartalmának átmásolása a '.env-be'
- ezen belül: DB_DATABASE=kanban_board
- php artisan key:generate
- php artisan serve
- php artisan migrate:fresh

## main:

cd backend

- composer require tymon/jwt-auth
- php artisan vendor:publish --provider="Tymon\JWTAuth\Providers\LaravelServiceProvider"
- php artisan jwt:secret (.env-be a konzolba kidobott értéket bele kell tenni a JWT_SECRET= után)
  -pip install requests

## backend elindítása:

- cd backend
- php artisan serve
  PHP Beállítások:

## websocket

npm install -g @soketi/soketi

php.ini fájlban:

EZEKET A SOROKAT KI KELL VENNI KOMMENTBŐL:

- extension=fileinfo
- extension=pdo_mysql
- extension=zip

Idézőjelek között megadni ennek a sornak a végén a cacert.pem elérési útját statikusan:

- curl.cainfo=

## AGI setup:

Nem kell idézőjelet használni az értékek megadásánál, csak bemásolni az értéket az = után

Példa:
OPENAI_API_KEY=example_key

OPENAI_API_KEY=
OPENAI kulcs bemásolása mögé

PYTHON_SCRIPT_PATH=
statikus elérési út a generateCode.py fájlhoz, a vége ez kell, hogy legyen:
\backend\app\PythonScripts\generateCode.py

REPLICATE_API_TOKEN=
Replicate api kulcs

LLAMA_PYTHON_SCRIPT_PATH=
statikus elérési út a llama_subtask.py fájlhoz, a vége ez kell, hogy legyen:
\backend\app\PythonScripts\llama_subtask.py

LLAMA_API_KEY=
Llama api kulcs

BARD_TOKEN=
BARD_TOKEN2=
Bard token megszerzése (Nekem mind2 ugyanaz):
Bard megnyitása böngészőben -> chatnél konzol ->application -> Cookies -> A \_\_Secure-1PSID értékének kimásolása
https://docs.google.com/document/d/1RxDdrp1tU_c9pfLSAYnv6XVhXCNDAZnZcc-SZXOGy54/edit

BARD_PYTHON_SCRIPT_PATH=
statikus elérési út a bardGetAnswer.py fájlhoz, a vége ez kell, hogy legyen:
\backend\app\PythonScripts\bardGetAnswer.py

BARD_PYTHON_SCRIPT_PATH_CODE_REVIEW_AND_DOCUMENTATION=
statikus elérési út a bardGetAnswerReviewAndDocumentation.py fájlhoz, a vége ez kell, hogy legyen:
\backend\app\PythonScripts\bardGetAnswerReviewAndDocumentation.py

PERFORMANCE_PYTHON_SCRIPT_PATH=
statikus elérési út a performanceMeasure.py fájlhoz, a vége ez kell, hogy legyen:
\backend\app\PythonScripts\performanceMeasure.py

## BARD SETUP:

- pip install bardapi
- pip install git+https://github.com/dsdanielpark/Bard-API.git
- pip install bardapi==0.1.23a

## Hasznos parancsok:

- composer config -g -- disable-tls true
- composer config -g -- disable-tls false
- composer global require "laravel/installer=~1.1"
- php –ini
- php artisan vendor:publish --provider="Tymon\JWTAuth\Providers\LaravelServiceProvider"
- composer require tymon/jwt-auth
- php artisan jwt:secret
- php artisan migrate:
- php artisan migrate:refresh
- mysql –v
- php artisan config:cache
- php -m | grep pdo_mysql
- extension=php_pdo_mysql.dll
- php extension=php_pdo_mysql.dll
- pip install requests
- composer install

## Linux csomagok:

- phpx.x (be kell az x-ek helyére helyettesíteni a verziószámot, amit a csomagkezelő megenged. Például 22.04.3 LTS (Jammy Jellyfish) package-base alatt csak php8.1 érhető el, régebbi verzióval ez könnyen eltérő lehet…)
- mysql
- nodejs (ha nem érhető el csomagkezelőben, itt vannak a külső telepítéshez használt parancsok, amiket a megfelelő package-base szerint kell telepíteni)
- phpmyadmin
- composer
- npm
- python-pip

Csomagokon keresztül telepíthető csomagok:

- composer global require "laravel/installer"

Automatikus indítás boot után a háttérben
Ha lehetséges, cron task hozható létre a backend és a frontend indításhoz is.

## Backend:

nohup php artisan serve & (/backend mappából)

## Frontend:

nohup npm run start & (/frontend mappából)

## Leállítás (mindkettő esetében):

kill {PID}

A csomagok telepítését végző parancsokhoz szükség lehet “sudo” előtag vagy SUPERUSER használatára. A többi parancsot a projekt könyvtárhoz hozzáférő bármelyik felhasználó futtathatja.

# Websocket indítása

## server:

docker run -d --name soketi -p 6001:6001 -e APP_ID=app-id -e APP_KEY=app-key -e APP_SECRET=app-secret -e DEBUG=soketi\* --restart always quay.io/soketi/soketi:latest

## local:

soketi start --config="./soketi-config.json"

backend .env fájlba:
BROADCAST_DRIVER=pusher
PUSHER_APP_ID=app-id
PUSHER_APP_KEY=app-key
PUSHER_APP_SECRET=app-secret
PUSHER_HOST=127.0.0.1
PUSHER_PORT=6001
PUSHER_SCHEME=http
PUSHER_APP_CLUSTER=eu

# megjegyzés:

ha nem működik a websocket akkor composer update és npm install
esetleg npm uninstall laravel-echo és npm install laravel-echo

# email küldés setup:

Ezek teszteléséhez mailtrap-et lehet használni
(Az üresen hagyott mezőket értelemszerűen ki kell tölteni, amik ki vannak töltve, azok példák)
Ahhoz, hogy email küldés működjön, a következőket fel kell venni a backend .env fájljába:
MAIL_MAILER=smtp
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=
MAIL_FROM_NAME=kanban
APP_URL=http://localhost:3000
QUEUE_CONNECTION=database

BACKEND_URL=http://127.0.0.1:8000
FRONTEND_URL=http://localhost:3000
