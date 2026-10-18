/** The same spoken form the prayer player uses: the Name is read as Adonai. */
const DIVINE_NAME_FOR_TTS = /יְהוָה|יְהֹוָה|יהוה|יְיָ/g;

export const SPEECH_RATE = 0.5;

export function prepareTtsText(text: string): string {
  return text.replace(DIVINE_NAME_FOR_TTS, 'אֲדֹנָי');
}
