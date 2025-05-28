# Basic Info
Docker containers are set up to run on ports: 

8000 backend 

3000 frontend

8080 user frontend (built version)

If you need to change these port please update corresponding dockerfiles, docker-compose.yaml as well as nginx configuration in /nginx/default.conf and backend script found in backend/entrypoint.sh

All other stuff such as dependencies, laravel .env file and secure key generation are automated in the backend/entrypoint.sh file (for now)


# Prerequisites 
Docker installed on local machine

# Getting Started

### 1. Download repository from git
Download the whole project

### 2. Update path (optional - only if neccesary)
Update path for apicalls in frontend/src/config.js if needed (or server or when using another port)
If you have issues iwth authorization or ports mismatch also update default.conf in nginx folder and/or vite.config.js in frontend folder

### 3. Run the containers
Simply go to the main root project directory and run: 
##### "docker-compose up --build"

### 4. Add data(optional - only if you want to use with local data in csv files instead of database)
To add the date you need to create folder named "data" in the main root project directory (default called BP2025)

In this folder the path to data should be /balance/yahoo/data/(your final folders with data) - this folders mush have unique names and in each of them needs to be subfolders
with names in format "model_TOP50_(number)_stoploss _(number)" - in each of these needs to be file balance.csv which is required to have columns data and gain.

example of how the data should look like is in folder data_example

### 5. Create static build Frontend
After making any changes to frontend (changing url or adding some func) u need to build (go to terminal in docker container for frontend and run "npm run build")
