export default function HomePage({ onNavigate }) {
  return <div className="browser-home-page">
    <p className="browser-home-eyebrow">NORYANGJIN LAB · @ EXPLORER</p>
    <h1>@ explorer</h1>
    <p>페이지를 선택해 이동하세요.</p>
    <button type="button" className="browser-page-link" onClick={() => onNavigate('help')}>
      <strong>파일탐색기 도움말</strong>
      <span>문서 탐색과 편집 기능을 알아봅니다.</span>
    </button>
  </div>;
}
