import styled from 'styled-components';

const IframeWrapper = styled.div`
  width: 100%;
  height: calc(100% - 20px);
  margin-top: 20px;
  overflow: hidden;
  background: white;
`;

const StyledIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
`;

export default function LabWishIframe() {
  const notionUrl = "https://leewish03.notion.site/ebd//32e56d0ce54c80a5bb42fb2298f87cb4"

  return (
    <IframeWrapper>
      <StyledIframe 
        src={notionUrl} 
        allow="autoplay"
      />
    </IframeWrapper>
  )
}