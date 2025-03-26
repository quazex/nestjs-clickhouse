import { Inject } from '@nestjs/common';
import { ClickHouseUtilities } from './clickhouse.utilities';

export const InjectClickHouse = (name?: string): ReturnType<typeof Inject> => {
    const token = ClickHouseUtilities.getClientToken(name);
    return Inject(token);
};
