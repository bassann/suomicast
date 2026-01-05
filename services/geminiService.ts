
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { TranslationResult, PodcastEpisode, TranscriptSegment } from "../types";
import { DAILY_TOPICS } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export class GeminiService {
  private generateSeed(dateStr: string): number {
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      const char = dateStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  async translateSegment(text: string, targetLanguage: string): Promise<TranslationResult> {
    try {
      const prompt = `Translate the following Finnish text into ${targetLanguage}. 
      Provide the direct translation and a brief grammatical or cultural note to help a language learner.
      
      Text: "${text}"`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              translation: { type: Type.STRING },
              notes: { type: Type.STRING },
              detectedLanguage: { type: Type.STRING }
            },
            required: ["translation", "notes"]
          }
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      return {
        original: text,
        translation: parsed.translation,
        notes: parsed.notes || '',
        detectedLanguage: parsed.detectedLanguage || 'Finnish'
      };
    } catch (error) {
      console.error("Translation error:", error);
      throw error;
    }
  }

  async generateDailyEpisode(dateStr: string): Promise<{ episode: PodcastEpisode, audioBlob: Blob }> {
    const date = new Date(dateStr);
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const selectedTopic = DAILY_TOPICS[dayOfYear % DAILY_TOPICS.length];
    const daySeed = this.generateSeed(dateStr);

    const prompt = `You are a professional news anchor for "SuomiCast Uutiset". 
    Create a daily news bulletin in "Selkosuomi" (Easy Finnish) for ${dateStr}.
    
    FOCUS TOPIC: ${selectedTopic}
    
    Instructions:
    - Content must be a NEWS BULLETIN covering 3 short stories.
    - Speaker 1: "Uutisankkuri" (News Anchor - Female)
    - Speaker 2: "Toimittaja" (Reporter - Male)
    - Use clear, simple language suitable for B1 level learners.
    - Approximately 15-18 transcript segments.
    - In the 'text' field, DO NOT write names like "Uutisankkuri:".
    
    Return JSON:
    1. title: A professional news headline in Finnish.
    2. description: A summary in English of the 3 news stories covered.
    3. transcript: Array of {id, text, speaker: "Mies" | "Nainen"}. 
       Map "Uutisankkuri" to "Nainen" and "Toimittaja" to "Mies".
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.2,
        seed: daySeed,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            transcript: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  speaker: { type: Type.STRING, enum: ["Mies", "Nainen"] }
                }
              }
            }
          }
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    const transcriptData = data.transcript || [];
    const { audioUrl, duration: totalDuration, audioBlob } = await this.generateSpeechWithDuration(transcriptData);

    const fullTextClean = transcriptData.map((s: any) => s.text).join(' ');
    const totalCharacters = fullTextClean.length;
    let currentTime = 0;
    
    const processedTranscript: TranscriptSegment[] = transcriptData.map((seg: any, index: number) => {
        const segLen = seg.text.length;
        const proportion = (segLen + 1) / totalCharacters; 
        const segmentDuration = proportion * totalDuration;
        const startTime = parseFloat(currentTime.toFixed(2));
        const endTime = parseFloat((currentTime + segmentDuration).toFixed(2));
        currentTime = endTime;
        return { id: `seg-${index}`, text: seg.text, startTime, endTime };
    });

    const mins = Math.floor(totalDuration / 60);
    const secs = Math.floor(totalDuration % 60);

    const episode: PodcastEpisode = {
      id: `ep-${dateStr}`,
      title: data.title,
      description: data.description,
      audioUrl: audioUrl,
      duration: `${mins}:${secs < 10 ? '0' : ''}${secs}`,
      transcript: processedTranscript
    };

    return { episode, audioBlob };
  }

  async generateSpeechWithDuration(transcript: {text: string, speaker: string}[]): Promise<{ audioUrl: string, duration: number, audioBlob: Blob }> {
    try {
        const script = transcript.map(t => `${t.speaker}: ${t.text}`).join('\n');
        const promptText = `Speak these news reports clearly. Use a professional news tone. Do not say the names "Mies" or "Nainen".\n\n${script}`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: promptText }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    multiSpeakerVoiceConfig: {
                        speakerVoiceConfigs: [
                            { speaker: 'Mies', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
                            { speaker: 'Nainen', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }
                        ]
                    }
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) throw new Error("No audio data returned");

        const audioBlobRes = await fetch(`data:application/octet-stream;base64,${base64Audio}`);
        const arrayBuffer = await audioBlobRes.arrayBuffer();
        const audioBytes = new Uint8Array(arrayBuffer);
        
        const SAMPLE_RATE = 24000;
        const NUM_CHANNELS = 1;
        const BYTES_PER_SAMPLE = 2;
        
        const wavBlob = this.addWavHeader(audioBytes, SAMPLE_RATE, NUM_CHANNELS);
        const duration = audioBytes.length / (SAMPLE_RATE * NUM_CHANNELS * BYTES_PER_SAMPLE);

        return {
            audioUrl: URL.createObjectURL(wavBlob),
            duration: duration,
            audioBlob: wavBlob
        };
    } catch (e) {
        console.error("Speech generation failed", e);
        return { audioUrl: "", duration: 0, audioBlob: new Blob() };
    }
  }

  private addWavHeader(samples: Uint8Array, sampleRate: number, numChannels: number): Blob {
    const buffer = new ArrayBuffer(44 + samples.length);
    const view = new DataView(buffer);
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples.length, true);
    this.writeString(view, 8, 'WAVE');
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2 * numChannels, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true);
    this.writeString(view, 36, 'data');
    view.setUint32(40, samples.length, true);
    const byteView = new Uint8Array(buffer);
    byteView.set(samples, 44);
    return new Blob([buffer], { type: 'audio/wav' });
  }

  private writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
}

export const geminiService = new GeminiService();
