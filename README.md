# Nest.js Products API
A Nest.js-based microservices project consisting of two services:
- **Products Service** - manages product data (CRUD operations).
- **Notifications Service** - listens to events from the **Products** service and logs creation/deletion events.

## Prerequisites
Before you begin, ensure you have the following installed on your system:
- Node.js
- Docker - for local development and testing
- AWS CLI - for managing SQS locally with LocalStack

## Installation

1. Clone the repository:
```
git clone https://github.com/AlexRazor1337/univ-test-task.git
```

2. Change into the project directory:
```
cd univ-test-task
```

3. Install the project dependencies:
```
pnpm install
```
*Note* - you can also use `npm`.

4. Setup `.env` files:
Each microservice has it's own env file, which are placed at `apps/*`.
Rename the respective `example.env` to `.env` and change the data if needed.
5. Run the Docker containers with needed services(for local development):
```
docker compose up -d
```

6. Create SQS queue:
```
aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name product-events
```
Then copy resulting `QueueUrl` into `.env` file, `PRODUCT_EVENTS_QUEUE_URL` field.

7. Apply database migrations:
To run migrations for a service, use with respective config file:
```
npx drizzle-kit push --config apps/products/src/db/drizzle.config.ts
```

8. Build the app:
```
npm run build
```

9. Run:
```
npm run start products
```

and in another session

```
npm run start notifications
```

## Documentation
Documentation can be found at `http://localhost:3000/docs` if `NODE_ENV` is set to `development`.

## Monitoring
Local Prometheus from Docker could be found at `http://localhost:9090`.
There you can access Node.js metrics like used memory, total HTTP requests (`http_requests_total`), and products metrics (`products_created_total`, `products_deleted_total`).

## Testing
To run the tests, use the following command:
```
npm run test
```

## Generate a migration
To generate a migration, run drizzle kit with respective service config file:
```
npx drizzle-kit generate --config apps/xxxxx/src/db/drizzle.config.ts
```
