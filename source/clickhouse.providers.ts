import { createClient, ClickHouseClient, ClickHouseClientConfigOptions } from '@clickhouse/client';
import { FactoryProvider, Provider, ValueProvider } from '@nestjs/common';
import { ClickHouseAsyncOptions, ClickHouseOptionsFactory } from './clickhouse.interfaces';
import { ClickHouseUtilities } from './clickhouse.utilities';

export class ClickHouseProviders {
    public static getOptions(options: ClickHouseClientConfigOptions, name?: string): ValueProvider<ClickHouseClientConfigOptions> {
        const optionsToken = ClickHouseUtilities.getOptionsToken(name);
        return {
            provide: optionsToken,
            useValue: options,
        };
    }

    public static getAsyncOptions(options: ClickHouseAsyncOptions): Provider<ClickHouseClientConfigOptions> {
        const optionsToken = ClickHouseUtilities.getOptionsToken(options.name);
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

    public static getClient(name?: string): FactoryProvider<ClickHouseClient> {
        const optionsToken = ClickHouseUtilities.getOptionsToken(name);
        const clientToken = ClickHouseUtilities.getClientToken(name);
        return {
            provide: clientToken,
            useFactory: (options: ClickHouseClientConfigOptions) => createClient(options),
            inject: [optionsToken],
        };
    }
}
