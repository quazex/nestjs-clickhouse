export interface TestingData {
    id: string;
    visits: number;
    updated: string;
}

export interface TestingClickHouseService {
    exec: (query: string) => Promise<void>;
    write: (data: TestingData[]) => Promise<void>;
    read: () => Promise<TestingData[]>;
    ping: () => Promise<boolean>;
}
