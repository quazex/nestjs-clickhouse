import { ClickHouseClientConfigOptions } from '@clickhouse/client';
import { DynamicModule, Global, Module } from '@nestjs/common';
import { ClickHouseAsyncOptions } from './clickhouse.interfaces';
import { ClickHouseProviders } from './clickhouse.providers';

@Global()
@Module({})
export class ClickHouseModule {
    public static forRoot({ name, ...options }: ClickHouseClientConfigOptions & { name?: string }): DynamicModule {
        const optionsProvider = ClickHouseProviders.getOptions(options, name);
        const clientProvider = ClickHouseProviders.getClient(name);

        const dynamicModule: DynamicModule = {
            module: ClickHouseModule,
            providers: [
                optionsProvider,
                clientProvider,
            ],
            exports: [
                clientProvider,
            ],
        };
        return dynamicModule;
    }


    public static forRootAsync(asyncOptions: ClickHouseAsyncOptions): DynamicModule {
        const optionsProvider = ClickHouseProviders.getAsyncOptions(asyncOptions);
        const clientProvider = ClickHouseProviders.getClient(asyncOptions.name);

        const dynamicModule: DynamicModule = {
            module: ClickHouseModule,
            imports: asyncOptions.imports,
            providers: [
                optionsProvider,
                clientProvider,
            ],
            exports: [
                clientProvider,
            ],
        };

        return dynamicModule;
    }
}
