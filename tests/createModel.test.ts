import { describe, expect, test } from "vitest";

import { TimeLog } from "../lib/export";

test('can introspect the table name on importing a Model-extending class with a call to init()', async () => {
    expect(TimeLog.getTableName()).toBe('time_logs');
});

test('exported model-extending class loads a schema', async () => {
    console.log(await TimeLog.getSchema());
});