// F013: Usage-Based Metering
jest.mock('@/lib/auth', () => ({ auth: jest.fn() }));
jest.mock('@/lib/prisma', () => ({
  prisma: {
    apiKey: { findUnique: jest.fn(), update: jest.fn() },
    usageRecord: { create: jest.fn(), count: jest.fn() },
    mcpServer: { findUnique: jest.fn() },
  },
}));
jest.mock('@/lib/api-keys', () => ({
  extractBearerToken: jest.fn(),
  hashApiKey: jest.fn((key: string) => 'hashed_' + key),
}));
jest.mock('@/lib/metering', () => ({
  recordApiCall: jest.fn(),
  getUsageSummary: jest.fn(),
}));

import { POST as recordUsage } from '@/app/api/usage/record/route';
import { GET as usageSummary } from '@/app/api/usage/summary/route';
import { auth } from '@/lib/auth';
import { extractBearerToken } from '@/lib/api-keys';
import { recordApiCall, getUsageSummary } from '@/lib/metering';

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockExtractBearerToken = extractBearerToken as jest.MockedFunction<typeof extractBearerToken>;
const mockRecordApiCall = recordApiCall as jest.MockedFunction<typeof recordApiCall>;
const mockGetUsageSummary = getUsageSummary as jest.MockedFunction<typeof getUsageSummary>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/usage/record', () => {
  it('records API usage for valid API key', async () => {
    mockExtractBearerToken.mockReturnValue('mcpm_validkey');
    mockRecordApiCall.mockResolvedValue({
      key: { id: 'key-1', userId: 'user-1' },
      server: { id: 'srv-1', freeCallLimit: 0, pricingModel: 'FREE' },
    } as any);

    const req = new Request('http://localhost/api/usage/record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer mcpm_validkey' },
      body: JSON.stringify({ serverId: 'srv-1', endpoint: '/tools/list', statusCode: 200 }),
    }) as any;

    const res = await recordUsage(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.recorded).toBe(true);
    expect(mockRecordApiCall).toHaveBeenCalledWith({
      apiKey: 'mcpm_validkey',
      serverId: 'srv-1',
      endpoint: '/tools/list',
      statusCode: 200,
    });
  });

  it('returns 429 when free call limit exceeded', async () => {
    mockExtractBearerToken.mockReturnValue('mcpm_validkey');
    mockRecordApiCall.mockResolvedValue({
      key: { id: 'key-1', userId: 'user-1' },
      server: { id: 'srv-1', freeCallLimit: 100, pricingModel: 'USAGE_BASED' },
    } as any);

    const { prisma } = require('@/lib/prisma');
    (prisma.usageRecord.count as jest.Mock).mockResolvedValue(100);

    const req = new Request('http://localhost/api/usage/record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer mcpm_validkey' },
      body: JSON.stringify({ serverId: 'srv-1', endpoint: '/tools/call', statusCode: 200 }),
    }) as any;

    const res = await recordUsage(req);
    expect(res.status).toBe(429);
    const data = await res.json();
    expect(data.error).toMatch(/free tier/i);
  });

  it('rejects invalid API key', async () => {
    mockExtractBearerToken.mockReturnValue('mcpm_badkey');
    mockRecordApiCall.mockRejectedValue(new Error('Invalid API key'));

    const req = new Request('http://localhost/api/usage/record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer mcpm_badkey' },
      body: JSON.stringify({ serverId: 'srv-1', endpoint: '/tools/list', statusCode: 200 }),
    }) as any;

    const res = await recordUsage(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });
});

describe('GET /api/usage/summary', () => {
  it('returns usage summary for current billing period', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1', role: 'USER', email: 'user@test.com' } } as any);
    const periodStart = new Date(2026, 2, 1);
    const periodEnd = new Date(2026, 2, 29);
    mockGetUsageSummary.mockResolvedValue({ callsThisMonth: 42, periodStart, periodEnd });

    const req = new Request('http://localhost/api/usage/summary?serverId=srv-1') as any;
    const res = await usageSummary(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.callsThisMonth).toBe(42);
    expect(mockGetUsageSummary).toHaveBeenCalledWith('user-1', 'srv-1');
  });
});
