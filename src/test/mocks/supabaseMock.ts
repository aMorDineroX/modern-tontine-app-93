import { vi } from 'vitest';

/**
 * Creates a chainable mock function that returns itself
 * @param returns Optional value to return instead of the mock itself
 */
function createChainableMock(returns?: any) {
  const mock = vi.fn();
  if (returns !== undefined) {
    mock.mockReturnValue(returns);
  } else {
    mock.mockReturnThis();
  }
  return mock;
}

/**
 * Creates a complete mock of the Supabase client with proper method chaining
 */
export function createSupabaseMock() {
  // Create base mocks for all methods
  const selectMock = createChainableMock();
  const fromMock = createChainableMock();
  const insertMock = createChainableMock();
  const updateMock = createChainableMock();
  const deleteMock = createChainableMock();
  const upsertMock = createChainableMock();
  const eqMock = createChainableMock();
  const neqMock = createChainableMock();
  const gtMock = createChainableMock();
  const ltMock = createChainableMock();
  const gteMock = createChainableMock();
  const lteMock = createChainableMock();
  const likeMock = createChainableMock();
  const ilikeMock = createChainableMock();
  const inMock = createChainableMock();
  const orMock = createChainableMock();
  const andMock = createChainableMock();
  const notMock = createChainableMock();
  const matchMock = createChainableMock();
  const singleMock = createChainableMock();
  const maybeSingleMock = createChainableMock();
  const orderMock = createChainableMock();
  const limitMock = createChainableMock();
  const rangeMock = createChainableMock();
  const containsMock = createChainableMock();
  const containedByMock = createChainableMock();
  const overlapsWithMock = createChainableMock();
  const textSearchMock = createChainableMock();
  const filterMock = createChainableMock();
  const rpcMock = createChainableMock();
  const storageMock = {
    from: vi.fn().mockReturnValue({
      upload: vi.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/test.jpg' } }),
      download: vi.fn().mockResolvedValue({ data: new Blob(), error: null }),
      remove: vi.fn().mockResolvedValue({ data: {}, error: null }),
      list: vi.fn().mockResolvedValue({ data: [], error: null }),
    })
  };
  const channelMock = vi.fn().mockReturnValue({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
    send: vi.fn().mockReturnThis(),
    unsubscribe: vi.fn(),
  });
  const authMock = {
    getSession: vi.fn().mockResolvedValue({
      data: { session: null },
      error: null
    }),
    getUser: vi.fn().mockResolvedValue({
      data: { user: null },
      error: null
    }),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    updateUser: vi.fn(),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    }),
  };

  // Set up method chaining
  selectMock.mockImplementation(() => ({
    eq: eqMock,
    neq: neqMock,
    gt: gtMock,
    lt: ltMock,
    gte: gteMock,
    lte: lteMock,
    like: likeMock,
    ilike: ilikeMock,
    in: inMock,
    or: orMock,
    and: andMock,
    not: notMock,
    match: matchMock,
    single: singleMock,
    maybeSingle: maybeSingleMock,
    order: orderMock,
    limit: limitMock,
    range: rangeMock,
    contains: containsMock,
    containedBy: containedByMock,
    overlaps: overlapsWithMock,
    textSearch: textSearchMock,
    filter: filterMock,
  }));

  eqMock.mockImplementation(() => ({
    eq: eqMock,
    neq: neqMock,
    gt: gtMock,
    lt: ltMock,
    gte: gteMock,
    lte: lteMock,
    like: likeMock,
    ilike: ilikeMock,
    in: inMock,
    or: orMock,
    and: andMock,
    not: notMock,
    match: matchMock,
    single: singleMock,
    maybeSingle: maybeSingleMock,
    order: orderMock,
    limit: limitMock,
    range: rangeMock,
    contains: containsMock,
    containedBy: containedByMock,
    overlaps: overlapsWithMock,
    textSearch: textSearchMock,
    filter: filterMock,
  }));

  orMock.mockImplementation(() => ({
    eq: eqMock,
    neq: neqMock,
    gt: gtMock,
    lt: ltMock,
    gte: gteMock,
    lte: lteMock,
    like: likeMock,
    ilike: ilikeMock,
    in: inMock,
    or: orMock,
    and: andMock,
    not: notMock,
    match: matchMock,
    single: singleMock,
    maybeSingle: maybeSingleMock,
    order: orderMock,
    limit: limitMock,
    range: rangeMock,
    contains: containsMock,
    containedBy: containedByMock,
    overlaps: overlapsWithMock,
    textSearch: textSearchMock,
    filter: filterMock,
  }));

  orderMock.mockImplementation(() => ({
    eq: eqMock,
    neq: neqMock,
    gt: gtMock,
    lt: ltMock,
    gte: gteMock,
    lte: lteMock,
    like: likeMock,
    ilike: ilikeMock,
    in: inMock,
    or: orMock,
    and: andMock,
    not: notMock,
    match: matchMock,
    single: singleMock,
    maybeSingle: maybeSingleMock,
    limit: limitMock,
    range: rangeMock,
    contains: containsMock,
    containedBy: containedByMock,
    overlaps: overlapsWithMock,
    textSearch: textSearchMock,
    filter: filterMock,
  }));

  insertMock.mockImplementation(() => ({
    select: selectMock,
    single: singleMock,
    maybeSingle: maybeSingleMock,
  }));

  updateMock.mockImplementation(() => ({
    eq: eqMock,
    neq: neqMock,
    gt: gtMock,
    lt: ltMock,
    gte: gteMock,
    lte: lteMock,
    like: likeMock,
    ilike: ilikeMock,
    in: inMock,
    match: matchMock,
    select: selectMock,
    single: singleMock,
    maybeSingle: maybeSingleMock,
  }));

  deleteMock.mockImplementation(() => ({
    eq: eqMock,
    neq: neqMock,
    gt: gtMock,
    lt: ltMock,
    gte: gteMock,
    lte: lteMock,
    like: likeMock,
    ilike: ilikeMock,
    in: inMock,
    match: matchMock,
  }));

  fromMock.mockImplementation(() => ({
    select: selectMock,
    insert: insertMock,
    update: updateMock,
    delete: deleteMock,
    upsert: upsertMock,
  }));

  // Create the supabase mock object
  const supabaseMock = {
    from: fromMock,
    rpc: rpcMock,
    storage: storageMock,
    channel: channelMock,
    auth: authMock,
  };

  return {
    supabaseMock,
    // Export individual mocks for direct manipulation in tests
    mocks: {
      fromMock,
      selectMock,
      insertMock,
      updateMock,
      deleteMock,
      upsertMock,
      eqMock,
      neqMock,
      gtMock,
      ltMock,
      gteMock,
      lteMock,
      likeMock,
      ilikeMock,
      inMock,
      orMock,
      andMock,
      notMock,
      matchMock,
      singleMock,
      maybeSingleMock,
      orderMock,
      limitMock,
      rangeMock,
      containsMock,
      containedByMock,
      overlapsWithMock,
      textSearchMock,
      filterMock,
      rpcMock,
      storageMock,
      channelMock,
      authMock,
    }
  };
}

// Create a default mock instance
export const { supabaseMock, mocks } = createSupabaseMock();
