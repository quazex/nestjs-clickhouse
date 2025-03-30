export class ClickHouseUtilities {
    private static getCommon(type: string, name?: string): string {
        const prefix = name?.toString();
        const token = ['clickhouse', 'module', prefix ?? 'default', type];
        return token.filter(Boolean).join('_');
    }

    public static getOptionsToken(name?: string): string {
        return this.getCommon('options', name);
    }

    public static getClientToken(name?: string): string {
        return this.getCommon('table', name);
    }
}
