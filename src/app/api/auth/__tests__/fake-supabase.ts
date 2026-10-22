/**
 * Minimal chainable fake of the supabase-js client used by the RBAC API route
 * tests. Each test installs a handler that answers per table, and can inspect
 * the recorded calls to assert what the route did (read, delete, insert...).
 *
 * Test-only helper: not collected as a test file (vitest matches *.test.ts /
 * *.test.tsx) and not a route file (Next only routes route.ts/page.tsx/...).
 */

export interface QueryContext {
  table: string;
  op: 'select' | 'insert' | 'delete' | 'upsert';
  filters: Record<string, unknown>;
  columns?: string;
  options?: { count?: string; head?: boolean };
  payload?: unknown;
}

export interface QueryResult {
  data: unknown;
  error: { message: string } | null;
  count?: number | null;
}

export type QueryHandler = (ctx: QueryContext) => QueryResult;

export interface FakeSupabaseState {
  handler: QueryHandler;
  calls: QueryContext[];
}

/** Build a fake service-role client bound to `state`. */
export function createFakeSupabase(state: FakeSupabaseState) {
  const run = (ctx: QueryContext): Promise<QueryResult> => {
    state.calls.push(ctx);
    return Promise.resolve(state.handler(ctx));
  };

  const build = (table: string) => {
    const ctx: QueryContext = { table, op: 'select', filters: {} };

    const query = {
      select(columns?: string, options?: { count?: string; head?: boolean }) {
        ctx.columns = columns;
        if (options) ctx.options = options;
        return query;
      },
      eq(column: string, value: unknown) {
        ctx.filters[column] = value;
        return query;
      },
      delete() {
        ctx.op = 'delete';
        return query;
      },
      insert(payload: unknown) {
        ctx.op = 'insert';
        ctx.payload = payload;
        return query;
      },
      upsert(payload: unknown) {
        ctx.op = 'upsert';
        ctx.payload = payload;
        return query;
      },
      maybeSingle() {
        return run(ctx);
      },
      single() {
        return run(ctx);
      },
      then<TResult1 = QueryResult, TResult2 = never>(
        onfulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null,
        onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
      ): Promise<TResult1 | TResult2> {
        return run(ctx).then(onfulfilled, onrejected);
      },
    };

    return query;
  };

  return {
    from: (table: string) => build(table),
    auth: {
      admin: {
        getUserById: (id: string) => run({ table: 'auth.users', op: 'select', filters: { id } }),
        listUsers: () => run({ table: 'auth.users', op: 'select', filters: {} }),
        createUser: (payload: unknown) =>
          run({ table: 'auth.users', op: 'insert', filters: {}, payload }),
      },
    },
  };
}

/** Count the recorded terminal queries for a table/op combination. */
export function countCalls(
  state: FakeSupabaseState,
  table: string,
  op?: QueryContext['op'],
): number {
  return state.calls.filter((call) => call.table === table && (!op || call.op === op)).length;
}
