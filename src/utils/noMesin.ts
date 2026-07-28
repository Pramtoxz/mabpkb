import type {TextRecognitionResult} from '@react-native-ml-kit/text-recognition';

const MIN_LENGTH = 8;
const MAX_LENGTH = 17;
const MAX_CANDIDATES = 8;
const TYPICAL_MIN_LENGTH = 11;
const TYPICAL_MAX_LENGTH = 13;
const PREFIX = 'JM';
const PREFIX_KEEP_LENGTH = 5;

const PREFIXED_PATTERN = /JM[A-Z0-9]{6,15}/g;
const ENGINE_SHAPE = /^[A-Z][A-Z0-9]{2,6}\d{5,9}$/;
const LONG_DIGIT_RUN = /\d{5,}/;

const OCR_CONFUSIONS: Record<string, string> = {
  O: '0',
  Q: '0',
  D: '0',
  I: '1',
  L: '1',
  S: '5',
  B: '8',
  Z: '2',
  G: '6',
};

export function normalizeNoMesin(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function isPlausible(token: string): boolean {
  if (token.length < MIN_LENGTH || token.length > MAX_LENGTH) {
    return false;
  }
  return /[A-Z]/.test(token) && /\d/.test(token);
}

function score(token: string): number {
  let value = 0;
  if (token.startsWith(PREFIX)) {
    value += 6;
  }
  if (ENGINE_SHAPE.test(token)) {
    value += 4;
  }
  if (LONG_DIGIT_RUN.test(token)) {
    value += 2;
  }
  if (token.length >= TYPICAL_MIN_LENGTH && token.length <= TYPICAL_MAX_LENGTH) {
    value += 2;
  }
  return value;
}

function repairDigitTail(token: string): string {
  const head = token.slice(0, PREFIX_KEEP_LENGTH);
  let tail = '';
  for (const character of token.slice(PREFIX_KEEP_LENGTH)) {
    tail += OCR_CONFUSIONS[character] ?? character;
  }
  return head + tail;
}

export function extractNoMesinCandidates(
  result: TextRecognitionResult,
): string[] {
  const seen = new Set<string>();
  const candidates: string[] = [];

  const consider = (raw: string) => {
    const token = normalizeNoMesin(raw);
    if (!isPlausible(token) || seen.has(token)) {
      return;
    }
    seen.add(token);
    candidates.push(token);
  };

  const considerPrefixed = (normalized: string) => {
    const matches = normalized.match(PREFIXED_PATTERN);
    if (matches == null) {
      return;
    }
    for (const match of matches) {
      consider(match);
    }
  };

  for (const block of result.blocks) {
    for (const line of block.lines) {
      for (const element of line.elements) {
        consider(element.text);
      }
      const lineToken = normalizeNoMesin(line.text);
      consider(lineToken);
      considerPrefixed(lineToken);
    }
  }

  considerPrefixed(normalizeNoMesin(result.text));

  const ranked = candidates.sort((a, b) => score(b) - score(a));
  const repaired: string[] = [];
  for (const candidate of ranked) {
    const variant = repairDigitTail(candidate);
    if (variant !== candidate && !seen.has(variant)) {
      seen.add(variant);
      repaired.push(variant);
    }
  }

  return [...ranked, ...repaired].slice(0, MAX_CANDIDATES);
}
