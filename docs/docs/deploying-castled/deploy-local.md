---
sidebar_position: 1
---

# Local Deployment

---

:::note
These steps have been tested on MacOS(M1 and Intel) and Ubuntu 20.04
:::

## Setting up Castled

Deploying Castled locally is fairly straightforward.

1. Make sure you have [docker](https://docs.docker.com/get-docker/) and [docker compose](https://docs.docker.com/compose/install/) installed on your local machine
2. Follow the steps below for cloning the repo and running castled services

```jsx title="Local Deployment"
git clone https://github.com/castledio/castled.git
cd castled
docker-compose up
```

3. Once all the services are up, Castled UI should be available at [http://localhost:3000/](http://localhost:3000/)
4. Let your data activation begin!