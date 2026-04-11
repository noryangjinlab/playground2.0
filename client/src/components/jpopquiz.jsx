import { useEffect, useMemo, useRef, useState } from 'react';
import styled, { css } from 'styled-components';

const TOPICS = [
  { key: '고대음악', className: 'rose' },
  { key: '2010년대', className: 'amber' },
  { key: '2020년대', className: 'emerald' },
  { key: '보컬로이드', className: 'sky' },
  { key: '애니송', className: 'violet' },
];

const SCORES = [10, 20, 30, 40, 50, 60, 70];

const ANSWERS_JP = [
  [
    'supercell - 君の知らない物語',
    'superfly - 愛をこめて花束を',
    "nobodyknows+ - Hero's Come Back!!",
    "日向めぐみ - Catch You Catch Me",
    'Takahashi Yoko - 魂のルフラン',
    'KIRINJI - 雨は毛布のように',
    '東京事変 - 能動的三分間',
  ],
  [
    'Eve - お気に召すまま',
    '東京事変 - 長く短い祭',
    'Galileo Galilei - 青い栞',
    'おいしくるメロンパン - look at the sea',
    'sakanaction - ミュージック',
    'King Gnu - Flash!!',
    '神様、僕は気づいてしまった - CQCQ',
  ],
  [
    'ずっと真夜中でいいのに。- MILABO',
    'ヨルシカ - 花に亡霊',
    'Official髭男dism - Get Back To 人生',
    'NOMELON NOLEMON - SAYONARA MAYBE',
    'Ali - Professionalism',
    'MILLENIUM PARADE - Fly with me',
    'ONE OK ROCK - Renegades',
  ],
  [
    '천성의 약함',
    '인생 리셋 버튼',
    'meltdown/노심융해',
    'Additional Memory',
    '脳漿炸裂ガール/뇌장작렬 걸',
    '世界を壊している/세계를 부수고있어',
    '토리노코 시티',
  ],
  [
    'Beautiful Fin',
    '空色デイズ',
    '夕暮れの鳥/황혼의 새',
    "What's up, people!",
    'ニワカ雨ニモ負ケズ/소나기에도 지지 않고',
    '이종간 커뮤니케이션',
    'Dark Cherry Mystery',
  ],
];

const ANSWERS_KR = [
  [
    'supercell - 君の知らない物語',
    'superfly - 사랑을 담ㅇ아서 꽃다발을',
    "nobodyknows+ - Hero's Come Back!!",
    "日向めぐみ - Catch You Catch Me",
    'Takahashi Yoko - 魂のルフラン',
    'KIRINJI - 雨は毛布のように',
    '東京事変 - 能動的三分間',
  ],
  [
    'Eve - お気に召すまま',
    '東京事変 - 長く短い祭',
    'Galileo Galilei - 青い栞',
    'おいしくるメロンパン - look at the sea',
    'sakanaction - ミュージック',
    'King Gnu - Flash!!',
    '神様、僕は気づいてしまった - CQCQ',
  ],
  [
    'ずっと真夜中でいいのに。- MILABO',
    'ヨルシカ - 花に亡霊',
    'Official髭男dism - Get Back To 人生',
    'NOMELON NOLEMON - SAYONARA MAYBE',
    'Ali - Professionalism',
    'MILLENIUM PARADE - Fly with me',
    'ONE OK ROCK - Renegades',
  ],
  [
    '천성의 약함',
    '인생 리셋 버튼',
    'meltdown/노심융해',
    'Additional Memory',
    '脳漿炸裂ガール/뇌장작렬 걸',
    '世界を壊している/세계를 부수고있어',
    '토리노코 시티',
  ],
  [
    'Beautiful Fin',
    '空色デイズ',
    '夕暮れの鳥/황혼의 새',
    "What's up, people!",
    'ニワカ雨ニモ負ケズ/소나기에도 지지 않고',
    '이종간 커뮤니케이션',
    'Dark Cherry Mystery',
  ],
];

const initialBoard = () =>
  Array.from({ length: 5 }, (_, topicIdx) =>
    SCORES.map((baseScore, scoreIdx) => ({
      topicIdx,
      scoreIdx,
      baseScore,
      solved: false,
      solvedBy: null,
      finalScore: baseScore,
    }))
  );

