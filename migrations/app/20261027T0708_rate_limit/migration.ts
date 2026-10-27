#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/5120befc26df15da41f40c9710267692e826fead84b7ecddc1ca088281372da5/contract';
import startContract from '../../snapshots/5120befc26df15da41f40c9710267692e826fead84b7ecddc1ca088281372da5/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/5296d8fb63940bc3198ba31ae10bb8f8c97626a7b23d1883f6c7e2b4fbebdf07/contract';
import endContract from '../../snapshots/5296d8fb63940bc3198ba31ae10bb8f8c97626a7b23d1883f6c7e2b4fbebdf07/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'RateLimit',
        columns: [
          col('count', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('expiresAt', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('key', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['key'])],
      }),
      this.createIndex({
        schema: 'public',
        table: 'RateLimit',
        index: 'RateLimit_expiresAt_idx_6b6b8c10',
        columns: ['expiresAt'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
