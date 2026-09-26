import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import AudioMotionAnalyzer from 'audiomotion-analyzer';
import styled from 'styled-components';
import { audioData } from '../data/audioData';
import { AppWindow } from './app-window';

const JukeboxWindow = styled(AppWindow)`
  && {
    height: auto;
    max-height: calc(100dvh - var(--taskbar-height) - 64px);
  }

  .app-window-content { flex: 0 1 auto; }
  .app-window-content > * { flex-shrink: 0; }

  @media (max-width: 600px) {
    && { max-height: calc(100dvh - var(--taskbar-height) - 38px); }
  }
`;

// Ultra-Smooth Seamless CSS Marquee with 3-second Pause after 1 Rotation
const MarqueeBox = styled.div`
  overflow: hidden;
  white-space: nowrap;
  position: relative;
  width: 100%;
  display: block;
`;

const MarqueeTrack = styled.div`
  display: inline-flex;
  white-space: nowrap;
  will-change: transform;
  animation: ${(props) =>
    props.$isAnimated
      ? `marqueeSlidePause ${props.$totalDuration}s linear infinite`
      : 'none'};

  @keyframes marqueeSlidePause {
    0% {
      transform: translateX(0);
    }
    ${(props) => props.$scrollPercent}% {
      transform: translateX(-50%);
    }
    100% {
      transform: translateX(-50%);
    }
  }

  .marquee-item {
    display: inline-block;
    white-space: nowrap;
    padding-right: ${(props) => props.$gap}px;
    flex-shrink: 0;
  }
`;

function MarqueeText({
  text,
  speed = 35,
  gap = 45,
  pauseDuration = 3, // Pauses for 3 seconds after 1 full rotation
  alwaysScroll = false,
  className,
  style,
}) {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const [shouldAnimate, setShouldAnimate] = useState(alwaysScroll);
  const [totalDuration, setTotalDuration] = useState(13);
  const [scrollPercent, setScrollPercent] = useState(76.9);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const textEl = textRef.current;
    if (!container || !textEl) return;

    const measure = () => {
      const containerW = container.clientWidth;
      const textW = textEl.scrollWidth;

      const isOverflow = textW > containerW;
      const animate = alwaysScroll || isOverflow;
      setShouldAnimate(animate);

      // Travel time for 1 complete rotation
      const totalWidth = textW + gap;
      const travelTime = Math.max(3, totalWidth / speed);
      const totalTime = travelTime + pauseDuration;
      const pct = (travelTime / totalTime) * 100;

      setTotalDuration(Number(totalTime.toFixed(2)));
      setScrollPercent(Math.min(99, Math.max(1, Number(pct.toFixed(2)))));
    };

    measure();

    const ro = new ResizeObserver(() => {
      measure();
    });
    ro.observe(container);

    return () => ro.disconnect();
  }, [text, speed, gap, pauseDuration, alwaysScroll]);

  return (
    <MarqueeBox ref={containerRef} className={className} style={style}>
      <MarqueeTrack
        key={text} /* Clean reset to 0% when track/text changes */
        $isAnimated={shouldAnimate}
        $totalDuration={totalDuration}
        $scrollPercent={scrollPercent}
        $gap={gap}
      >
        <span ref={textRef} className="marquee-item">
          {text}
        </span>
        {shouldAnimate && (
          <span className="marquee-item" aria-hidden="true">
            {text}
          </span>
        )}
      </MarqueeTrack>
    </MarqueeBox>
  );
}

const Win98Btn = styled.button`
  background: #c0c0c0;
  font-family: 'galmuri9', 'Tahoma', sans-serif;
  box-shadow: 
    inset 1px 1px 0px 1px #ffffff,
    inset -1px -1px 0px 1px #808080,
    1px 1px 0px 1px #000000;
  border: none;
  font-size: 11px;
  font-weight: bold;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  outline: none;
  padding: 2px 5px;

  &:active, &.active {
    box-shadow: 
      inset 1px 1px 0px 1px #808080,
      inset -1px -1px 0px 1px #ffffff,
      1px 1px 0px 1px #000000;
    transform: translate(1px, 1px);
  }

  &.ctrl-btn {
    width: 16px;
    height: 14px;
    padding: 0;
    font-size: 9px;
    line-height: 1;
  }

  &.playback-btn {
    min-width: 40px;
    height: 24px;
    font-size: 11px;
    padding: 2px 5px;

    @media (max-width: 1000px) {
      min-width: 32px;
      height: 22px;
      font-size: 10px;
      padding: 1px 2px;
    }
  }

  &.small-toggle {
    padding: 2px 5px;
    font-size: 10px;
    min-width: 38px;
    height: 24px;

    @media (max-width: 1000px) {
      min-width: 32px;
      height: 22px;
      font-size: 9px;
      padding: 1px 3px;
    }
  }
`;

