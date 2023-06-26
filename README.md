## GIT

Download and run the branch named: PROD, it is the one used in the production environment
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

2. launch the container running the command `Docker run your-app-name:tag (livelink:v1.0)`

3. Tag your immage running the command `docker tag your-id/your-app-name:tag (livelink:v1.0 cristiano0121/livelink:v1.0)`

4. To push your Docker image on your Docker Hub repo run this command `docker push your-id/your-app-name:tag (cristiano0121/livelink:v1.0)`

5. Tag your image to push it on Heroku repo running this command `docker tag tag your-id/your-app-name:tag registry.heroku.com/your-heroku-repo/web (cristiano0121/livelink:v1.0 registry.heroku.com/livelink-docker/web)`

6. To manage images run the command `docker images` (optional)

7. To push the new Heroku image to Docker Hub run the command `docker push registry.heroku.com/your-heroku-repo (livelink-docker)/web`

8. To release your image on Heroku run this command `heroku container:release web --app your-heroku-repo (livelink-docker)`

9. To open the app run this command `heroku open --app your-heroku-app (livelink-docker)`

## Kubernetes

Kubernetes need minikube to be installed, on MacOs run this command: `brew install minikube` 

you need to start it running this command `minikube start`.

If you need to check minikube status, you have to run this command `minikube status`.

## Td-agent

You have to install the Td-agent on MacOs to collect and send your logs to Elasticsearch,
you should run this command `brew install td-agent`

You should install fluent-plugin-elasticsearch run this command `sudo gem install fluent-plugin-elasticsearch`

Lounch this command to start Td-agent `sudo fluentd -c /etc/td-agent/td-agent.conf`

## Elasticsearch

You have to install Elasticsearch from the original website to get logs from Fluentd `https://www.elastic.co/downloads/elasticsearch`

Once Elasticsearch is installed you should run this command `path/elasticsearch`.

To check if everything is correctly set visit this website `https://localhost:9200/`

## Kibana

You have to install Kibana from the original website to display your logs `https://www.elastic.co/downloads/kibana`

Once Elasticsearch is installed you should run this command `path/kibana`.

To check if everything is correctly set visit this website `https://localhost:5601/`

## LINKS

LiveLink App : `https://livelink-docker.herokuapp.com/a672b151-b891-4b33-aa20-f54494cb9e2b`

Docker Repo: `https://hub.docker.com/repository/docker/cristiano0121/livelink/general`

GitHub Repo: `https://github.com/Cristiano-21/LiveLink`

Heroku repo: `https://dashboard.heroku.com/apps/livelink-docker`
