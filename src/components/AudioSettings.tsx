import { useAudio } from '@/audio/useAudio';

export function AudioSettings() {
  const {
    settings,
    unlocked,
    setMasterVolume,
    setMusicVolume,
    setSfxVolume,
    toggleMute,
  } = useAudio();

  return (
    <div className="flex flex-col gap-2 rounded-[10px] border border-[rgba(201,162,74,.28)] bg-[rgba(10,8,7,.88)] px-3 py-2.5 text-[#e8ddcf]">
      <div className="flex items-center justify-between gap-3">
        <span className="font-cinzel text-[10px] tracking-[.18em] text-[#c9a24a]">
          SOUNDSCAPE{unlocked ? '' : ' · TAP TO ENABLE'}
        </span>
        <button
          type="button"
          onClick={toggleMute}
          className="rounded-md border border-[rgba(201,162,74,.35)] px-2 py-1 text-[10px] tracking-wider text-[#e0b552] hover:border-[rgba(201,162,74,.7)]"
        >
          {settings.muted ? 'UNMUTE' : 'MUTE'}
        </button>
      </div>
      <label className="flex items-center gap-2 text-[10px] text-[#8a7f72]">
        <span className="w-12">Master</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={settings.masterVolume}
          onChange={(e) => setMasterVolume(Number(e.target.value))}
          className="h-1 flex-1 accent-[#c9a24a]"
        />
      </label>
      <label className="flex items-center gap-2 text-[10px] text-[#8a7f72]">
        <span className="w-12">Music</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={settings.musicVolume}
          onChange={(e) => setMusicVolume(Number(e.target.value))}
          className="h-1 flex-1 accent-[#c9a24a]"
        />
      </label>
      <label className="flex items-center gap-2 text-[10px] text-[#8a7f72]">
        <span className="w-12">SFX</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={settings.sfxVolume}
          onChange={(e) => setSfxVolume(Number(e.target.value))}
          className="h-1 flex-1 accent-[#c9a24a]"
        />
      </label>
    </div>
  );
}
