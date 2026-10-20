# form-api

Forum REST API monolith (users, threads, posts) — Node.js/Express 5 with in-memory storage, packaged with Docker. Built as Phase 1 of the ECS practical, with routes split per resource so they can be separated into microservices later.

## Tech stack

- Node.js 20, Express 5
- In-memory store (data resets on restart)

## API

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/` | Service index and status |
| GET | `/users` | List users |
| POST | `/users` | Create user (`name`, `email`) |
| GET | `/users/:id` | Get user |
| PATCH | `/users/:id` | Update user |
| DELETE | `/users/:id` | Delete user (cascades) |
| GET | `/threads` | List threads (`?userId=` filter) |
| POST | `/threads` | Create thread (`title`, `userId`) |
| GET | `/threads/:id` | Get thread |
| PATCH | `/threads/:id` | Update thread (`title`) |
| DELETE | `/threads/:id` | Delete thread (cascades to posts) |
| GET | `/posts` | List posts (`?threadId=`, `?userId=` filters) |
| POST | `/posts` | Create post (`threadId`, `userId`, `body`) |
| GET | `/posts/:id` | Get post |
| PATCH | `/posts/:id` | Update post (`body`) |
| DELETE | `/posts/:id` | Delete post |

Validation errors return `400 { "error": "..." }`, missing resources return `404`, deletes return `204`.

## Run locally

```bash
npm install
npm start        # http://localhost:3000  (override with PORT=3005 npm start)
```

## Run with Docker

```bash
docker build -t my-monolith-app .
docker run -d --name form-api -p 3000:3000 my-monolith-app
```

If host port 3000 is taken, map another one (container still listens on 3000):

```bash
docker run -d --name form-api -p 3005:3000 my-monolith-app
```

## Test

```bash
curl http://localhost:3000/

curl -X POST http://localhost:3000/users -H "Content-Type: application/json" -d '{"name":"Alice","email":"alice@example.com"}'

curl -X POST http://localhost:3000/threads -H "Content-Type: application/json" -d '{"title":"Hello","userId":"<USER_ID>"}'

curl -X POST http://localhost:3000/posts -H "Content-Type: application/json" -d '{"threadId":"<THREAD_ID>","userId":"<USER_ID>","body":"first post"}'

curl "http://localhost:3000/posts?threadId=<THREAD_ID>"
```

## Cleanup

```bash
docker stop form-api
docker rm form-api
docker rmi my-monolith-app
```
