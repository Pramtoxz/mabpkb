import {Config} from 'react-native-config';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: FormData | string;
  isMultipart?: boolean;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const {method = 'GET', headers = {}, body, isMultipart = false} = options;

  const requestHeaders: Record<string, string> = {
    Accept: 'application/json',
    'SECRET-KEY': Config.SECRET_KEY ?? '',
    ...headers,
  };

  if (!isMultipart) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  const fullUrl = `${Config.API_BASE_URL}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  let response: Response;
  try {
    response = await fetch(fullUrl, {
      method,
      headers: requestHeaders,
      body,
      signal: controller.signal,
    });
  } catch (err) {
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw {
      status: response.status,
      data: errorData,
    };
  }

  const data = await response.json();
  return data;
}
