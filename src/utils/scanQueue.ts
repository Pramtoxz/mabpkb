import {processScanImage} from './documentScanner';
import type {ScanImage} from '../contexts/ScanContext';

export interface QueueItem {
  step: 1 | 2 | 3 | 4;
  rawUri: string;
  filename: string;
  viewWidth?: number;
  viewHeight?: number;
  onDone?: (processed: ScanImage) => void;
}

class ScanQueue {
  private queue: QueueItem[] = [];
  private isProcessing: boolean = false;
  private pendingResolvers: Array<() => void> = [];

  public enqueue(item: QueueItem): void {
    this.queue.push(item);
    this.processNext();
  }

  public clear(): void {
    this.queue = [];
    this.isProcessing = false;
    this.notifyResolvers();
  }

  public async waitForAll(): Promise<void> {
    if (!this.isProcessing && this.queue.length === 0) {
      return Promise.resolve();
    }
    return new Promise<void>(resolve => {
      this.pendingResolvers.push(resolve);
    });
  }

  public isBusy(): boolean {
    return this.isProcessing || this.queue.length > 0;
  }

  private notifyResolvers(): void {
    const resolvers = [...this.pendingResolvers];
    this.pendingResolvers = [];
    for (const resolve of resolvers) {
      resolve();
    }
  }

  private async processNext(): Promise<void> {
    if (this.isProcessing) {
      return;
    }
    const item = this.queue.shift();
    if (!item) {
      this.isProcessing = false;
      this.notifyResolvers();
      return;
    }

    this.isProcessing = true;
    try {
      const result = await processScanImage(
        item.rawUri,
        item.viewWidth,
        item.viewHeight,
        false,
      );
      if (item.onDone) {
        item.onDone({
          uri: result.uri,
          type: 'image/jpeg',
          name: item.filename,
          isProcessing: false,
        });
      }
    } catch {
      if (item.onDone) {
        item.onDone({
          uri: item.rawUri,
          type: 'image/jpeg',
          name: item.filename,
          isProcessing: false,
        });
      }
    } finally {
      this.isProcessing = false;
      this.processNext();
    }
  }
}

export const scanQueue = new ScanQueue();
