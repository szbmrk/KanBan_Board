.ONESHELL:
.PHONY: init init_frontend init_backend init_database
SHELL := bash


init: init_frontend init_backend

init_frontend:
	cd frontend/
	npm install

init_backend: init_database
	cd backend
	composer install
	cp --no-clobber .env.example .env

init_database:
	enable -n echo
	if ! [[ -v MYSQLPASSWD ]]; then
		echo -e "\033[1;32mPlease export \$$MYSQLPASSWD\033[0m"
	else
		mysql -u root --password=${MYSQLPASSWD} < <(echo "CREATE DATABASE IF NOT EXISTS kanban_board;")
	fi

bootstrap:
	cd backend
	php artisan key:generate
	php artisan migrate:fresh
	php artisan db:seed

serve:
	(cd backend/; php artisan serve --host=$(shell hostname -I | cut -d ' ' -f 1)) & (cd frontend/; npm start)
