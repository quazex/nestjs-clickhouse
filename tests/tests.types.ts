import { OnApplicationShutdown } from '@nestjs/common';

export interface TestingData {
    id: string;
    visits: number;
    updated: string;
}

export interface TestingClickHouseService extends OnApplicationShutdown {
    exec: (query: string) => Promise<void>;
    write: (data: TestingData[]) => Promise<void>;
    read: () => Promise<TestingData[]>;
    ping: () => Promise<boolean>;
}
