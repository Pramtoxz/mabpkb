import {useEffect, useRef, useState, useCallback} from 'react';
import {EventSource} from 'react-native-event-source';
import {Config} from 'react-native-config';

const SECRET_KEY = 'U2FsdGVkX19jfmhRGNeUJ2TITVhrP0hzNJ9HNv81qSs=';

export interface StreamData {
  stage: string;
  status: string;
  pdf_url: string | null;
  error_message: string | null;
}

export function useBpkbStream(trackId: string | null) {
  const [data, setData] = useState<StreamData | null>(null);
  const [connected, setConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  const disconnect = useCallback(() => {
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
      setConnected(false);
    }
  }, []);

  useEffect(() => {
    if (!trackId) {
      return;
    }

    const url = `${Config.API_BASE_URL}/api/bpkb/track/${trackId}/stream?secret_key=${SECRET_KEY}`;
    const es = new EventSource(url);
    esRef.current = es;

    es.addEventListener('open', () => setConnected(true));

    es.addEventListener('message', (event: any) => {
      const parsed: StreamData = JSON.parse(event.data);
      setData(parsed);

      if (parsed.status === 'completed' || parsed.status === 'failed') {
        disconnect();
      }
    });

    es.addEventListener('error', () => {
      setConnected(false);
      disconnect();
    });

    return () => disconnect();
  }, [trackId, disconnect]);

  return {data, connected, disconnect};
}
