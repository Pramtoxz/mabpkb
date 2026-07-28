import type {TextRecognitionResult} from '@react-native-ml-kit/text-recognition';
import {extractNoMesinCandidates} from '../src/utils/noMesin';

function recognized(lines: string[]): TextRecognitionResult {
  return {
    text: lines.join('\n'),
    blocks: [
      {
        text: lines.join('\n'),
        lines: lines.map(line => ({
          text: line,
          elements: line.split(/\s+/).map(word => ({text: word})),
          recognizedLanguages: [],
        })),
        recognizedLanguages: [],
      },
    ],
  };
}

describe('extractNoMesinCandidates', () => {
  it('memprioritaskan nomor berawalan JM di antara teks BPKB lain', () => {
    const candidates = extractNoMesinCandidates(
      recognized([
        'No.: M-06172900',
        'pemberi legitimasi kepemilikan Kendaraan Bermotor',
        'NTAS POLDA RIAU',
        '00/11/2017 DITLANTAS',
        'No. Mesin JMF2E1774885',
      ]),
    );

    expect(candidates[0]).toBe('JMF2E1774885');
  });

  it('menyambung nomor yang terpisah spasi oleh OCR', () => {
    const candidates = extractNoMesinCandidates(
      recognized(['NO MESIN', 'JMF2E 1774885']),
    );

    expect(candidates[0]).toBe('JMF2E1774885');
  });

  it('menyediakan varian perbaikan salah baca digit di ekor', () => {
    const candidates = extractNoMesinCandidates(recognized(['JMF2E177488O']));

    expect(candidates).toContain('JMF2E1774880');
  });

  it('menolak teks tanpa angka seperti DITLANTAS', () => {
    const candidates = extractNoMesinCandidates(
      recognized(['DITLANTAS', 'POLDA RIAU', 'KENDARAAN BERMOTOR']),
    );

    expect(candidates).toHaveLength(0);
  });
});