const turnSequence = [
  { team: 0, idx: 0 },
  { team: 1, idx: 0 },
  { team: 0, idx: 1 },
  { team: 1, idx: 1 },
  { team: 0, idx: 2 },
  { team: 1, idx: 2 },
];

const createTeams = (teamAName, teamBName, aPlayers, bPlayers) => [
  {
    name: teamAName || 'A팀',
    players: aPlayers.map((name) => ({ name, items: { x2: true, priority: true } })),
    score: 0,
  },
  {
    name: teamBName || 'B팀',
    players: bPlayers.map((name) => ({ name, items: { x2: true, priority: true } })),
    score: 0,
  },
];

const getAnswerJP = (topicIdx, scoreIdx) => ANSWERS_JP?.[topicIdx]?.[scoreIdx]?.trim() || `${TOPICS[topicIdx].key}-${scoreIdx + 1}.mp3`;
const getAnswerKR = (topicIdx, scoreIdx) => ANSWERS_KR?.[topicIdx]?.[scoreIdx]?.trim() || '';

export default function JPopQuizBoard({
  title = '제2회 가라아게 하이볼 J-POP Quiz',
  musicBasePath = '/musics',
}) {
  const [starter, setStarter] = useState('A');
  const [started, setStarted] = useState(false);
  const [teams, setTeams] = useState(null);
  const [teamAName, setTeamAName] = useState('');
  const [teamBName, setTeamBName] = useState('');
  const [aPlayers, setAPlayers] = useState(['', '', '']);
  const [bPlayers, setBPlayers] = useState(['', '', '']);
  const [board, setBoard] = useState(initialBoard);
  const [turnIndex, setTurnIndex] = useState(0);
  const [pendingItem, setPendingItem] = useState({ x2: false, priority: false });
  const [currentCell, setCurrentCell] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [wasResolved, setWasResolved] = useState(false);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const audioRef = useRef(null);

  const selector = useMemo(() => turnSequence[turnIndex % 6], [turnIndex]);

  const teamName = (idx) => teams?.[idx]?.name || (idx === 0 ? 'A팀' : 'B팀');
  const playerName = (team, idx) => teams?.[team]?.players?.[idx]?.name || '';

  const stopAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    audio.removeAttribute('src');
    audio.load();
  };

  useEffect(() => {
    return () => stopAudio();
  }, []);

  const updatePlayerInput = (team, index, value) => {
    if (team === 'A') {
      const next = [...aPlayers];
      next[index] = value;
      setAPlayers(next);
      return;
    }
    const next = [...bPlayers];
    next[index] = value;
    setBPlayers(next);
  };

  const handleStart = () => {
    if ([...aPlayers, ...bPlayers].some((name) => !name.trim())) {
      window.alert('양 팀 3명 이름을 모두 입력해야 한다.');
      return;
    }

    setTeams(createTeams(teamAName.trim(), teamBName.trim(), aPlayers.map((v) => v.trim()), bPlayers.map((v) => v.trim())));
    setBoard(initialBoard());
    setTurnIndex(starter === 'A' ? 0 : 1);
    setPendingItem({ x2: false, priority: false });
    setStarted(true);
  };

  const handleReset = () => {
    const ok = window.confirm('게임을 초기화할까?');
    if (!ok) return;
    stopAudio();
    setStarter('A');
    setStarted(false);
    setTeams(null);
    setTeamAName('');
    setTeamBName('');
    setAPlayers(['', '', '']);
    setBPlayers(['', '', '']);
    setBoard(initialBoard());
    setTurnIndex(0);
    setPendingItem({ x2: false, priority: false });
    setCurrentCell(null);
    setIsModalOpen(false);
    setWasResolved(false);
    setAnswerRevealed(false);
  };

  const handleToggleX2 = () => {
    if (!teams || pendingItem.priority) return;
    const currentPlayer = teams[selector.team].players[selector.idx];
    if (!currentPlayer.items.x2) return;
    setPendingItem((prev) => ({ ...prev, x2: !prev.x2 }));
  };

  const handleTogglePriority = () => {
    if (!teams || pendingItem.x2) return;
    const currentPlayer = teams[selector.team].players[selector.idx];
    if (!currentPlayer.items.priority) return;
    setPendingItem((prev) => ({ ...prev, priority: !prev.priority }));
  };

  const musicPath = (topicIdx, scoreIdx) => `${musicBasePath}/${TOPICS[topicIdx].key}-${scoreIdx + 1}.mp3`;

  const handleSelectCell = (cell) => {
    if (!teams || cell.solved) return;

    const currentPlayer = teams[selector.team].players[selector.idx];
    const willUseX2 = pendingItem.x2 && currentPlayer.items.x2;
    const willUsePriority = pendingItem.priority && currentPlayer.items.priority;

    const nextTeams = teams.map((team, teamIdx) => ({
      ...team,
      players: team.players.map((player, playerIdx) => {
        if (teamIdx !== selector.team || playerIdx !== selector.idx) return player;
        return {
          ...player,
          items: {
            x2: willUseX2 ? false : player.items.x2,
            priority: willUsePriority ? false : player.items.priority,
          },
        };
      }),
    }));

    setTeams(nextTeams);
    setCurrentCell({
      ...cell,
      x2Applied: Boolean(willUseX2),
      priorityUsedBy: willUsePriority ? selector.team : undefined,
      audioSrc: musicPath(cell.topicIdx, cell.scoreIdx),
    });
    setPendingItem({ x2: false, priority: false });
    setIsModalOpen(true);
    setWasResolved(false);
    setAnswerRevealed(false);
  };

  const handleCloseModal = () => {
    if (currentCell && !wasResolved) {
      setBoard((prev) =>
        prev.map((col, tIdx) =>
          col.map((cell, sIdx) => {
            if (tIdx !== currentCell.topicIdx || sIdx !== currentCell.scoreIdx) return cell;
            return {
              ...cell,
              solved: true,
              solvedBy: null,
              finalScore: cell.baseScore,
            };
          })
        )
      );
      setTurnIndex((prev) => (prev + 1) % 6);
    }
    stopAudio();
    setCurrentCell(null);
    setIsModalOpen(false);
    setWasResolved(false);
    setAnswerRevealed(false);
  };

  const handleReveal = () => {
    setAnswerRevealed(true);
  };

  const handleResolve = (winnerTeam) => {
    if (!currentCell || !teams) return;

    const gained = currentCell.baseScore * (currentCell.x2Applied ? 2 : 1);

    const nextTeams = teams.map((team, idx) =>
      idx === winnerTeam
        ? { ...team, score: team.score + gained }
        : team
    );

    setTeams(nextTeams);
    setBoard((prev) =>
      prev.map((col, tIdx) =>
        col.map((cell, sIdx) => {
          if (tIdx !== currentCell.topicIdx || sIdx !== currentCell.scoreIdx) return cell;
          return {
            ...cell,
            solved: true,
            solvedBy: winnerTeam,
            finalScore: currentCell.x2Applied ? cell.baseScore * 2 : cell.baseScore,
          };
        })
      )
    );

    if (winnerTeam !== selector.team) {
      setTurnIndex((prev) => (prev + 1) % 6);
    }

    setWasResolved(true);
    stopAudio();
    setCurrentCell(null);
    setIsModalOpen(false);
    setAnswerRevealed(false);
  };

  const solvedCount = useMemo(() => board.flat().filter((cell) => cell.solved).length, [board]);

  return (
    <Root>
      <Wrap>
        <Header>
          <Title>{title}</Title>
          <Button $secondary onClick={handleReset}>새 게임</Button>
        </Header>

        {!started ? (
          <Row>
            <Card>
              <SectionTitle>선공 팀 선택</SectionTitle>
              <RadioGroup>
                <RadioLabel $on={starter === 'A'}>
                  <input
                    type="radio"
                    name="starter"
                    value="A"
                    checked={starter === 'A'}
                    onChange={(e) => setStarter(e.target.value)}
                  />
                  A팀
                </RadioLabel>
                <RadioLabel $on={starter === 'B'}>
                  <input
                    type="radio"
                    name="starter"
                    value="B"
                    checked={starter === 'B'}
                    onChange={(e) => setStarter(e.target.value)}
                  />
                  B팀
                </RadioLabel>
              </RadioGroup>
            </Card>

            <Card>
              <SectionTitle>팀 정보 입력</SectionTitle>
              <TeamsRow>
                <div>
                  <Muted $tone="red">A팀 이름</Muted>
                  <TextInput value={teamAName} onChange={(e) => setTeamAName(e.target.value)} placeholder="A팀" />
                  <Muted $tone="red" $spaced>A팀 플레이어</Muted>
                  {aPlayers.map((value, index) => (
                    <TextInput
                      key={`a-${index}`}
                      value={value}
                      onChange={(e) => updatePlayerInput('A', index, e.target.value)}
                      placeholder={`플레이어 ${index + 1}`}
                      $stacked={index > 0}
                    />
                  ))}
                </div>
                <div>
                  <Muted $tone="blue">B팀 이름</Muted>
                  <TextInput value={teamBName} onChange={(e) => setTeamBName(e.target.value)} placeholder="B팀" />
                  <Muted $tone="blue" $spaced>B팀 플레이어</Muted>
                  {bPlayers.map((value, index) => (
                    <TextInput
                      key={`b-${index}`}
                      value={value}
                      onChange={(e) => updatePlayerInput('B', index, e.target.value)}
                      placeholder={`플레이어 ${index + 1}`}
                      $stacked={index > 0}
                    />
                  ))}
                </div>
              </TeamsRow>
              <ButtonRow>
                <Button onClick={handleStart}>게임 시작</Button>
              </ButtonRow>
            </Card>

            <Card $full>
              <SectionTitle>게임 규칙</SectionTitle>
              <RuleList>
                <li>문제는 같은 주제의 낮은 점수부터 선택할 수 있다.</li>
                <li>선택한 팀이 문제를 맞추면 다음 문제를 연속으로 선택할 수 있고, 아니면 상대팀에게 선택권이 넘어간다.</li>
                <li>정답을 맞추지 못하면 10초간 상대팀이 우선적으로 답할 기회를 가진다.</li>
                <li>자신의 선택 차례일 때 가진 아이템 중 하나를 사용할 수 있다.</li>
                <li>각 플레이어는 두 개의 아이템을 한 번씩만 사용할 수 있고, 동시에 사용할 수 없다.</li>
                <li><b>✖</b> X2 : 다음 문제의 배점이 2배가 된다. 상대팀이 정답을 맞혀도 그대로 적용된다.</li>
                <li><b>⚡</b> 우선권 : 다음 문제에서 처음 30초간 상대팀보다 우선적으로 답할 기회를 가진다.</li>
              </RuleList>
            </Card>
          </Row>
        ) : (
          <BoardCard>
            <TopGrid>
              <ScoreCard $team="A">
                <ScoreHeader>
                  <div>
                    <strong>{teamName(0)}</strong>
                    <ScoreBadge>점수</ScoreBadge>
                  </div>
                  <ScoreValue>{teams?.[0]?.score ?? 0}</ScoreValue>
                </ScoreHeader>
                <PlayersGrid>
                  {teams?.[0]?.players.map((player, index) => (
                    <PlayerCard key={`team-a-${player.name}-${index}`} $active={selector.team === 0 && selector.idx === index}>
                      <PlayerName>{player.name}</PlayerName>
                      <Icons>
                        <Icon $off={!player.items.x2}>✖</Icon>
                        <Icon $off={!player.items.priority}>⚡</Icon>
                      </Icons>
                    </PlayerCard>
                  ))}
                </PlayersGrid>
              </ScoreCard>

              <TurnBox>
                <Muted>현재 곡 선택 차례</Muted>
                <TurnText>{`${selector.team === 0 ? teamName(0) : teamName(1)} — ${playerName(selector.team, selector.idx)}`}</TurnText>
                <TurnItemButtons>
                  <RoundButton
                    type="button"
                    onClick={handleToggleX2}
                    disabled={!teams?.[selector.team]?.players?.[selector.idx]?.items?.x2 || pendingItem.priority}
                    $on={pendingItem.x2}
                  >
                    ✖
                  </RoundButton>
                  <RoundButton
                    type="button"
                    onClick={handleTogglePriority}
                    disabled={!teams?.[selector.team]?.players?.[selector.idx]?.items?.priority || pendingItem.x2}
                    $on={pendingItem.priority}
                  >
                    ⚡
                  </RoundButton>
                </TurnItemButtons>
              </TurnBox>

              <ScoreCard $team="B">
                <ScoreHeader>
                  <div>
                    <strong>{teamName(1)}</strong>
                    <ScoreBadge>점수</ScoreBadge>
                  </div>
                  <ScoreValue>{teams?.[1]?.score ?? 0}</ScoreValue>
                </ScoreHeader>
                <PlayersGrid>
                  {teams?.[1]?.players.map((player, index) => (
                    <PlayerCard key={`team-b-${player.name}-${index}`} $active={selector.team === 1 && selector.idx === index}>
                      <PlayerName>{player.name}</PlayerName>
                      <Icons>
                        <Icon $off={!player.items.x2}>✖</Icon>
                        <Icon $off={!player.items.priority}>⚡</Icon>
                      </Icons>
                    </PlayerCard>
                  ))}
                </PlayersGrid>
              </ScoreCard>
            </TopGrid>

            <Card $spaced>
              <BoardGrid>
                {TOPICS.map((topic, tIdx) => (
                  <Column key={topic.key}>
                    <TopicHeader $variant={topic.className}>{topic.key}</TopicHeader>
                    {SCORES.map((score, sIdx) => {
                      const cell = board[tIdx][sIdx];
                      const displayScore = cell.solved ? cell.finalScore : pendingItem.x2 ? score * 2 : score;
                      return (
                        <CellButton
                          key={`${topic.key}-${score}`}
                          disabled={cell.solved}
                          onClick={() => handleSelectCell(cell)}
                          $solvedBy={cell.solvedBy}
                        >
                          {displayScore}
                        </CellButton>
                      );
                    })}
                  </Column>
                ))}
              </BoardGrid>
              <SolvedInfo>{`완료된 문제 ${solvedCount} / ${TOPICS.length * SCORES.length}`}</SolvedInfo>
            </Card>
          </BoardCard>
        )}

        <Footer>© 가라아게 하이볼 J-POP Quiz</Footer>
      </Wrap>

      {isModalOpen && currentCell && (
        <ModalOverlay>
          <ModalSheet>
            <ModalHeader>
              <div>
                <Muted>문제</Muted>
                <QuestionTitle>
                  {TOPICS[currentCell.topicIdx].key} — {currentCell.baseScore}점{currentCell.x2Applied ? ' (X2 적용)' : ''}
                </QuestionTitle>
                {typeof currentCell.priorityUsedBy === 'number' && (
                  <Muted>{`우선권: ${teamName(currentCell.priorityUsedBy)}`}</Muted>
                )}
              </div>
              <Button $secondary onClick={handleCloseModal}>포기</Button>
            </ModalHeader>

            <InnerCard $audio>
              <Muted>노래 재생</Muted>
              <AudioPlayer ref={audioRef} controls src={currentCell.audioSrc} />
              <Muted>{currentCell.audioSrc}</Muted>
            </InnerCard>

            <ModalBody>
              <RevealCard>
                <RevealText $revealed={answerRevealed}>
                  {answerRevealed ? (
                    <RevealContent>
                      <div>{getAnswerJP(currentCell.topicIdx, currentCell.scoreIdx)}</div>
                      {getAnswerKR(currentCell.topicIdx, currentCell.scoreIdx) && (
                        <small>{getAnswerKR(currentCell.topicIdx, currentCell.scoreIdx)}</small>
                      )}
                    </RevealContent>
                  ) : null}
                </RevealText>
                <RevealButtonWrap>
                  <Button $secondary onClick={handleReveal} disabled={answerRevealed}>🔓 정답 공개</Button>
                </RevealButtonWrap>
              </RevealCard>

              <InnerCard>
                <Muted>정답팀 선택</Muted>
                <VerticalButtons>
                  <Button $secondary disabled={!answerRevealed} onClick={() => handleResolve(0)}>✅ {teamName(0)}</Button>
                  <Button $secondary disabled={!answerRevealed} onClick={() => handleResolve(1)}>✅ {teamName(1)}</Button>
                </VerticalButtons>
              </InnerCard>
            </ModalBody>
          </ModalSheet>
        </ModalOverlay>
      )}
    </Root>
  );
}

