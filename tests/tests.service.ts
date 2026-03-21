import { ClickHouseClient } from '@clickhouse/client'
import { Injectable, OnModuleInit } from '@nestjs/common'
import { InjectClickHouse } from '../source/clickhouse.decorators'
import { TTestingDocument } from './tests.types'

@Injectable()
export class TestingClickHouseService implements OnModuleInit {
  private readonly table = 'testing_table'

  constructor(@InjectClickHouse() private readonly client: ClickHouseClient) {}

  public async onModuleInit(): Promise<void> {
    await this.client.command({
      query: `CREATE TABLE IF NOT EXISTS ${this.table} (id UUID, visits UInt32, updated DateTime) ENGINE = MergeTree() ORDER BY (id)`,
    })
  }

  public async write(documents: TTestingDocument[]): Promise<void> {
    await this.client.insert({
      format: 'JSON',
      values: documents,
      table: this.table,
    })
  }

  public async read(): Promise<TTestingDocument[]> {
    const reply = await this.client.query({
      query: `SELECT * FROM ${this.table}`,
    })
    const rows = await reply.json<TTestingDocument>()
    return rows.data
  }

  public async ping(): Promise<boolean> {
    const reply = await this.client.ping()
    return reply.success
  }
}
