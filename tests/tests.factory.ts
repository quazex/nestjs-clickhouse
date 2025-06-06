import { ClickHouseClient } from '@clickhouse/client';
import { faker } from '@faker-js/faker';
import { FactoryProvider } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ClickHouseContainer, StartedClickHouseContainer } from '@testcontainers/clickhouse';
import { ClickHouseModule } from '../source/clickhouse.module';
import { ClickHouseTokens } from '../source/clickhouse.tokens';
import { TestingClickHouseService, TestingData } from './tests.types';

export class TestingClickHouseFactory {
    private _testing: TestingModule;
    private _container: StartedClickHouseContainer;

    private _token = faker.string.alpha({ length: 10 });
    private _table = faker.string.alpha({ length: 10, casing: 'lower' });

    public async init(): Promise<void> {
        const tContainer = new ClickHouseContainer();
        this._container = await tContainer.withReuse().start();

        const tProvider: FactoryProvider<TestingClickHouseService> = {
            provide: this._token,
            useFactory: (client: ClickHouseClient) => ({
                onApplicationShutdown: async(): Promise<void> => {
                    await client.close();
                },
                exec: async(command): Promise<void> => {
                    await client.command({
                        query: command,
                    });
                },
                write: async(documents): Promise<void> => {
                    await client.insert({
                        format: 'JSON',
                        values: documents,
                        table: this._table,
                    });
                },
                read: async(): Promise<TestingData[]> => {
                    const reply = await client.query({
                        query: `SELECT * FROM ${this._table}`,
                    });
                    const rows = await reply.json<TestingData>();
                    return rows.data;
                },
                ping: async(): Promise<boolean> => {
                    const reply = await client.ping();
                    return reply.success;
                },
            }),
            inject: [
                ClickHouseTokens.getClient(),
            ],
        };

        const tModule = Test.createTestingModule({
            imports: [
                ClickHouseModule.forRoot({
                    url: this._container.getHttpUrl(),
                    username: this._container.getUsername(),
                    password: this._container.getPassword(),
                    database: this._container.getDatabase(),
                }),
            ],
            providers: [
                tProvider,
            ],
        });

        this._testing = await tModule.compile();
        this._testing = await this._testing.init();

        this._testing.enableShutdownHooks();

        await this.service.exec(`
            CREATE TABLE ${this._table}
            (
                id UUID,
                visits UInt32,
                updated DateTime
            )
            ENGINE = MergeTree()
            ORDER BY (id)
        `);
    }

    public async close(): Promise<void> {
        await this._testing.close();
        await this._container.stop();
    }

    public get service(): TestingClickHouseService {
        return this._testing.get<TestingClickHouseService>(this._token);
    }
}
