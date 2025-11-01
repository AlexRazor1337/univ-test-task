
### Generate a migration
To generate a migration, run drizzle kit with respective service config file:
```
npx drizzle-kit generate --config apps/xxxxx/src/db/drizzle.config.ts
```
### Run migrations
To run migrations for a service, use with respective config file:
```
npx drizzle-kit push --config apps/xxxxx/src/db/drizzle.config.ts
```

### Create SQS Queue
```
aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name product-events
```

Then copy resulting `QueueUrl` into `.env` file.
