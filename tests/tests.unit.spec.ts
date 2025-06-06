import { ClickHouseClientConfigOptions } from '@clickhouse/client';
import { Faker, faker } from '@faker-js/faker';
import { describe, expect, jest, test } from '@jest/globals';
import { Injectable, Module, ValueProvider } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ClickHouseOptionsFactory } from '../source/clickhouse.interfaces';
import { ClickHouseModule } from '../source/clickhouse.module';

jest.mock('@clickhouse/client', () => ({
    createClient: jest.fn(),
}));

describe('ClickHouse > Unit', () => {
    test('forRoot()', async() => {
        const tBuilder = Test.createTestingModule({
            imports: [
                ClickHouseModule.forRoot({
                    url: faker.internet.url(),
                }),
            ],
        });
        const tFixture = await tBuilder.compile();

        const oModule = tFixture.get(ClickHouseModule);
        expect(oModule).toBeDefined();

        await tFixture.close();
    });

    test('forRootAsync with useFactory()', async() => {
        const configToken = faker.word.adjective();
        const provider: ValueProvider<Faker> = {
            provide: configToken,
            useValue: faker,
        };

        @Module({
            providers: [provider],
            exports: [provider],
        })
        class ConfigModule {}

        const tBuilder = Test.createTestingModule({
            imports: [
                ClickHouseModule.forRootAsync({
                    imports: [ConfigModule],
                    useFactory: (f: Faker) => ({
                        url: f.internet.url(),
                    }),
                    inject: [configToken],
                }),
            ],
        });
        const tFixture = await tBuilder.compile();

        const oModule = tFixture.get(ClickHouseModule);
        expect(oModule).toBeInstanceOf(ClickHouseModule);

        await tFixture.close();
    });

    test('forRootAsync with useExisting()', async() => {
        @Injectable()
        class ClickHouseConfig implements ClickHouseOptionsFactory {
            public createClickHouseOptions(): ClickHouseClientConfigOptions {
                return {
                    url: faker.internet.url(),
                };
            }
        }

        @Module({
            providers: [ClickHouseConfig],
            exports: [ClickHouseConfig],
        })
        class ConfigModule {}

        const tBuilder = Test.createTestingModule({
            imports: [
                ClickHouseModule.forRootAsync({
                    imports: [ConfigModule],
                    useExisting: ClickHouseConfig,
                }),
            ],
        });
        const tFixture = await tBuilder.compile();

        const oModule = tFixture.get(ClickHouseModule);
        expect(oModule).toBeInstanceOf(ClickHouseModule);

        await tFixture.close();
    });
});
