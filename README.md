# NestJS ClickHouse Module

Core features:

- Based on [official ClickHouse client for NodeJS](https://github.com/ClickHouse/clickhouse-js);
- Supports multiple instances;
- Covered with unit and e2e tests;
- Basic module without unnecessary boilerplate.

## Installation

To install the package, run:

```sh
npm install @quazex/nestjs-clickhouse @clickhouse/client
```

## Usage

### Importing the Module

To use the ClickHouse module in your NestJS application, import it into your root module (e.g., `AppModule`).

```typescript
import { Module } from '@nestjs/common';
import { ClickHouseModule } from '@quazex/nestjs-clickhouse';

@Module({
  imports: [
    ClickHouseModule.forRoot({
        name: 'my-clickhouse', // optional
        url: 'https://localhost:8123',
        username: 'your-username',
        password: 'your-password',
        database: 'your-database',
    }),
  ],
})
export class AppModule {}
```

### Using ClickHouse Service

Once the module is registered, you can inject instance of `ClickHouseClient` into your providers:

```typescript
import { Injectable } from '@nestjs/common';
import { ClickHouseClient } from '@clickhouse/client';
import { InjectClickHouse } from '@quazex/nestjs-clickhouse';

@Injectable()
export class DatabaseService {
    constructor(@InjectClickHouse() private readonly clickHouseClient: ClickHouseClient) {}

    async insert(table: string, body: any) {
        await this.clickHouseClient.insert({
            format: 'JSONEachRow',
            table: table,
            values: body,
        });
    }

    async search(table: string) {
        const response = await this.clickHouseClient.query({
            format: 'JSONEachRow',
            query: `SELECT * FROM ${table}`,
        });
        const rows = await response.json<object>();
        return rows;
    }
}
```

### Async Configuration

If you need dynamic configuration, use `forRootAsync`:

```typescript
@Module({
    imports: [
        ClickHouseModule.forRootAsync({
            useFactory: async () => ({
                url: process.env.CLICKHOUSE_URL,
                username: process.env.CLICKHOUSE_USERNAME,
                password: process.env.CLICKHOUSE_PASSWORD,
                database: process.env.CLICKHOUSE_DATABASE,
            }),
        }),
    ],
})
export class AppModule {}
```

### Graceful shutdown

By default, this module doesn't manage client connection on application shutdown. You can read more about lifecycle hooks on the NestJS [documentation page](https://docs.nestjs.com/fundamentals/lifecycle-events#application-shutdown). 

```typescript
// main.ts
const app = await NestFactory.create(AppModule);

app.useLogger(logger);
app.enableShutdownHooks(); // <<<

app.setGlobalPrefix('api');
app.enableVersioning({
    type: VersioningType.URI,
});

await app.listen(appConfig.port, '0.0.0.0');
```

```typescript
// app.bootstrap.ts
import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { ClickHouseClient } from '@clickhouse/client';
import { InjectClickHouse } from '@quazex/nestjs-clickhouse';

@Injectable()
export class AppBootstrap implements OnApplicationShutdown {
    constructor(@InjectClickHouse() private readonly clickHouseClient: ClickHouseClient) {}

    public async onApplicationShutdown(): Promise<void> {
        await this.clickHouseClient.close();
    }
}
```

## License

MIT
