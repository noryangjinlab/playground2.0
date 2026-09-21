import React from "react";
import { Routes, Route } from "react-router";
import styled from "styled-components";

const Desktop = styled.div`
  position: relative;
  width: 100%;
  min-height: calc(100vh - 180px);
  box-sizing: border-box;

  background: #008080;

  font-family:
    "galmuri9",
    "galmurimono9",
    "Tahoma",
    "MS Sans Serif",
    sans-serif;

  overflow: hidden;

  @media (max-width: 1000px) {
    min-height: calc(100vh - 140px);
  }
`;

const IconArea = styled.div`
  position: absolute;
  top: 16px;
  left: 12px;

  display: flex;
  flex-direction: column;
  align-items: center;

  gap: 18px;

  @media (max-width: 600px) {
    top: 12px;
    left: 8px;
    gap: 14px;
  }
`;

const DesktopIcon = styled.div`
  width: 74px;

  display: flex;
  flex-direction: column;
  align-items: center;

  padding: 4px 2px;

  box-sizing: border-box;

  cursor: default;
  user-select: none;

  .icon-image {
    width: 42px;
    height: 42px;

    margin-bottom: 4px;

    image-rendering: pixelated;
  }

  .icon-label {
    max-width: 72px;

    padding: 1px 3px;

    color: #ffffff;

    font-size: 10px;
    line-height: 1.35;

    text-align: center;

    text-shadow:
      1px 1px 0 #000000,
      1px 1px 1px #000000;

    word-break: keep-all;
  }

  &:hover .icon-label {
    background: #000080;

    outline: 1px dotted #ffffff;
    outline-offset: -1px;
  }
`;

const MyComputerIcon = () => {
  return (
    <svg
      className="icon-image"
      viewBox="0 0 42 42"
      fill="none"
      aria-hidden="true"
    >
      {/* 모니터 외곽 */}
      <rect
        x="5"
        y="3"
        width="32"
        height="25"
        fill="#c0c0c0"
        stroke="#000000"
        strokeWidth="2"
      />

      {/* 모니터 하이라이트 */}
      <line
        x1="7"
        y1="5"
        x2="35"
        y2="5"
        stroke="#ffffff"
      />

      <line
        x1="7"
        y1="5"
        x2="7"
        y2="26"
        stroke="#ffffff"
      />

      {/* 화면 */}
      <rect
        x="9"
        y="7"
        width="24"
        height="16"
        fill="#000080"
        stroke="#808080"
      />

      {/* 화면 내부 */}
      <rect
        x="11"
        y="9"
        width="20"
        height="12"
        fill="#008080"
      />

      {/* 받침대 */}
      <rect
        x="17"
        y="28"
        width="8"
        height="5"
        fill="#808080"
        stroke="#000000"
      />

      {/* 하단 받침 */}
      <rect
        x="11"
        y="33"
        width="20"
        height="4"
        fill="#c0c0c0"
        stroke="#000000"
      />

      <line
        x1="12"
        y1="34"
        x2="29"
        y2="34"
        stroke="#ffffff"
      />
    </svg>
  );
};

const RecycleBinIcon = () => {
  return (
    <svg
      className="icon-image"
      viewBox="0 0 42 42"
      fill="none"
      aria-hidden="true"
    >
      {/* 뚜껑 손잡이 */}
      <rect
        x="17"
        y="3"
        width="8"
        height="4"
        fill="#c0c0c0"
        stroke="#000000"
      />

      {/* 뚜껑 */}
      <rect
        x="8"
        y="7"
        width="26"
        height="5"
        fill="#c0c0c0"
        stroke="#000000"
      />

      <line
        x1="9"
        y1="8"
        x2="33"
        y2="8"
        stroke="#ffffff"
      />

      {/* 휴지통 몸체 */}
      <path
        d="
          M11 12
          L31 12
          L29 37
          L13 37
          Z
        "
        fill="#c0c0c0"
        stroke="#000000"
        strokeWidth="2"
      />

      {/* 내부 하이라이트 */}
      <line
        x1="13"
        y1="14"
        x2="15"
        y2="34"
        stroke="#ffffff"
      />

      {/* 세로 홈 */}
      <line
        x1="17"
        y1="16"
        x2="18"
        y2="33"
        stroke="#808080"
        strokeWidth="2"
      />

      <line
        x1="21"
        y1="16"
        x2="21"
        y2="33"
        stroke="#808080"
        strokeWidth="2"
      />

      <line
        x1="25"
        y1="16"
        x2="24"
        y2="33"
        stroke="#808080"
        strokeWidth="2"
      />
    </svg>
  );
};

const ChannelDesktop = () => {
  return (
    <Desktop>
      <IconArea>
        <DesktopIcon>
          <MyComputerIcon />
          <div className="icon-label">
            My Computer
          </div>
        </DesktopIcon>

        <DesktopIcon>
          <RecycleBinIcon />
          <div className="icon-label">
            Recycle Bin
          </div>
        </DesktopIcon>
      </IconArea>
    </Desktop>
  );
};

const Channel = () => {
  return (
    <Routes>
      <Route
        path=""
        element={<ChannelDesktop />}
      />
    </Routes>
  );
};

export default Channel;