import { useRef, useState } from "react";
import { Lock } from "lucide-react";
import boudoirAudioSrc from "../assets/boudoir-audio.mp3";

/**
 * Bouton déclenchant la lecture audio dédiée à la collection « boudoirs ».
 */
export function BoudoirAudioButton() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleClick = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = 0;
    void audio.play().catch((err) => {
      console.error("Impossible de lancer la lecture audio :", err);
      setIsPlaying(false);
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={isPlaying}
        className={`group inline-flex items-center gap-2.5 rounded-full border px-5 py-3 text-xs tracking-[0.12em] backdrop-blur-sm transition-all duration-300 cursor-pointer ${
          isPlaying
            ? "border-[#C8A97E] bg-[#C8A97E]/15 text-[#C8A97E]"
            : "border-white/20 bg-[#121215]/70 text-[#F4F4F0]/85 hover:border-[#C8A97E]/75 hover:text-[#C8A97E]"
        }`}
      >
        <Lock
          className="h-3.5 w-3.5 shrink-0 transition-transform duration-300 group-hover:scale-110"
          aria-hidden="true"
        />
        <span>Pour les photos boudoirs cliquez ici</span>
      </button>

      <audio
        ref={audioRef}
        src={boudoirAudioSrc}
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />
    </>
  );
}
