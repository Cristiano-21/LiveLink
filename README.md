## How to run the project (local)

1. Clone this repository in your local system.
2. Open the command prompt from your project directory and run the command `npm install`.
3. Open the command prompt from your project directory and run the command `npm start`.
4. Go to your browser and type `http://127.0.0.1:3030/` in the address bar.

## How to log in to Heroku platform

1. To log into your Heroku account run the command `heroku login`
2. To connect to your Heroku app run the command `heroku git:remote -a livelink-docker`

## How to create a Docker image

1. Create the Docker image running the command `docker build -t livelink:v1.0 .`
2. launch the container runing the command `Docker run your-app-name:tag (livelink:v1.0)`
3. Tag your immage running the command `docker tag your-id/your-app-name:tag (livelink:v1.0 cristiano0121/livelink:v1.0)`
4. To push your Docker image on your repo in Docker Hub run this command `docker push your-id/your-app-name:tag (cristiano0121/livelink:v1.0)`
5. Tag your image to push it on Heroku running this command `docker tag tag your-id/your-app-name:tag registry.heroku.com/your-heroku-repo/web (cristiano0121/livelink:v1.0 registry.heroku.com/livelink-docker/web)`
6. To manage your run the command `docker images` (facoltativo)
7. To push the new Heroku image to Docker Hub run the command `docker push registry.heroku.com/your-heroku-repo (livelink-docker)/web`
8. To release your image on Heroku run this command `heroku container:release web --app your-heroku-repo (livelink-docker)`
9. To open the app run this command `heroku open --app your-heroku-app (livelink-docker)`
