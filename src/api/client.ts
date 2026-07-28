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
  console.log('[API] URL:', fullUrl);
  console.log('[API] SECRET_KEY:', Config.SECRET_KEY);

  let response: Response;
  try {
    response = await fetch(fullUrl, {
      method,
      headers: requestHeaders,
      body,
    });
  } catch (err) {
    console.log('[API] NETWORK ERROR:', err);
    throw err;
  }

  console.log('[API] STATUS:', response.status);

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    console.log('[API] ERROR DATA:', errorData);
    throw {
      status: response.status,
      data: errorData,
    };
  }

  const data = await response.json();
  console.log('[API] SUCCESS:', data);
  return data;
}
