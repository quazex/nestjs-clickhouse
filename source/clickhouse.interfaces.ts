import { ClickHouseClientConfigOptions } from '@clickhouse/client';
import { InjectionToken, ModuleMetadata, OptionalFactoryDependency, Type } from '@nestjs/common';

export interface ClickHouseOptionsFactory {
    createClickHouseOptions(): Promise<ClickHouseClientConfigOptions> | ClickHouseClientConfigOptions;
}

export interface ClickHouseAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
    inject?: Array<InjectionToken | OptionalFactoryDependency>;
    useExisting?: Type<ClickHouseOptionsFactory>;
    useFactory?: (...args: any[]) => Promise<ClickHouseClientConfigOptions> | ClickHouseClientConfigOptions;
}