const MenuBar = styled.div`
  display: flex;
  align-items: center;
  background: #c0c0c0;
  border-bottom: 1px solid #808080;
  padding: 2px 4px;
  font-size: 11px;
  gap: 10px;

  .menu-item {
    cursor: pointer;
    padding: 1px 3px;

    &:hover {
      background: #000080;
      color: #ffffff;
    }

    u {
      text-decoration: underline;
    }
  }

  @media (max-width: 1000px) {
    display: none; /* Hide menu bar on compact mobile sidebar */
  }
`;

const SunkenPanel = styled.div`
  background: ${(props) => props.bg || '#000000'};
  box-shadow: 
    inset 1px 1px 0px 1px #808080,
    inset -1px -1px 0px 1px #ffffff,
    1px 1px 0px 1px #dfdfdf;
  border: 1px solid #404040;
  margin: ${(props) => props.margin || '3px'};
  padding: ${(props) => props.padding || '4px'};
  box-sizing: border-box;
`;

const VfdDisplay = styled.div`
  background: #090e13;
  color: #00ff66;
  text-shadow: 0 0 4px rgba(0, 255, 102, 0.6);
  font-family: 'galmuri9', monospace;
  padding: 6px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;

  .vfd-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 10px;
    color: #00e5ff;
    text-shadow: 0 0 3px rgba(0, 229, 255, 0.5);
    border-bottom: 1px dashed rgba(0, 229, 255, 0.25);
    padding-bottom: 3px;
    overflow: hidden;
  }

  .vfd-title-box {
    height: 20px;
    font-size: 13px;
    font-weight: bold;
    display: block;
    line-height: 20px;
  }

  .vfd-artist {
    font-size: 10px;
    color: #a3ffc2;
    overflow: hidden;
    height: 16px;
    line-height: 16px;
  }

  .vfd-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 10px;
    color: #ffdd44;
    text-shadow: 0 0 3px rgba(255, 221, 68, 0.4);
    margin-top: 1px;
  }
`;

const VisualizerContainer = styled.div`
  width: 100%;
  height: 75px;
  background: #000000;
  position: relative;
  overflow: hidden;
  margin-top: 3px;
  border: 1px solid #1a3320;

  @media (max-width: 1000px) {
    height: 50px;
  }
`;

const SliderWrapper = styled.div`
  display: grid;
  grid-template-columns: 70px minmax(0, 320px) 70px;
  align-items: center;
  justify-content: center;
  column-gap: 8px;
  padding: 3px 6px;
  font-size: 10px;
  background: #c0c0c0;
  box-sizing: border-box;
  width: 100%;

  .slider-label {
    width: 70px;
    color: #111;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 3px;
    user-select: none;
    white-space: nowrap;
  }

  .slider-val {
    width: 70px;
    text-align: left;
    font-size: 9px;
    color: #222;
    font-family: 'galmuri9', monospace;
    white-space: nowrap;
  }

  input[type='range'] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    min-width: 0;
    height: 5px;
    background: #ffffff;
    box-shadow: 
      inset 1px 1px 0px 1px #808080,
      inset -1px -1px 0px 1px #dfdfdf;
    border: 1px solid #404040;
    outline: none;
    margin: 0;

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 12px;
      height: 18px;
      background: #c0c0c0;
      box-shadow: 
        inset 1px 1px 0px 1px #ffffff,
        inset -1px -1px 0px 1px #808080,
        1px 1px 0px 1px #000000;
      border: 1px solid #dfdfdf;
      cursor: pointer;
    }

    &::-moz-range-thumb {
      width: 12px;
      height: 18px;
      background: #c0c0c0;
      box-shadow: 
        inset 1px 1px 0px 1px #ffffff,
        inset -1px -1px 0px 1px #808080,
        1px 1px 0px 1px #000000;
      border: 1px solid #dfdfdf;
      cursor: pointer;
    }
  }

  @media (max-width: 1000px) {
    grid-template-columns: 48px minmax(0, 1fr) 48px;
    column-gap: 4px;
    padding-left: 4px;
    padding-right: 4px;

    .slider-label {
      width: 48px;
      font-size: 9px;
    }

    .slider-val {
      width: 48px;
      font-size: 8px;
    }
  }
`;

const ControlsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  padding: 5px 4px;
  border-top: 1px solid #ffffff;
  border-bottom: 1px solid #808080;
  background: #c0c0c0;

  .btn-group {
    display: flex;
    align-items: center;
    gap: 3px;
  }
`;

const PlaylistHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 3px;
  font-size: 10px;
  font-weight: bold;
  color: #222;

  select {
    font-family: 'galmuri9', sans-serif;
    background: #ffffff;
    border: 1px solid #808080;
    box-shadow: inset 1px 1px 0px 1px #dfdfdf;
    padding: 1px 3px;
    font-size: 10px;
    outline: none;
    max-width: 180px;

    @media (max-width: 1000px) {
      max-width: 140px;
    }
  }
`;

const PlaylistTable = styled.div`
  background: #ffffff;
  box-shadow: 
    inset 1px 1px 0px 1px #808080,
    inset -1px -1px 0px 1px #ffffff;
  border: 1px solid #404040;
  max-height: 110px;
  overflow-y: auto;
  font-size: 10px;
  position: relative;

  @media (max-width: 1000px) {
    max-height: 85px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }

  th {
    background: #c0c0c0;
    box-shadow: 
      inset 1px 1px 0px 1px #ffffff,
      inset -1px -1px 0px 1px #808080;
    border: 1px solid #dfdfdf;
    padding: 2px 3px;
    text-align: left;
    font-weight: bold;
    color: #000000;
    position: sticky;
    top: 0;
    z-index: 2;
  }

  tr {
    cursor: pointer;
    &:hover {
      background: #e0e8f8;
    }
    &.selected {
      background: #000080;
      color: #ffffff;
    }
  }

  td {
    padding: 2px 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const StatusBar = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  margin-top: 2px;
  font-size: 10px;

  .status-cell {
    background: #c0c0c0;
    box-shadow: 
      inset 1px 1px 0px 1px #808080,
      inset -1px -1px 0px 1px #ffffff;
    border: 1px solid #dfdfdf;
    padding: 2px 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .main-status {
    flex: 1;
  }
  .mode-status {
    width: 75px;
    text-align: center;
  }
  .clock-status {
    width: 50px;
    text-align: center;
  }

  @media (max-width: 1000px) {
    .mode-status, .clock-status {
      display: none;
    }
  }
`;

