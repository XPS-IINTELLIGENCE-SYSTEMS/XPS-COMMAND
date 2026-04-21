import { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, Volume2, VolumeX, ChevronDown, User, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// 10 Male + 10 Female curated voices — mapped to browser SpeechSynthesis voices
const VOICE_PRESETS = [
  // Male voices
  { id: "m1", label: "James", gender: "male", match: ["Google US English", "Microsoft David", "Daniel"], pitch: 0.95, rate: 1.0 },
  { id: "m2", label: "Marcus", gender: "male", match: ["Google UK English Male", "Microsoft Mark", "Arthur"], pitch: 0.85, rate: 0.95 },
  { id: "m3", label: "Rafael", gender: "male", match: ["Microsoft Mateo", "Jorge", "Paulina"], pitch: 0.9, rate: 1.0 },
  { id: "m4", label: "Ethan", gender: "male", match: ["Alex", "Fred", "Microsoft David Desktop"], pitch: 1.0, rate: 1.05 },
  { id: "m5", label: "Oliver", gender: "male", match: ["Google UK English Male", "Daniel (Enhanced)", "Oliver"], pitch: 0.92, rate: 0.98 },
  { id: "m6", label: "Kai", gender: "male", match: ["Microsoft Guy Online", "Google 日本語", "Rishi"], pitch: 0.88, rate: 1.0 },
  { id: "m7", label: "Andre", gender: "male", match: ["Microsoft Eric Online", "Thomas", "Jacques"], pitch: 0.9, rate: 0.92 },
  { id: "m8", label: "Dominic", gender: "male", match: ["Aaron", "Microsoft Ryan Online", "Lee"], pitch: 1.05, rate: 1.0 },
  { id: "m9", label: "Vincent", gender: "male", match: ["Microsoft Liam Online", "Grandpa", "Ralph"], pitch: 0.82, rate: 0.9 },
  { id: "m10", label: "Troy", gender: "male", match: ["Evan", "Microsoft Roger Online", "Albert"], pitch: 1.0, rate: 1.02 },
  // Female voices
  { id: "f1", label: "Sophia", gender: "female", match: ["Google US English Female", "Microsoft Zira", "Samantha"], pitch: 1.1, rate: 1.0 },
  { id: "f2", label: "Isabella", gender: "female", match: ["Google UK English Female", "Microsoft Hazel", "Kate"], pitch: 1.05, rate: 0.95 },
  { id: "f3", label: "Luna", gender: "female", match: ["Microsoft Aria Online", "Victoria", "Tessa"], pitch: 1.15, rate: 1.0 },
  { id: "f4", label: "Ava", gender: "female", match: ["Microsoft Jenny Online", "Karen", "Moira"], pitch: 1.08, rate: 1.05 },
  { id: "f5", label: "Mia", gender: "female", match: ["Microsoft Sara Online", "Fiona", "Nicky"], pitch: 1.12, rate: 0.98 },
  { id: "f6", label: "Elena", gender: "female", match: ["Paulina", "Microsoft Elvira Online", "Monica"], pitch: 1.0, rate: 1.0 },
  { id: "f7", label: "Naomi", gender: "female", match: ["Microsoft Sonia Online", "Veena", "Isha"], pitch: 1.1, rate: 0.95 },
  { id: "f8", label: "Chloe", gender: "female", match: ["Microsoft Michelle Online", "Amelie", "Joana"], pitch: 1.18, rate: 1.02 },
  { id: "f9", label: "Aria", gender: "female", match: ["Microsoft Aria Online", "Allison", "Ava"], pitch: 1.06, rate: 1.0 },
  { id: "f10", label: "Zara", gender: "female", match: ["Microsoft Natasha Online", "Milena", "Tina"], pitch: 1.02, rate: 0.96 },
];

export { VOICE_PRESETS };

export default function VoiceChat({ onTranscript, lastAssistantMessage, mobile }) {
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState("f1");
  const [showVoiceMenu, setShowVoiceMenu] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  const recognitionRef = useRef(null);
  const menuRef = useRef(null);
  const lastSpokenRef = useRef("");

  // Load browser voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis?.getVoices() || [];
      setAvailableVoices(voices);
    };
    loadVoices();
    window.speechSynthesis?.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis?.removeEventListener("voiceschanged", loadVoices);
  }, []);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowVoiceMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Find best matching browser voice for a preset
  const findBrowserVoice = useCallback((preset) => {
    if (!availableVoices.length) return null;
    for (const name of preset.match) {
      const found = availableVoices.find(v => v.name.includes(name));
      if (found) return found;
    }
    // Fallback: find any voice matching gender
    const genderHint = preset.gender === "female" ? /female|woman|zira|samantha|karen|victoria|jenny|sara|aria|sonia/i : /male|man|david|daniel|mark|alex|guy|roger|ryan|liam/i;
    return availableVoices.find(v => genderHint.test(v.name)) || availableVoices[0];
  }, [availableVoices]);

  // Speak assistant messages
  useEffect(() => {
    if (!voiceEnabled || !lastAssistantMessage || lastAssistantMessage === lastSpokenRef.current) return;
    if (!window.speechSynthesis) return;

    lastSpokenRef.current = lastAssistantMessage;
    window.speechSynthesis.cancel();

    const preset = VOICE_PRESETS.find(v => v.id === selectedVoice) || VOICE_PRESETS[0];
    const utterance = new SpeechSynthesisUtterance(lastAssistantMessage);
    const browserVoice = findBrowserVoice(preset);
    if (browserVoice) utterance.voice = browserVoice;
    utterance.pitch = preset.pitch;
    utterance.rate = preset.rate;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [lastAssistantMessage, voiceEnabled, selectedVoice, findBrowserVoice]);

  // Speech recognition (voice input)
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) onTranscript(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  const currentPreset = VOICE_PRESETS.find(v => v.id === selectedVoice) || VOICE_PRESETS[0];
  const maleVoices = VOICE_PRESETS.filter(v => v.gender === "male");
  const femaleVoices = VOICE_PRESETS.filter(v => v.gender === "female");

  return (
    <div className="flex items-center gap-1 relative">
      {/* Mic button — voice input */}
      <Button
        variant="ghost"
        size="icon"
        className={`${mobile ? 'h-10 w-10' : 'h-8 w-8'} rounded-lg transition-all ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'text-muted-foreground hover:text-foreground'}`}
        onClick={toggleListening}
        title={isListening ? "Stop listening" : "Voice input"}
      >
        {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
      </Button>

      {/* Speaker toggle / stop */}
      <Button
        variant="ghost"
        size="icon"
        className={`${mobile ? 'h-10 w-10' : 'h-8 w-8'} rounded-lg transition-all ${isSpeaking ? 'text-primary animate-pulse' : voiceEnabled ? 'text-muted-foreground hover:text-foreground' : 'text-muted-foreground/40'}`}
        onClick={() => {
          if (isSpeaking) { stopSpeaking(); return; }
          setVoiceEnabled(!voiceEnabled);
        }}
        title={isSpeaking ? "Stop speaking" : voiceEnabled ? "Mute voice" : "Enable voice"}
      >
        {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
      </Button>

      {/* Voice selector */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowVoiceMenu(!showVoiceMenu)}
          className={`flex items-center gap-1 px-2 ${mobile ? 'py-2' : 'py-1'} rounded-lg text-[9px] font-medium transition-all border ${showVoiceMenu ? 'border-primary/40 bg-primary/5 text-primary' : 'border-border/50 text-muted-foreground hover:text-foreground hover:border-border'}`}
        >
          {currentPreset.gender === "male" ? <User className="w-2.5 h-2.5" /> : <UserCircle className="w-2.5 h-2.5" />}
          <span className="max-w-[48px] truncate">{currentPreset.label}</span>
          <ChevronDown className={`w-2.5 h-2.5 transition-transform ${showVoiceMenu ? 'rotate-180' : ''}`} />
        </button>

        {showVoiceMenu && (
          <div className="absolute bottom-full mb-1 left-0 z-50 glass-card rounded-xl p-2 min-w-[220px] max-h-[320px] overflow-y-auto shadow-xl border border-border/50">
            {/* Male voices */}
            <div className="px-2 py-1 text-[8px] uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1">
              <User className="w-2.5 h-2.5" /> Male Voices
            </div>
            {maleVoices.map(v => (
              <button
                key={v.id}
                onClick={() => { setSelectedVoice(v.id); setShowVoiceMenu(false); }}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[10px] transition-all ${selectedVoice === v.id ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground/80 hover:bg-white/5'}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${selectedVoice === v.id ? 'bg-primary' : 'bg-blue-400/40'}`} />
                <span>{v.label}</span>
                {selectedVoice === v.id && <span className="ml-auto text-[8px] text-primary">●</span>}
              </button>
            ))}

            <div className="my-1.5 border-t border-border/30" />

            {/* Female voices */}
            <div className="px-2 py-1 text-[8px] uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1">
              <UserCircle className="w-2.5 h-2.5" /> Female Voices
            </div>
            {femaleVoices.map(v => (
              <button
                key={v.id}
                onClick={() => { setSelectedVoice(v.id); setShowVoiceMenu(false); }}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[10px] transition-all ${selectedVoice === v.id ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground/80 hover:bg-white/5'}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${selectedVoice === v.id ? 'bg-primary' : 'bg-pink-400/40'}`} />
                <span>{v.label}</span>
                {selectedVoice === v.id && <span className="ml-auto text-[8px] text-primary">●</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}