const Root = styled.div`
  --bg: #f6f7f9;
  --text: #111;
  --muted: #6b7280;
  --card: #fff;
  --line: #e5e7eb;
  --red: #fee2e2;
  --red-line: #fecaca;
  --blue: #dbeafe;
  --blue-line: #bfdbfe;
  --rose: #ffe4e6;
  --amber: #fef3c7;
  --emerald: #d1fae5;
  --sky: #e0f2fe;
  --violet: #ede9fe;
  --answer-bg: #fff7ed;
  --answer-line: #fed7aa;
  min-height: 100%;
  background: linear-gradient(#fafafa, #eef1f6);
  color: var(--text);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  line-height: 1.35;
  * {
    box-sizing: border-box;
  }
`;

const Wrap = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 16px;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 28px;
  font-weight: 800;
`;

const Row = styled.section`
  display: grid;
  gap: 16px;

  @media (min-width: 900px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const Card = styled.section`
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);

  ${(props) =>
    props.$full &&
    css`
      grid-column: 1 / -1;
    `}

  ${(props) =>
    props.$spaced &&
    css`
      margin-top: 12px;
    `}
`;

const BoardCard = styled(Card)``;

const SectionTitle = styled.h2`
  margin: 0 0 12px;
  font-size: 18px;
  font-weight: 700;
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const RadioLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: ${(props) => (props.$on ? '#f8fafc' : '#fff')};
  border-color: ${(props) => (props.$on ? '#cbd5e1' : 'var(--line)')};
  cursor: pointer;
`;

const TeamsRow = styled.div`
  display: grid;
  gap: 12px;

  @media (min-width: 900px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const Muted = styled.div`
  color: ${(props) => {
    if (props.$tone === 'red') return '#dc2626';
    if (props.$tone === 'blue') return '#2563eb';
    return 'var(--muted)';
  }};
  font-size: 12px;
  margin-bottom: ${(props) => (props.$spaced ? '6px' : '6px')};
  ${(props) =>
    props.$spaced &&
    css`
      margin-top: 10px;
    `}
`;

const TextInput = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid var(--line);
  border-radius: 10px;
  margin-top: ${(props) => (props.$stacked ? '8px' : '0')};
`;

const ButtonRow = styled.div`
  margin-top: 12px;
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 14px;
  border: 1px solid ${(props) => (props.$secondary ? 'var(--line)' : '#000')};
  border-radius: 10px;
  background: ${(props) => (props.$secondary ? '#fff' : '#111')};
  color: ${(props) => (props.$secondary ? '#111' : '#fff')};
  font-weight: 700;
  cursor: pointer;
  transition: 0.15s ease;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const RuleList = styled.ul`
  margin: 8px 0 0 18px;
  color: var(--muted);
  font-size: 12px;

  li + li {
    margin-top: 4px;
  }
`;

const TopGrid = styled.div`
  display: grid;
  gap: 12px;

  @media (min-width: 900px) {
    grid-template-columns: 1fr 1fr 1fr;
  }
`;

const ScoreCard = styled(Card)`
  background: ${(props) => (props.$team === 'A' ? 'var(--red)' : 'var(--blue)')};
  border-color: ${(props) => (props.$team === 'A' ? 'var(--red-line)' : 'var(--blue-line)')};
  box-shadow: none;
`;

const ScoreHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const ScoreBadge = styled.span`
  margin-left: 6px;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 2px 6px;
  background: #fff;
  color: var(--muted);
  font-size: 12px;
`;

const ScoreValue = styled.div`
  font-size: 24px;
  font-weight: 800;
`;

const PlayersGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  margin-top: 10px;
`;

const PlayerCard = styled.div`
  display: grid;
  grid-template-rows: auto auto;
  gap: 6px;
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 8px;
  background: #fff;
  min-height: 56px;
  transition: 0.15s ease;
  outline: ${(props) => (props.$active ? '3px solid rgba(0,0,0,.08)' : 'none')};
`;

const PlayerName = styled.div`
  font-weight: 600;
  white-space: normal;
  overflow-wrap: anywhere;
`;

const Icons = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
`;

const Icon = styled.span`
  font-size: 18px;
  line-height: 1;
  width: 22px;
  text-align: center;
  opacity: ${(props) => (props.$off ? 0.3 : 1)};
`;

const TurnBox = styled(Card)`
  box-shadow: none;
`;

const TurnText = styled.div`
  font-weight: 700;
  margin-top: 4px;
`;

const TurnItemButtons = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 10px;
`;

const RoundButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 1px solid var(--line);
  display: grid;
  place-items: center;
  font-size: 18px;
  background: ${(props) => (props.$on ? '#111' : '#fff')};
  color: ${(props) => (props.$on ? '#fff' : '#111')};
  cursor: pointer;
  transition: 0.15s ease;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const BoardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;

  @media (max-width: 899px) {
    grid-template-columns: 1fr;
  }
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TopicHeader = styled.div`
  position: sticky;
  top: 0;
  text-align: center;
  font-weight: 700;
  padding: 8px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: ${(props) => {
    if (props.$variant === 'rose') return 'var(--rose)';
    if (props.$variant === 'amber') return 'var(--amber)';
    if (props.$variant === 'emerald') return 'var(--emerald)';
    if (props.$variant === 'sky') return 'var(--sky)';
    if (props.$variant === 'violet') return 'var(--violet)';
    return '#fafafa';
  }};
`;

const CellButton = styled.button`
  height: 52px;
  border: 1px solid
    ${(props) => {
      if (props.$solvedBy === 0) return 'var(--red-line)';
      if (props.$solvedBy === 1) return 'var(--blue-line)';
      return 'var(--line)';
    }};
  border-radius: 10px;
  background: ${(props) => {
    if (props.$solvedBy === 0) return 'var(--red)';
    if (props.$solvedBy === 1) return 'var(--blue)';
    return '#f8fafc';
  }};
  font-weight: 800;
  font-size: 18px;
  cursor: pointer;
  transition: 0.15s ease;

  &:hover:not(:disabled) {
    transform: scale(1.02);
  }

  &:disabled {
    opacity: ${(props) => (props.$solvedBy === null ? 0.55 : 1)};
    cursor: not-allowed;
    transform: none;
  }
`;

const SolvedInfo = styled.div`
  margin-top: 8px;
  color: var(--muted);
  font-size: 12px;
`;

const Footer = styled.footer`
  margin-top: 24px;
  text-align: center;
  font-size: 12px;
  color: var(--muted);
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 1000;
`;

const ModalSheet = styled.div`
  max-width: 900px;
  width: 100%;
  background: #fff;
  border-radius: 16px;
  border: 1px solid var(--line);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  padding: 16px;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

const QuestionTitle = styled.div`
  font-weight: 800;
  font-size: 18px;
`;

const InnerCard = styled(Card)`
  margin-top: ${(props) => (props.$audio ? '10px' : '0')};
  background: ${(props) => (props.$audio ? '#f6f8fb' : '#fff')};
  box-shadow: none;
`;

const AudioPlayer = styled.audio`
  width: 100%;
  margin-top: 6px;
`;

const ModalBody = styled.div`
  display: grid;
  gap: 12px;
  margin-top: 12px;
`;

const RevealCard = styled(Card)`
  position: relative;
  min-height: 96px;
  display: flex;
  align-items: center;
  padding-right: 160px;
  overflow: hidden;

  @media (max-width: 640px) {
    padding-right: 16px;
    padding-bottom: 70px;
  }
`;

const RevealText = styled.div`
  width: 100%;
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #111;
  transition: 0.15s ease;

  ${(props) =>
    props.$revealed &&
    css`
      font-weight: 900;
      font-size: clamp(15px, 5vw, 30px);
      background: var(--answer-bg);
      border: 2px solid var(--answer-line);
      border-radius: 12px;
      padding: 10px 12px;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
      letter-spacing: 0.3px;
    `}
`;

const RevealContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  max-width: 100%;

  > div {
    font-weight: 900;
    line-height: 1.1;
    text-align: center;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  > small {
    font-weight: 700;
    font-size: 0.6em;
    line-height: 1.1;
    color: #374151;
    opacity: 0.9;
    text-align: center;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const RevealButtonWrap = styled.div`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);

  @media (max-width: 640px) {
    top: auto;
    bottom: 16px;
    right: 16px;
    transform: none;
  }
`;

const VerticalButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 6px;
`;