export default function AudioPlayer98({ onSend, props, onActivate, zIndex = 90 }) {
  const containerRef = useRef(null);
  const audioRef = useRef(null);
  const analyzerRef = useRef(null);

  // Playlist scroll tracking refs
  const playlistContainerRef = useRef(null);
  const rowRefs = useRef([]);

  // Responsive state
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);

  // Playback State
  const [channel, setChannel] = useState(0);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);

  // Window State
  const [isOff, setIsOff] = useState(false);
  const [isSmall, setIsSmall] = useState(false);

  // Playlist & Channel Data
  const channelNames = audioData[audioData.length - 1] || [];
  const currentPlaylist = audioData[channel] || [];
  const currTrack = currentPlaylist[index] || null;

  // Window resize listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1000);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync props (2 = visible, 1 = closed, 0 = minimized)
  useEffect(() => {
    if (props === 2) {
      setIsOff(false);
      setIsSmall(false);
    } else if (props === 1) {
      setIsOff(true);
      setIsSmall(false);
    } else if (props === 0) {
      setIsOff(false);
      setIsSmall(true);
    }
  }, [props]);

  // AudioMotionAnalyzer Initialization
  useEffect(() => {
    const containerEl = containerRef.current;
    const audioEl = audioRef.current;
    if (!containerEl || !audioEl) return;
    if (analyzerRef.current) return;

    try {
      const audioMotion = new AudioMotionAnalyzer(containerEl, {
        source: audioEl,
        height: isMobile ? 50 : 75,
        mode: 6,
        barSpace: 0.3,
        showLeds: true,
        showScaleX: false,
        showBgColor: true,
        bgAlpha: 1,
        overlay: false,
        colorMode: 'gradient',
        showPeaks: true,
      });

      audioMotion.registerGradient('win98Matrix', {
        bgColor: '#000000',
        colorStops: [
          { pos: 0, color: '#00ff66' },
          { pos: 0.65, color: '#ffff00' },
          { pos: 1, color: '#ff3300' },
        ],
      });

      audioMotion.setOptions({
        gradient: 'win98Matrix',
      });

      analyzerRef.current = audioMotion;

      const unlock = () => {
        const ctx = audioMotion.audioCtx;
        if (ctx && ctx.state === 'suspended') {
          ctx.resume();
        }
      };

      audioEl.addEventListener('play', unlock);

      return () => {
        audioEl.removeEventListener('play', unlock);
        audioMotion.destroy();
        analyzerRef.current = null;
      };
    } catch (e) {
      console.warn('AudioMotionAnalyzer init warning:', e);
    }
  }, []);

  // Update analyzer size on mobile/desktop switch
  useEffect(() => {
    const a = analyzerRef.current;
    if (!a) return;
    a.setOptions({
      height: isMobile ? 50 : 75,
    });
  }, [isMobile]);

  // Next / Prev index calculator with robust Shuffle support
  const getNextTrackIndex = (isForward = true) => {
    if (currentPlaylist.length <= 1) return 0;
    if (isShuffle) {
      let nextIdx;
      do {
        nextIdx = Math.floor(Math.random() * currentPlaylist.length);
      } while (nextIdx === index);
      return nextIdx;
    }
    if (isForward) {
      return index >= currentPlaylist.length - 1 ? 0 : index + 1;
    } else {
      return index === 0 ? currentPlaylist.length - 1 : index - 1;
    }
  };

  // Next / Prev actions (ensuring isPlaying remains true so playback never halts)
  const handlePrev = () => {
    setIsPlaying(true);
    const prevIdx = getNextTrackIndex(false);
    if (prevIdx === index && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } else {
      setIndex(prevIdx);
    }
  };

  const handleNext = () => {
    setIsPlaying(true);
    const nextIdx = getNextTrackIndex(true);
    if (nextIdx === index && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } else {
      setIndex(nextIdx);
    }
  };

  // Audio track change & automatic playback
  useEffect(() => {
    if (!audioRef.current || !currTrack) return;
    audioRef.current.load();
    setCurrentTime(0);

    if (isPlaying) {
      const p = audioRef.current.play();
      if (p !== undefined) {
        p.catch((err) => {
          console.log('Audio transition notice:', err);
        });
      }
    }
  }, [channel, index]);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume;

    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime || 0);

    // When one song ends, smoothly advance and continue playing!
    const onEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        setIsPlaying(true);
        const nextIdx = getNextTrackIndex(true);
        if (nextIdx === index) {
          audio.currentTime = 0;
          audio.play().catch(() => {});
        } else {
          setIndex(nextIdx);
        }
      }
    };

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
    };
  }, [currentPlaylist, isRepeat, isShuffle, volume, isMuted, index]);

  // Auto-scroll playlist scrollbar to keep selected song visible in screen
  useEffect(() => {
    const container = playlistContainerRef.current;
    const targetRow = rowRefs.current[index];
    if (!container || !targetRow) return;

    const containerTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    const containerBottom = containerTop + containerHeight;

    const rowTop = targetRow.offsetTop;
    const rowHeight = targetRow.offsetHeight;
    const rowBottom = rowTop + rowHeight;

    const headerHeight = 22; // Sticky header offset

    if (rowTop - headerHeight < containerTop) {
      container.scrollTo({
        top: Math.max(0, rowTop - headerHeight),
        behavior: 'smooth',
      });
    } else if (rowBottom > containerBottom) {
      container.scrollTo({
        top: rowBottom - containerHeight,
        behavior: 'smooth',
      });
    }
  }, [index, channel]);

  // Playback Control Handlers
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
  };

  const handleSeek = (e) => {
    if (!audioRef.current || duration === 0) return;
    const pct = Number(e.target.value) / 100;
    audioRef.current.currentTime = pct * duration;
    setCurrentTime(pct * duration);
  };

  const handleVolumeChange = (e) => {
    const val = Number(e.target.value) / 100;
    setVolume(val);
    if (isMuted) setIsMuted(false);
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  };

  // Close & Minimize Handlers
  const handleMinimize = () => {
    setIsSmall(true);
    setIsOff(false);
    if (onSend) onSend(0);
  };

  const handleClose = () => {
    setIsOff(true);
    setIsSmall(false);
    if (onSend) onSend(1);
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <JukeboxWindow title="jukebox.exe" icon="/images/icon/audio_cd.png"
      width={380} minimized={isOff || isSmall} maximizable={false}
      onMinimize={handleMinimize} onClose={handleClose}
      onActivate={onActivate} zIndex={zIndex}>
      {/* Menu Bar (Desktop only) */}
      <MenuBar>
        <div className="menu-item" onClick={togglePlay}><u>P</u>lay</div>
        <div className="menu-item" onClick={handleMinimize}><u>V</u>iew</div>
        <div className="menu-item" onClick={() => alert('Jukebox v2.4\nnoryangjinLAB Media Player\nLast update on 2026-09-21')}><u>H</u>elp</div>
      </MenuBar>

      {/* Audio Tag */}
      <audio
        ref={audioRef}
        src={currTrack ? currTrack.path : undefined}
        preload="metadata"
      />

      {/* VFD Digital Display Panel */}
      <SunkenPanel bg="#000000" margin="3px 3px 2px 3px" padding="3px">
        <VfdDisplay>
          {/* Top Line: Marquee Channel Name + Track Counter */}
          <div className="vfd-top">
            <div style={{ flex: 1, minWidth: 0, marginRight: '8px' }}>
              <MarqueeText
                text={`CH ${channel + 1}: ${channelNames[channel] || 'Default'}`}
                speed={28}
                gap={35}
                pauseDuration={3}
                alwaysScroll={false}
              />
            </div>
            <span style={{ flexShrink: 0 }}>
              TRK {index + 1}/{currentPlaylist.length}
            </span>
          </div>

          {/* Marquee Song Title: Continuous smooth scrolling with 3-second pause after 1 rotation */}
          <div className="vfd-title-box">
            <MarqueeText
              text={currTrack ? currTrack.title : 'No Track Loaded'}
              speed={32}
              gap={50}
              pauseDuration={3}
              alwaysScroll={false}
            />
          </div>

          {/* Marquee Artist */}
          <div className="vfd-artist">
            <MarqueeText
              text={`Artist: ${currTrack ? currTrack.artist : 'Unknown Artist'}`}
              speed={28}
              gap={35}
              pauseDuration={3}
              alwaysScroll={false}
            />
          </div>

          {/* Timer and Play Status */}
          <div className="vfd-bottom">
            <span>{isPlaying ? '▶ PLAYING' : currentTime > 0 ? '❚❚ PAUSED' : '■ STOPPED'}</span>
            <span>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </VfdDisplay>

        {/* Visualizer Container */}
        <VisualizerContainer ref={containerRef} />
      </SunkenPanel>

      {/* 1. Seek Position Slider Bar */}
      <SliderWrapper style={{ marginTop: 4 }}>
        <span className="slider-label">pos</span>
        <input
          type="range"
          min="0"
          max="100"
          value={duration > 0 ? (currentTime / duration) * 100 : 0}
          onChange={handleSeek}
          title="Seek Position"
        />
        <span className="slider-val">
          {formatTime(currentTime)}
        </span>
      </SliderWrapper>

      {/* 2. Volume Control Bar (Designed similar to position slider bar) */}
      <SliderWrapper style={{ paddingTop: 0, marginBottom: 4 }}>
        <span
          className="slider-label"
          style={{ cursor: 'pointer' }}
          onClick={() => setIsMuted(!isMuted)}
          title="Click to Mute / Unmute"
        >
          vol
        </span>
        <input
          type="range"
          min="0"
          max="100"
          value={isMuted ? 0 : volume * 100}
          onChange={handleVolumeChange}
          title="Volume Control"
        />
        <span className="slider-val">
          {isMuted ? 'MUTE' : `${Math.round(volume * 100)}%`}
        </span>
      </SliderWrapper>

      {/* 3. Playback Controls & Shuffle/Repeat Toggles */}
      <ControlsContainer>
        <div className="btn-group">
          <Win98Btn
            className="playback-btn"
            onClick={handlePrev}
            title={isShuffle ? 'Previous (Shuffle Active)' : 'Previous Track'}
          >
            |◀
          </Win98Btn>
          <Win98Btn
            className={`playback-btn ${isPlaying ? 'active' : ''}`}
            onClick={togglePlay}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? '❚❚' : '▶'}
          </Win98Btn>
          <Win98Btn
            className="playback-btn"
            onClick={handleStop}
            title="Stop"
          >
            ■
          </Win98Btn>
          <Win98Btn
            className="playback-btn"
            onClick={handleNext}
            title={isShuffle ? 'Next (Shuffle Active)' : 'Next Track'}
          >
            ▶|
          </Win98Btn>
        </div>

        <div className="btn-group">
          <Win98Btn
            className={`small-toggle ${isRepeat ? 'active' : ''}`}
            onClick={() => setIsRepeat((prev) => !prev)}
            title={`Repeat: ${isRepeat ? 'ON' : 'OFF'}`}
            aria-pressed={isRepeat}
          >
            🔁 REP
          </Win98Btn>
          <Win98Btn
            className={`small-toggle ${isShuffle ? 'active' : ''}`}
            onClick={() => setIsShuffle((prev) => !prev)}
            title={`Shuffle: ${isShuffle ? 'ON' : 'OFF'}`}
            aria-pressed={isShuffle}
          >
            🔀 SHUF
          </Win98Btn>
        </div>
      </ControlsContainer>

      {/* Playlist Explorer Section */}
      <SunkenPanel bg="#c0c0c0" margin="3px" padding="3px">
        <PlaylistHeader>
          <span>Playlist</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <span>CH:</span>
            <select
              value={channel}
              onChange={(e) => {
                setChannel(Number(e.target.value));
                setIndex(0);
                rowRefs.current = [];
              }}
            >
              {channelNames.map((name, i) => (
                <option key={i} value={i}>
                  CH {i + 1}: {name}
                </option>
              ))}
            </select>
          </div>
        </PlaylistHeader>

        <PlaylistTable ref={playlistContainerRef}>
          <table>
            <thead>
              <tr>
                <th style={{ width: '24px' }}>#</th>
                <th>Title</th>
                <th style={{ width: isMobile ? '70px' : '110px' }}>Artist</th>
              </tr>
            </thead>
            <tbody>
              {currentPlaylist.map((track, i) => (
                <tr
                  key={i}
                  ref={(el) => (rowRefs.current[i] = el)}
                  className={i === index ? 'selected' : ''}
                  onClick={() => {
                    setIndex(i);
                    setIsPlaying(true);
                  }}
                >
                  <td>{i + 1 < 10 ? '0' + (i + 1) : i + 1}</td>
                  <td>{track.title}</td>
                  <td>{track.artist}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </PlaylistTable>
      </SunkenPanel>

      {/* Windows 98 Status Bar */}
      <StatusBar>
        <div className="status-cell main-status">
          {isPlaying ? `Playing: ${currTrack?.title}` : 'Ready'}
        </div>
        <div className="status-cell mode-status">
          {isShuffle ? 'SHUFFLE' : isRepeat ? 'REPEAT' : 'NORMAL'}
        </div>
        <div className="status-cell clock-status">
          {formatTime(currentTime)}
        </div>
      </StatusBar>
    </JukeboxWindow>
  );
}
