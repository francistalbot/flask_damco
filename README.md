# Flask Damco

A Php/React application to search the Damco catalogue and return description, price and availability

## Installation
### Prerequisite 
- PHP (compatible version with Laravel)
- Composer
- Node.js (>=16) and npm
- Local Web Server (or use `php artisan serve`)

### Installation steps

1. Clone the repository

```bash
git clone (https://github.com/francistalbot/flask_damco)
```

2. Install Prerequisite

Check your version of PHP with

```bash
php -v
composer -v
npm -v
node -v
```

#### For MacOs
   
```bash
brew install php@8.2
```
#### For Linux
   
```bash
sudo apt update
sudo apt install php8.2 php8.2-cli php8.2-common php8.2-intl php8.2-mysql php8.2-xml php8.2-mbstring
sudo apt install composer
sudo apt install npm
sudo apt install nodejs
```
#### For Windows
Install manually from https://windows.php.net/

3. Create PHP and javascript dependancies and compile front-end assets
 
```bash
composer install
npm install
npm run build
```
4. Configuration of the environnement file

```bash
cp .env.example .env
```
Then edit the `.env` file and chage the value of the`DAMCO_USERNAME` and `DAMCO_PASSWORD` variables to the proper credentials to log in to the Damco website.

5. Generate Laravel app key and start the server

```bash
php artisan key:generate
php artisan serve
```

