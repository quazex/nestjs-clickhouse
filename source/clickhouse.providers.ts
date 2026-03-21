import { createClient, ClickHouseClient, ClickHouseClientConfigOptions } from '@clickhouse/client'
import { FactoryProvider, Provider, ValueProvider } from '@nestjs/common'
import { ClickHouseAsyncOptions, ClickHouseOptionsFactory } from './clickhouse.interfaces'
import { ClickHouseTokens } from './clickhouse.tokens'

export class ClickHouseProviders {
  public static getOptions(options: ClickHouseClientConfigOptions): ValueProvider<ClickHouseClientConfigOptions> {
    return {
      provide: ClickHouseTokens.OPTIONS,
      useValue: options,
    }
  }

  public static getAsyncOptions(options: ClickHouseAsyncOptions): Provider<ClickHouseClientConfigOptions> {
    if (options.useFactory) {
      return {
        provide: ClickHouseTokens.OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject,
      }
    }
    if (options.useExisting) {
      return {
        provide: ClickHouseTokens.OPTIONS,
        useFactory: async(factory: ClickHouseOptionsFactory): Promise<ClickHouseClientConfigOptions> => {
          const client = await factory.createClickHouseOptions()
          return client
        },
        inject: [options.useExisting],
      }
    }
    throw new Error('Must provide useFactory or useClass')
  }

  public static getClient(): FactoryProvider<ClickHouseClient> {
    return {
      provide: ClickHouseTokens.CLIENT,
      useFactory: (options: ClickHouseClientConfigOptions) => createClient(options),
      inject: [
        ClickHouseTokens.OPTIONS,
      ],
    }
  }
}
