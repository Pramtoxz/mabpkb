import {useEffect, useRef, useState, useCallback} from 'react';
import {trackBpkb} from '../api/endpoints';

export interface StreamData {
  stage: string;
  status: string;
  pdf_url: string | null;
  error_message: string | null;
}

const POLL_INTERVAL_MS = 3000;

export function useBpkbStream(trackId: string | null) {
  const [data, setData] = useState<StreamData | null>(null);
  const [connected, setConnected] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stoppedRef = useRef(false);

  const stop = useCallback(() => {
    stoppedRef.current = true;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setConnected(false);
  }, []);

  const poll = useCallback(async (id: string) => {
    try {
      const detail = await trackBpkb(id);
      const streamData: StreamData = {
        stage: detail.stage,
        status: detail.status,
        pdf_url: detail.pdf_path,
        error_message: detail.error_message,
      };
      setData(streamData);
      setConnected(true);

      if (detail.status === 'completed' || detail.status === 'failed') {
        stop();
      }
    } catch {
      setConnected(false);
    }
  }, [stop]);

  useEffect(() => {
    if (!trackId) {
      return;
    }

    stoppedRef.current = false;
    setConnected(false);

    poll(trackId);

    timerRef.current = setInterval(() => {
      if (!stoppedRef.current) {
        poll(trackId);
      }
    }, POLL_INTERVAL_MS);

    return () => stop();
  }, [trackId, poll, stop]);

  return {data, connected, disconnect: stop};
}
