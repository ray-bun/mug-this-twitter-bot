### Useful docker commands

Run docker image even after you reboot
https://docs.docker.com/config/containers/start-containers-automatically/

```
docker run -d --restart unless-stopped [imagename]
```

Peak into the running container to see if there's any error

```
docker container ls
docker logs --follow [CONTAINER_ID]

```

### How to build docker image

1. Create .github/workflows folders and then create main.yml file
2. Set github secret keys for the repository and then pass the environment variables via --build-arg. See main.yml and Dockerfiles as an example

### Updating docker image/container

```
docker container ls
docker stop my_container
docker image ls
docker rmi -f imageID
```
