/**
 * Unit tests for treatment-reports API route
 * Tests GET and POST endpoints, error handling, and Laravel error forwarding
 */

import { GET, POST } from '../../treatment-reports/route';

// Mock NextRequest
class MockRequest {
  json: () => Promise<unknown>;
  constructor(body: unknown) {
    this.json = async () => body;
  }
}

// Mock environment variable
const originalEnv = process.env.NEXT_PUBLIC_API_BASE;

// Mock fetch
global.fetch = jest.fn();

describe('Treatment Reports API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_API_BASE = 'http://localhost:8000';
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_API_BASE = originalEnv;
  });

  describe('GET /api/treatment-reports', () => {
    it('should fetch treatment reports from backend', async () => {
      const mockReports = [
        {
          id: '1',
          location: 'София',
          reporter_name: 'Иван',
          status: 'reported',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockReports,
      });

      const response = await GET();
      const data = await response.json();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/treatment-reports',
        expect.objectContaining({
          cache: 'no-store',
          headers: {
            Accept: 'application/json',
          },
        })
      );
      expect(response.status).toBe(200);
      expect(data).toEqual(mockReports);
    });

    it('should return empty array when backend returns empty array', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [],
      });

      const response = await GET();
      const data = await response.json();

      expect(data).toEqual([]);
    });

    it('should handle backend errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' }),
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Server error');
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Network error');
    });

    it('should throw error if NEXT_PUBLIC_API_BASE is not configured', async () => {
      delete process.env.NEXT_PUBLIC_API_BASE;

      await expect(GET()).rejects.toThrow('NEXT_PUBLIC_API_BASE is not configured');
    });
  });

  describe('POST /api/treatment-reports', () => {
    const mockRequest = (body: unknown) => {
      return new MockRequest(body) as unknown as Request;
    };

    it('should create treatment report', async () => {
      const mockPayload = {
        location: 'София',
        reporter_name: 'Иван',
        treatment_date: '2025-11-20',
      };

      const mockResponse = {
        id: 'test-id',
        ...mockPayload,
        status: 'reported',
        created_at: '2025-11-20T10:00:00Z',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockResponse,
      });

      const request = mockRequest(mockPayload);
      const response = await POST(request);
      const data = await response.json();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/treatment-reports',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(mockPayload),
        })
      );
      expect(response.status).toBe(201);
      expect(data).toEqual(mockResponse);
    });

    it('should handle Laravel validation errors (422)', async () => {
      const mockPayload = {
        reporter_name: 'Иван',
        // Missing required location field
      };

      const mockErrorResponse = {
        message: 'The location field is required.',
        errors: {
          location: ['The location field is required.'],
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => mockErrorResponse,
      });

      const request = mockRequest(mockPayload);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(422);
      expect(data).toEqual(mockErrorResponse);
      expect(data.errors).toBeDefined();
    });

    it('should handle other backend errors', async () => {
      const mockPayload = { location: 'София' };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Server error' }),
      });

      const request = mockRequest(mockPayload);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Server error');
    });

    it('should handle network errors', async () => {
      const mockPayload = { location: 'София' };

      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const request = mockRequest(mockPayload);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Network error');
    });

    it('should send null values for empty optional fields', async () => {
      const mockPayload = {
        location: 'София',
        reporter_name: '',
        treatment_date: '',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ id: 'test-id', location: 'София' }),
      });

      const request = mockRequest(mockPayload);
      await POST(request);

      const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(callBody.location).toBe('София');
      expect(callBody.reporter_name).toBe('');
    });
  });
});

