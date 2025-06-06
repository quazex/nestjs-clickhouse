# NestJS ClickHouse Module

Core features:

- Based on [official ClickHouse client for NodeJS](https://github.com/ClickHouse/clickhouse-js);
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
    constructor(@InjectClickHouse() private readonly client: ClickHouseClient) {}

    async insert(table: string, body: any) {
        await this.client.insert({
            format: 'JSONEachRow',
            table: table,
            values: body,
        });
    }

    async search(table: string) {
        const response = await this.client.query({
            format: 'JSONEachRow',
            query: `SELECT * FROM ${table}`,
        });
        const rows = await response.json();
        return rows;
    }
}
```

### Async Configuration

If you need dynamic configuration, use `forRootAsync`:

```typescript
import { Module } from '@nestjs/common';
import { ClickHouseModule } from '@quazex/nestjs-clickhouse';

@Module({
    imports: [
        ClickHouseModule.forRootAsync({
            useFactory: async (config: SomeConfigProvider) => ({
                url: config.CLICKHOUSE_URL,
                username: config.CLICKHOUSE_USERNAME,
                password: config.CLICKHOUSE_PASSWORD,
                database: config.CLICKHOUSE_DATABASE,
            }),
            inject: [
                SomeConfigProvider,
            ],
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

// Starts listening for shutdown hooks
app.enableShutdownHooks(); // <<<

await app.listen(process.env.PORT ?? 3000);
```

```typescript
// app.bootstrap.ts
import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { ClickHouseClient } from '@clickhouse/client';
import { InjectClickHouse } from '@quazex/nestjs-clickhouse';

@Injectable()
export class AppBootstrap implements OnApplicationShutdown {
    constructor(@InjectClickHouse() private readonly client: ClickHouseClient) {}

    public async onApplicationShutdown(): Promise<void> {
        await this.client.close();
    }
}
```

## License

MIT
