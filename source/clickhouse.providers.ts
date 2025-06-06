import { createClient, ClickHouseClient, ClickHouseClientConfigOptions } from '@clickhouse/client';
import { FactoryProvider, Provider, ValueProvider } from '@nestjs/common';
import { ClickHouseAsyncOptions, ClickHouseOptionsFactory } from './clickhouse.interfaces';
import { ClickHouseTokens } from './clickhouse.tokens';

export class ClickHouseProviders {
    public static getOptions(options: ClickHouseClientConfigOptions): ValueProvider<ClickHouseClientConfigOptions> {
        const optionsToken = ClickHouseTokens.getOptions();
        return {
            provide: optionsToken,
            useValue: options,
        };
    }

    public static getAsyncOptions(options: ClickHouseAsyncOptions): Provider<ClickHouseClientConfigOptions> {
        const optionsToken = ClickHouseTokens.getOptions();
        if (options.useFactory) {
            return {
                provide: optionsToken,
                useFactory: options.useFactory,
                inject: options.inject,
            };
        }
        if (options.useExisting) {
            return {
                provide: optionsToken,
                useFactory: async(factory: ClickHouseOptionsFactory): Promise<ClickHouseClientConfigOptions> => {
                    const client = await factory.createClickHouseOptions();
                    return client;
                },
                inject: [options.useExisting],
            };
        }
        throw new Error('Must provide useFactory or useClass');
    }

    public static getClient(): FactoryProvider<ClickHouseClient> {
        const optionsToken = ClickHouseTokens.getOptions();
        const clientToken = ClickHouseTokens.getClient();
        return {
            provide: clientToken,
            useFactory: (options: ClickHouseClientConfigOptions) => createClient(options),
            inject: [optionsToken],
        };
    }
}
