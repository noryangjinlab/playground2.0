import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import AudioMotionAnalyzer from 'audiomotion-analyzer';
import styled from 'styled-components';
import { audioData } from '../data/audioData';

const Audioplayer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  border-radius: 7px;
  width: 606px;
  // display: flex;
  flex-direction: column;
  align-items: center;
  height: 300px;
  background-color: #0053ed;
  border: 0px solid transparent;
  box-shadow:
    inset -1px -1px 3px rgba(0, 0, 0, 0.35),
    inset 1px 1px 3px rgba(255, 255, 255, 0.9);
  padding: 7px;
  display: ${(props) => 
    (props.$isOff ? "none" : "flex")
  };
  transform: translate(${(props) => props.$x}px, ${(props) => props.$y}px);
  will-change: transform;

  .title-bar {
    width: 600px;
    position: relative;
    color: rgb(255, 255, 255);
    text-shadow: 2px 2px 2px rgba(0,0,0,0.3);
    line-height: 30px;
    padding-bottom: 5px;
    cursor: grab;
  }

  .audio-box {
    background-color: #ebe9d8;
    width: 600px;
    height: 260px;
    margin-left: 2px;
    border-right: 2px solid rgba(0,0,0,0.9);
    border-left: 2px solid rgba(255, 255, 255, 0.9);
    border-top: 2px solid rgba(255, 255, 255, 0.9);
    border-bottom: 2px solid rgba(255, 255, 255, 0.9);
    display: flex;
    flex-direction: row;
  }
  .audio-content {
    width: 400px;
    margin: 12px;
    background-color: rgba(42, 46, 245, 1);
    box-shadow: inset 0 0 7px rgba(0, 0, 0, 0.4);
    display: flex;
    flex-direction: column;
  }

  .win-btn {
    width: 20px;
    height: 20px;
    padding: 0;
    border: none;
    border-radius: 3px;
    background-color: #ece9d8;
    background-repeat: no-repeat;
    background-position: center;
    cursor: pointer;
  }

  .win-btn.minimize {
    position: absolute;
    right: 25px;
    top: 5px;
    background-image: url("/images/windows_xp_minimize_button.svg");
  }

  .win-btn.close {
    position: absolute;
    right: 0px;
    top: 5px;
    background-image: url("/images/windows_xp_close_button.svg");
  }

  .btn-hover2 {
    width: 20px;
    height: 20px;  
    position: absolute;
    right: 0px;
    top: 5px;
    background-color: rgba(255, 255, 255, 0.2);
  }
  .btn-hover1 {
    width: 20px;
    height: 20px;
    position: absolute;
    right: 25px;
    top: 5px;
    background-color: rgba(255, 255, 255, 0.2);
  }

  .btn-hover {
    border-radius: 3px;
    display: none;
    pointer-events: none;
  }

  .win-btn.close:hover + .btn-hover1 {
    display: block;
  }

  .win-btn.minimize:hover ~ .btn-hover2 {
    display: block;
  }

  .toggle-btn{
    width: 30px;
    height: 30px;
    padding: 0;
    border: none;
    background-color: transparent;
    background-repeat: no-repeat;
    background-position: center;
    cursor: pointer;
    margin-left: 30px;
    margin-right: 30px;
    background-size: 100% auto;
  }

  .go-back-btn {
    width: 27px;
    height: 18px;
    padding: 0;
    border: none;
    background-color: transparent;
    background-repeat: no-repeat;
    background-position: center;
    background-size: 100% auto;
    cursor: pointer;
    background-image: url("/images/mp3/go_back_btn.png");
  }
  .go-next-btn {
    width: 27px;
    height: 18px;
    padding: 0;
    border: none;
    background-color: transparent;
    background-repeat: no-repeat;
    background-position: center;
    background-size: 100% auto;
    cursor: pointer;
    background-image: url("/images/mp3/go_next_btn.png");
  }

  .seek_slider {
    -webkit-appearance: none;
    appearance: none;
    width: 300px;
    background: transparent;
  } 

  .seek_slider::-webkit-slider-runnable-track {
    height: 3px;
    background: #ffffffff;
    border-radius: 1px;
  }

  .seek_slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 14px;
    height: 10px;
    background: #ffffffff;
    border-radius: 5px;
    cursor: pointer;
    margin-top: -3px;
  }

  .seek_slider::-moz-range-track {
    width: 300px;
    height: 3px;
    background: #ffffffff;
    border-radius: 1px;
  }

  .seek_slider::-moz-range-thumb {
    width: 18px;
    height: 18px;
    background: #000;
    border-radius: 50%;
    cursor: pointer;
  }

  .audio-menu {
    width: 164px;
    margin: 12px 12px 12px 1px;
    background-color: rgba(42, 46, 245, 1);
    overflow-y: scroll;
    font-size: 16px;
    color: white;
  }

  .span-menu-selected {
    font-weight: 800;
    color: rgba(240, 221, 20, 1);
  }


  /* 스크롤바 전체 */
  ::-webkit-scrollbar {
    width: 8px;
  }

  /* 스크롤바 트랙 */
  ::-webkit-scrollbar-track {
    background: none;
  }

  /* 스크롤바 핸들 */
  ::-webkit-scrollbar-thumb {
    background: #ffffffff;
    border-radius: 1px;
  }
