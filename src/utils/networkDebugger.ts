/**
 * Network Request Debugger
 * Similar to browser dev tools network tab
 */

interface NetworkRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
  timestamp: Date;
  id: string;
}

interface NetworkResponse {
  requestId: string;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body?: any;
  responseTime: number;
}

class NetworkDebugger {
  private requests: Map<string, NetworkRequest> = new Map();
  private responses: Map<string, NetworkResponse> = new Map();
  private enabled: boolean = __DEV__; // Only enable in development

  private generateId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  logRequest(url: string, options: RequestInit = {}): string {
    if (!this.enabled) return '';

    const id = this.generateId();
    const request: NetworkRequest = {
      id,
      url,
      method: options.method || 'GET',
      headers: (options.headers as Record<string, string>) || {},
      body: options.body,
      timestamp: new Date(),
    };

    this.requests.set(id, request);

    // Log to console with styling (similar to browser dev tools)
    console.group(`🌐 Network Request: ${request.method} ${url}`);
    console.log('📤 Request ID:', id);
    console.log('⏰ Timestamp:', request.timestamp.toISOString());
    console.log('📋 Headers:', request.headers);
    if (request.body) {
      console.log('📦 Body:', this.formatBody(request.body));
    }
    console.groupEnd();

    return id;
  }

  logResponse(
    requestId: string,
    response: Response,
    body?: any,
    startTime?: number
  ): void {
    if (!this.enabled || !requestId) return;

    const request = this.requests.get(requestId);
    if (!request) return;

    const responseTime = startTime ? Date.now() - startTime : 0;
    const networkResponse: NetworkResponse = {
      requestId,
      status: response.status,
      statusText: response.statusText,
      headers: this.responseHeadersToObject(response.headers),
      body,
      responseTime,
    };

    this.responses.set(requestId, networkResponse);

    // Log response with status color coding
    const statusColor = this.getStatusColor(response.status);
    console.group(`🌐 Network Response: ${request.method} ${request.url}`);
    console.log(`📥 Response ID: ${requestId}`);
    console.log(
      `📊 Status: %c${response.status} ${response.statusText}`,
      `color: ${statusColor}; font-weight: bold`
    );
    console.log(`⚡ Response Time: ${responseTime}ms`);
    console.log('📋 Headers:', networkResponse.headers);
    if (body) {
      console.log('📦 Body:', body);
    }
    console.groupEnd();
  }

  logError(requestId: string, error: Error, startTime?: number): void {
    if (!this.enabled || !requestId) return;

    const request = this.requests.get(requestId);
    if (!request) return;

    const responseTime = startTime ? Date.now() - startTime : 0;

    console.group(`🌐 Network Error: ${request.method} ${request.url}`);
    console.log(`📥 Request ID: ${requestId}`);
    console.log(
      `❌ Error: %c${error.message}`,
      'color: red; font-weight: bold'
    );
    console.log(`⚡ Failed after: ${responseTime}ms`);
    console.log('📋 Error Details:', error);
    console.groupEnd();
  }

  private formatBody(body: any): any {
    if (typeof body === 'string') {
      try {
        return JSON.parse(body);
      } catch {
        return body;
      }
    }
    return body;
  }

  private responseHeadersToObject(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  private getStatusColor(status: number): string {
    if (status >= 200 && status < 300) return 'green';
    if (status >= 300 && status < 400) return 'orange';
    if (status >= 400) return 'red';
    return 'blue';
  }

  // Get all requests for debugging
  getAllRequests(): NetworkRequest[] {
    return Array.from(this.requests.values());
  }

  // Get all responses for debugging
  getAllResponses(): NetworkResponse[] {
    return Array.from(this.responses.values());
  }

  // Clear history
  clear(): void {
    this.requests.clear();
    this.responses.clear();
    console.log('🧹 Network debugger history cleared');
  }

  // Enable/disable debugging
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    console.log(`🌐 Network debugger ${enabled ? 'enabled' : 'disabled'}`);
  }
}

export const networkDebugger = new NetworkDebugger();

// Helper function to wrap fetch with debugging
export const debugFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const startTime = Date.now();
  const requestId = networkDebugger.logRequest(url, options);

  try {
    const response = await fetch(url, options);

    // Clone response to read body for debugging
    const responseClone = response.clone();
    try {
      const responseBody = await responseClone.text();
      let parsedBody;
      try {
        parsedBody = JSON.parse(responseBody);
      } catch {
        parsedBody = responseBody;
      }
      networkDebugger.logResponse(requestId, response, parsedBody, startTime);
    } catch (bodyError) {
      networkDebugger.logResponse(
        requestId,
        response,
        'Could not read response body',
        startTime
      );
    }

    return response;
  } catch (error) {
    networkDebugger.logError(requestId, error as Error, startTime);
    throw error;
  }
};

// Export for global access in development
if (__DEV__) {
  (global as any).networkDebugger = networkDebugger;
}
