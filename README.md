
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
