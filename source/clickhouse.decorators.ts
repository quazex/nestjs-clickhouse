import { Inject } from '@nestjs/common'
import { ClickHouseTokens } from './clickhouse.tokens'

export const InjectClickHouse = (): ReturnType<typeof Inject> => (
  Inject(ClickHouseTokens.CLIENT)
)
