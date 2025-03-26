import { AbstractStartedContainer, GenericContainer, Wait } from 'testcontainers';

export class ClickHouseContainerOptions {
    public readonly port = 8123;
    public readonly username = 'testcontainers';
    public readonly password = 'testcontainers';
    public readonly database = 'testcontainers';
}

export class ClickHouseContainerGeneric extends GenericContainer {
    public readonly options = new ClickHouseContainerOptions();

    constructor(image = 'clickhouse/clickhouse-server:25.3-alpine') {
        super(image);
        this
            .withEnvironment({
                CLICKHOUSE_USER: this.options.username,
                CLICKHOUSE_PASSWORD: this.options.password,
                CLICKHOUSE_DB: this.options.database,
                CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT: '1',
            })
            .withExposedPorts({
                host: this.options.port,
                container: this.options.port,
            })
            .withAddedCapabilities(
                'SYS_NICE',
                'NET_ADMIN',
                'IPC_LOCK',
            )
            .withWaitStrategy(Wait.forHttp('/', this.options.port))
            .withStartupTimeout(60_000)
            .withReuse();
    }

    public override async start(): Promise<ClickHouseContainerStarted> {
        const container = await super.start();
        return new ClickHouseContainerStarted(container);
    }
}

export class ClickHouseContainerStarted extends AbstractStartedContainer {
    public getUrl(): string {
        const host = this.getHost();
        const port = this.getFirstMappedPort();
        return `http://${host}:${port}`;
    }
}
