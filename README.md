## Requirements

docker
docker-compose

## Instructions to run

1. Copy the .env.docker.example and raname the copy to .env.docker
2. Add the tmdb api key to the .env.docker
3. use the comand docker-compose up

The api is up and running on localhost:5000 :)

## Architeture

I've created a cache component to store the requests.
To load the data I created a loader for each possible provider (cache and api).
Then I managed all the data on the services, which are responsible by filtering data and adding data on the cache.
My next step would be to create a main loader, who would be responsible by handling the api/cache.

## Assumptions

It is important to get the list of movies updated
The details of a movie do not change all the time

## Third-party libs

1. [express](https://www.npmjs.com/package/express "express"): used to manage my requests from frontend and middlewares
2. [axios](https://www.npmjs.com/package/axios "axios"): used to store the tdbm api key and manage requests to the third part api
3. [ioredis](https://www.npmjs.com/package/ioredis "ioredis"): used to connect and to manage the redis instance
4. [ioredis-mock](https://www.npmjs.com/package/ioredis-mock "ioredis-mock"): used to test code that uses redis
5. [jest](https://www.npmjs.com/package/jest "jest"): used to test my functions
6. [typescript](https://www.npmjs.com/package/typescript "typescript"): used to compile and static type checking the application
