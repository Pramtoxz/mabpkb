declare module 'react-native-config' {
  export interface NativeConfig {
    API_BASE_URL?: string;
  }

  export const Config: NativeConfig;
  export default Config;
}

declare module 'react-native-event-source' {
  export class EventSource {
    constructor(url: string, options?: any);
    addEventListener(event: string, handler: (event: any) => void): void;
    removeEventListener(event: string, handler: (event: any) => void): void;
    close(): void;
  }
}
