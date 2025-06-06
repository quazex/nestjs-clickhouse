import { faker } from '@faker-js/faker';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import { DateTime } from 'luxon';
import { TestingClickHouseFactory } from './tests.factory';
import { TestingData } from './tests.types';

describe('ClickHouse > E2E', () => {
    const tModule = new TestingClickHouseFactory();

    beforeAll(tModule.init.bind(tModule));
    afterAll(tModule.close.bind(tModule));

    test('Check connection', async() => {
        const isHealth = await tModule.service.ping();
        expect(isHealth).toBe(true);
    });

    test('Check write/read operations', async() => {
        const total = faker.number.int({ min: 10, max: 20 });

        const faked = Array(total).fill({}).map<TestingData>(() => ({
            id: faker.string.uuid(),
            visits: faker.number.int({ min: 0, max: 1_000_000 }),
            updated: DateTime.utc().toFormat('yyyy-MM-dd HH:mm:ss'),
        }));

        await tModule.service.write(faked);
        const reply = await tModule.service.read();

        expect(reply).toBeDefined();
        expect(reply.length).toBe(faked.length);
    });
});
