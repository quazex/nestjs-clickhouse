import { Test, TestingModule } from '@nestjs/testing'
import { ClickHouseContainer, StartedClickHouseContainer } from '@testcontainers/clickhouse'
import { ClickHouseModule } from '../source/clickhouse.module'
import { TestingClickHouseService } from './tests.service'

export class TestingClickHouseFactory {
  private _testing: TestingModule
  private _container: StartedClickHouseContainer

  public async init(): Promise<void> {
    const tContainer = new ClickHouseContainer('clickhouse:26.2.4')
    this._container = await tContainer.withReuse().start()

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
        TestingClickHouseService,
      ],
    })

    this._testing = await tModule.compile()
    this._testing = await this._testing.init()

    this._testing.enableShutdownHooks()
  }

  public async close(): Promise<void> {
    await this._testing.close()
    await this._container.stop()
  }

  public get service(): TestingClickHouseService {
    return this._testing.get(TestingClickHouseService)
  }
}
