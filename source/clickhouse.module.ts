import { ClickHouseClient, ClickHouseClientConfigOptions } from '@clickhouse/client'
import { DynamicModule, Global, Module, OnModuleDestroy } from '@nestjs/common'
import { InjectClickHouse } from './clickhouse.decorators'
import { ClickHouseAsyncOptions } from './clickhouse.interfaces'
import { ClickHouseProviders } from './clickhouse.providers'

@Global()
@Module({})
export class ClickHouseModule implements OnModuleDestroy {
  constructor(@InjectClickHouse() private readonly client: ClickHouseClient) {}

  public async onModuleDestroy(): Promise<void> {
    await this.client.close()
  }

  public static forRoot(options: ClickHouseClientConfigOptions): DynamicModule {
    const optionsProvider = ClickHouseProviders.getOptions(options)
    const clientProvider = ClickHouseProviders.getClient()

    const dynamicModule: DynamicModule = {
      module: ClickHouseModule,
      providers: [
        optionsProvider,
        clientProvider,
      ],
      exports: [
        clientProvider,
      ],
    }
    return dynamicModule
  }


  public static forRootAsync(asyncOptions: ClickHouseAsyncOptions): DynamicModule {
    const optionsProvider = ClickHouseProviders.getAsyncOptions(asyncOptions)
    const clientProvider = ClickHouseProviders.getClient()

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
    }

    return dynamicModule
  }
}
