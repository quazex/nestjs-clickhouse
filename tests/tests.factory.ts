import { ClickHouseClient } from '@clickhouse/client';
import { faker } from '@faker-js/faker';
import { FactoryProvider } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ClickHouseModule } from '../source/clickhouse.module';
import { ClickHouseUtilities } from '../source/clickhouse.utilities';
import { ClickHouseContainerGeneric, ClickHouseContainerStarted } from './tests.container';
import { TestingClickHouseService, TestingData } from './tests.types';

export class TestingClickHouseFactory {
    private _testing: TestingModule;
    private _container: ClickHouseContainerStarted;

    private _token = faker.string.alpha({ length: 10 });
    private _table = faker.string.alpha({ length: 10, casing: 'lower' });

    public async init(): Promise<void> {
        const tContainer = new ClickHouseContainerGeneric();
        this._container = await tContainer.start();

        const tProvider: FactoryProvider<TestingClickHouseService> = {
            provide: this._token,
            useFactory: (client: ClickHouseClient) => ({
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
                ClickHouseUtilities.getClientToken(),
            ],
        };

        const tModule = Test.createTestingModule({
            imports: [
                ClickHouseModule.forRoot({
                    url: this._container.getUrl(),
                    username: tContainer.options.username,
                    password: tContainer.options.password,
                    database: tContainer.options.database,
                }),
            ],
            providers: [
                tProvider,
            ],
        });

        this._testing = await tModule.compile();

        const service = this.getService();
        await service.exec(`
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
        const token = ClickHouseUtilities.getClientToken();
        const client = this._testing.get<ClickHouseClient>(token);

        await client.close();
        await this._testing.close();
        await this._container.stop();
    }

    public getService(): TestingClickHouseService {
        return this._testing.get<TestingClickHouseService>(this._token);
    }
}
