import { LanguageCode } from '../locales/translations';

// Map locale codes to BCP 47 tags for speech synthesis & recognition
export const SPEECH_LOCALE_MAP: Record<LanguageCode, string> = {
  en: 'en-IN',
  ta: 'ta-IN',
  hi: 'hi-IN',
  te: 'te-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  bn: 'bn-IN'
};

export class VoiceAssistant {
  private static synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private static recognition: any = null;

  public static speak(text: string, lang: LanguageCode = 'en') {
    if (!this.synth) {
      console.warn("Speech synthesis not supported in this browser.");
      return;
    }

    // Cancel ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = SPEECH_LOCALE_MAP[lang] || 'en-IN';
    utterance.rate = 0.95; // Slightly slower, clear cadence for accessibility
    utterance.pitch = 1.0;

    // Try finding regional voice if installed
    const voices = this.synth.getVoices();
    const regionalVoice = voices.find(v => v.lang.startsWith(lang) || v.lang === SPEECH_LOCALE_MAP[lang]);
    if (regionalVoice) {
      utterance.voice = regionalVoice;
    }

    this.synth.speak(utterance);
  }

  public static stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  public static listen(
    lang: LanguageCode = 'en',
    onResult: (command: string, targetTab?: string) => void,
    onError?: (error: any) => void
  ) {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (onError) onError("Speech recognition not supported in this browser");
      return;
    }

    try {
      if (this.recognition) {
        this.recognition.abort();
      }

      const rec = new SpeechRecognition();
      rec.lang = SPEECH_LOCALE_MAP[lang] || 'en-IN';
      rec.continuous = false;
      rec.interimResults = false;

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        let targetTab: string | undefined = undefined;

        // Command intent classification
        if (transcript.includes('medicine') || transcript.includes('prescription') || transcript.includes('மருந்து') || transcript.includes('दवा') || transcript.includes('మందులు')) {
          targetTab = 'prescriptions';
        } else if (transcript.includes('emergency') || transcript.includes('help') || transcript.includes('அவசரம்') || transcript.includes('आपात') || transcript.includes('ఆపద')) {
          targetTab = 'emergency';
        } else if (transcript.includes('record') || transcript.includes('timeline') || transcript.includes('history') || transcript.includes('வரலாறு') || transcript.includes('इतिहास')) {
          targetTab = 'records';
        } else if (transcript.includes('passport') || transcript.includes('qr') || transcript.includes('card') || transcript.includes('அட்டை') || transcript.includes('कार्ड') || transcript.includes('కార్డు')) {
          targetTab = 'passport';
        } else if (transcript.includes('hospital') || transcript.includes('clinic') || transcript.includes('மருத்துவமனை') || transcript.includes('अस्पताल') || transcript.includes('ఆసుపత్రి')) {
          targetTab = 'facilities';
        } else if (transcript.includes('screening') || transcript.includes('trend') || transcript.includes('bp') || transcript.includes('sugar') || transcript.includes('ரத்த அழுத்தம்')) {
          targetTab = 'trends';
        } else if (transcript.includes('ai') || transcript.includes('assistant') || transcript.includes('உதவியாளர்') || transcript.includes('सहायक')) {
          targetTab = 'ai';
        }

        onResult(transcript, targetTab);
      };

      rec.onerror = (e: any) => {
        if (onError) onError(e);
      };

      this.recognition = rec;
      rec.start();
    } catch (err) {
      if (onError) onError(err);
    }
  }

  public static stopListening() {
    if (this.recognition) {
      this.recognition.abort();
      this.recognition = null;
    }
  }
}
