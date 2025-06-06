export class ClickHouseTokens {
    public static getOptions(): string {
        return String('clickhouse_module_options');
    }

    public static getClient(): string {
        return String('clickhouse_module_client');
    }
}