`
function AudioPlayer({ onSend, props }) {
  const containerRef = useRef(null);
  const audioRef = useRef(null);
  const analyzerRef = useRef(null);
  
  const sliderRef = useRef(null);

  // marquee
  const GAP = 70;
  const SPEED = 40;
  const PAUSE_DURATION = 2000;
  const marqueeTextRef = useRef(null);
  const marqueeBoxRef = useRef(null);
  const [offset, setOffset] = useState(0);
  const [isOverFlowing, setIsOverFlowing] = useState(false);
  const [singleWidth, setSingleWidth] = useState(0);

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const [index, setIndex] = useState(0);
  const [channel, setChannel] = useState(0);
  const [currTrack, setCurrTrack] = useState(null);

  const [isPlaying, setIsPlaying] = useState(false);

  const [isHover, setIsHover] = useState(null);
  const [isSmall, setIsSmall] = useState(false);
  const [isOff, setIsOff] = useState(false);


  const boxRef = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const posRef = useRef({ x: 0, y: 0 });
  const draggingRef = useRef(false);
  const startRef = useRef({ px: 0, py: 0, x: 0, y: 0 });
  const rafRef = useRef(0);




  useEffect(() => {

    if (!containerRef.current || !audioRef.current) return;

    const audioMotion = new AudioMotionAnalyzer(containerRef.current, {
      source: audioRef.current,
      height: 85,
      width: 368
    });

    analyzerRef.current = audioMotion;

    audioMotion.registerGradient('singleColor', {
      bgColor: 'rgba(255, 255, 255, 1)',
      colorStops: [
        { pos: 0, color: '#ffffffff' }, 
        { pos: 1, color: '#ffffffff' }  // 시작·끝을 모두 같은 색으로 설정
      ]
    })

    audioMotion.setOptions({
      mode: 6,
      showLeds: true,
      barSpace: 3,
      showScaleX: false,
      showBgColor: false,
      overlay: true,
      gradient: 'singleColor',
      colorMode: 'gradient',
      showPeaks: false
    })

    const unlock = () => {
      const ctx = audioMotion.audioCtx
      if (ctx.state === 'suspended') {
        ctx.resume()
      }
    }

    audioRef.current.addEventListener('play', unlock);

    return () => {
      audioRef.current.removeEventListener('play', unlock)
      audioMotion.destroy()
    }
  }, []);

  useEffect(() => {
    const apply = () => {
      if (!boxRef.current) return;
      boxRef.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`;
    };
    apply();
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      if (!draggingRef.current || !boxRef.current) return;

      const nx = startRef.current.x + (e.clientX - startRef.current.px);
      const ny = startRef.current.y + (e.clientY - startRef.current.py);

      posRef.current = { x: nx, y: ny };

      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        if (!boxRef.current) return;
        boxRef.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`;
      });
    };

    const onUp = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
      setPos(posRef.current);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, []);

  const onHandleDown = (e) => {

    if (e.target.closest("button")) return;
    
    e.preventDefault();
    draggingRef.current = true;
    startRef.current = { px: e.clientX, py: e.clientY, x: posRef.current.x, y: posRef.current.y };
    if (e.currentTarget?.setPointerCapture) e.currentTarget.setPointerCapture(e.pointerId);
  };

  useEffect(() => {
    posRef.current = pos;
    if (boxRef.current) boxRef.current.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
  }, [pos]);


  //props 값에 따라 활성화/최소화/닫기 설정
  useEffect(()=>{
    if (props == 2) {
      setIsOff(false);
      setIsSmall(false);
    } else if (props == 1) {
      setIsOff(true);
      setIsSmall(false);
    } else {
      setIsOff(false);
      setIsSmall(true);
    }
  }, [props])

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateDuration = () => {
      setDuration(audio.duration || 0);
    };

    const updateTime = () => {
      setCurrentTime(audio.currentTime || 0);

      // 슬라이더 자동 이동
      if (sliderRef.current && duration > 0) {
        sliderRef.current.value = (audio.currentTime / duration) * 100;
      }
    };

    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("durationchange", updateDuration);
    audio.addEventListener("timeupdate", updateTime);

    return () => {
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("durationchange", updateDuration);
      audio.removeEventListener("timeupdate", updateTime);
    };
  }, [duration]);

  useEffect(()=>{
    setCurrTrack(audioData[channel][index]);
  }, [channel, index]);

  useLayoutEffect(() => {
    if (!marqueeBoxRef.current || !marqueeTextRef.current) return;

    const containerWidth = marqueeBoxRef.current.clientWidth;
    const contentWidth = marqueeTextRef.current.scrollWidth;

    setIsOverFlowing(contentWidth > containerWidth);
    setSingleWidth(contentWidth);
    setOffset(0);
  }, [currTrack?.title]);

  useEffect(() => {
    if (!isOverFlowing || singleWidth === 0) return;

    let frameId;
    let lastTime;
    let timeoutId;
    let startTimeoutId;
    let paused = false;
    const loopWidth = singleWidth + GAP;

    const step = (time) => {
      if (paused) return;

      if (lastTime == null) {
        lastTime = time;
        frameId = requestAnimationFrame(step);
        return;
      }

      const dt = (time - lastTime) / 1000;
      lastTime = time;

      setOffset(prev => {
        let next = prev - SPEED * dt;

        if (next <= -loopWidth) {
          next = 0;
          paused = true;

          timeoutId = setTimeout(() => {
            paused = false;
            lastTime = undefined;
            frameId = requestAnimationFrame(step);
          }, PAUSE_DURATION);
        }

        return next;
      });

      if (!paused) {
        frameId = requestAnimationFrame(step);
      }
    };

    startTimeoutId = setTimeout(() => {
      frameId = requestAnimationFrame(step);
    }, PAUSE_DURATION);

    return () => {
      cancelAnimationFrame(frameId);
      if (timeoutId) clearTimeout(timeoutId);
      if (startTimeoutId) clearTimeout(startTimeoutId);
      setOffset(0);
    };
  }, [isOverFlowing, singleWidth]);
  

  useEffect(() => {
    if (!audioRef.current || !currTrack) return;

    audioRef.current.load();
    setCurrentTime(0);
    if (isPlaying) {
      const p = audioRef.current.play();
      if (p !== undefined) {
        p.catch(() => {});
      }
    }
  }, [channel, index, currTrack]);




  const handleSeek = (e) => {
    if (!audioRef.current) return;
    const value = Number(e.target.value);
    const seekTime = (value / 100) * duration;
    audioRef.current.currentTime = seekTime;
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m < 10 ? '0'+m : m}:${s < 10 ? '0'+s : s}`;
  };


  const togglePlay = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <Audioplayer 
      $isOff={isOff || isSmall}
      $x={pos.x}
      $y={pos.y}
      ref={boxRef}
    >

      <div className={'title-bar'} onPointerDown={onHandleDown}>
        ♬ jukebox.exe
        <button className='win-btn minimize' aria-label="Minimize"
          onMouseEnter={()=>setIsHover('min')}
          onMouseLeave={()=>setIsHover(null)}
          onClick={()=>{
            setIsSmall(true);
            setIsOff(false);
            onSend(0);
          }}
        ></button>
        <button className='win-btn close' aria-label="Close"
          onMouseEnter={()=>setIsHover('close')}
          onMouseLeave={()=>setIsHover(null)}
          onClick={()=>{
            setIsOff(true);
            setIsSmall(false);
            onSend(1);
            if (isPlaying) {
              audioRef.current.pause();
              setIsPlaying(false);
            }
          }}
        ></button>
        <div className='btn-hover btn-hover1' style={{display: isHover === 'min' ? 'block' : 'none'}}/>
        <div className='btn-hover btn-hover2' style={{display: isHover === 'close' ? 'block' : 'none'}}/>
      </div>

      <div className='audio-box'>
        <div className='audio-content'>
          <div
            ref={containerRef}
            style={{ width: '368px', height: '85px', padding: '15px 16px 10px 16px'}}
          />
          <audio
            ref={audioRef}
            src={currTrack ? currTrack.path : undefined}
            onEnded={()=>{
              setIndex((prev) => {
              const last = audioData[channel].length - 1;
              return prev >= last ? 0 : prev + 1;
            });
            }}
          />
          <div style={{
            textAlign: 'center',
            marginTop: 'auto',
            paddingBottom: '12px'
          }}>
            <div ref={marqueeBoxRef} style={{
              textAlign: 'left',
              margin: '0 16px 8px 16px',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              boxSizing: 'border-box',
              color: 'white'
            }}>
              {
                isOverFlowing ? (
                  <div style={{ 
                    display: 'inline-flex', 
                    transform: `translateX(${offset}px)`, 
                    willChange: 'transform',
                  }}>
                    <span style={{display: 'inline-block', whiteSpace: 'nowrap', fontFamily: 'galmuri9'}} ref={marqueeTextRef}>{currTrack ? currTrack.title : 'loading'}</span>
                    <span style={{ display: 'inline-block', width: `${GAP}px`, fontFamily: 'galmuri9'}}/>
                    <span style={{display: 'inline-block', fontFamily: 'galmuri9'}}>{currTrack ? currTrack.title : 'loading'}</span>
                  </div>
                ) : (
                  <span style={{display: 'inline-block', whiteSpace: 'nowrap', fontFamily: 'galmuri9'}} ref={marqueeTextRef}>{currTrack ? currTrack.title : 'loading'}</span>
                )
              }
            </div>
            <div style={{
              color: 'white',
              fontSize: '10px',
              textAlign: 'left',
              margin: '0 16px 10px 16px',
            }}>
              <span>{currTrack ? currTrack.artist : 'loading'}</span>
            </div>
            <div style={{
              color: 'white',
              fontSize: '9px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px'
            }}>
              <span style={{marginRight: '7px'}} className="current-time">{formatTime(currentTime)}</span>
              <div style={{
                width: '300px',
                height: '20px',
                display: 'flex',
                justifyContent: 'center',
              }}>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="0"
                  className="seek_slider"
                  ref={sliderRef}
                  onChange={handleSeek}
                />
              </div>
              <span style={{marginLeft: '7px'}} className="total-duration">{formatTime(duration)}</span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <button className='go-back-btn' onClick={()=>{
                if (index == 0) {
                  setIndex(audioData[channel].length - 1);
                } else {
                  setIndex(index - 1);
                }
              }}/>
              <button
                className='toggle-btn'
                style={{backgroundImage: isPlaying ? "url('/images/mp3/isPlaying_btn.png')" : "url('/images/mp3/isStop_btn.png')"}}
                onClick={togglePlay}
              />
              <button className='go-next-btn' onClick={()=>{
                if (index == audioData[channel].length - 1) {
                  setIndex(0);
                } else {
                  setIndex(index + 1);
                }
              }}/>
            </div>
      
          </div>
        </div>
        <div className='audio-menu'>
          {
            audioData[audioData.length - 1].map((e, i)=>{
              return (
                <div key={i} style={{
                  cursor: 'pointer',
                  margin: '10px 8px 10px 8px',
                  fontSize: '13px',
                  whiteSpace: 'normal',
                  wordBreak: 'break-all',
                  lineHeight: '17px'
                }} onClick={()=>{
                  setChannel(i);
                  setIndex(0)
                }} className={i == channel ? 'span-menu-selected' : 'span-menu-unselected'}>
                  [ channel_{i+1} ]<br/>{e}
                </div>
              )
            })
          }
        </div>
      </div>
    </Audioplayer>
  )
}

export default AudioPlayer;