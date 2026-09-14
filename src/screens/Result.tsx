import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../state/GameProvider';
import { BADGE_BY_ID } from '../data/badges';
import { CATEGORY_BY_ID } from '../data/categories';
import { questionsOfStage } from '../data/questions';
import { TIER_NAMES } from '../types';
import { formatMoney } from '../components/Money';
import { Medal } from '../components/Medal';
import { Overlay } from '../components/Overlay';
import { getLevel } from '../domain/level';

export default function Result() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const result = state.lastResult;
  const [levelUpOpen, setLevelUpOpen] = useState(true);
  // react-router는 내부적으로 navigate()를 startTransition으로 처리하므로,
  // START_STAGE/CLEAR_RESULT로 lastResult를 비운 직후의 렌더는 아직 /result에
  // 머문 채로 한 번 더 일어날 수 있다. 그 순간을 "결과 없이 들어옴"으로 오인해
  // 홈으로 되돌리지 않도록 표시해 둔다. (Quiz.tsx의 leavingRef와 같은 패턴)
  const leavingRef = useRef(false);

  useEffect(() => {
    if (!result && !leavingRef.current) navigate('/', { replace: true });
  }, [result, navigate]);

  if (!result) return null;

  const stage = result.mode.kind === 'stage' ? result.mode : null;
  const title = stage
    ? result.cleared
      ? '스테이지 클리어!'
      : '아쉬워요'
    : result.mode.kind === 'daily'
      ? '오늘의 볼게임 끝!'
      : '복습 끝!';

  const subtitle = stage
    ? `${CATEGORY_BY_ID[stage.category].name} · ${TIER_NAMES[stage.tier]} ${stage.stage} · ${result.total}문제 중 ${result.correctCount}개 정답`
    : `${result.total}문제 중 ${result.correctCount}개 정답`;

  function retry() {
    if (!stage) return;
    leavingRef.current = true;
    const questions = questionsOfStage(stage.category, stage.tier, stage.stage);
    dispatch({
      type: 'START_STAGE',
      category: stage.category,
      tier: stage.tier,
      stage: stage.stage,
      questions,
    });
    navigate('/quiz', { replace: true });
  }

  function goNext() {
    if (!stage || !result || !result.next) return;
    leavingRef.current = true;
    const questions = questionsOfStage(stage.category, result.next.tier, result.next.stage);
    dispatch({
      type: 'START_STAGE',
      category: stage.category,
      tier: result.next.tier,
      stage: result.next.stage,
      questions,
    });
    navigate('/quiz', { replace: true });
  }

  function leave() {
    leavingRef.current = true;
    dispatch({ type: 'CLEAR_RESULT' });
    navigate('/', { replace: true });
  }

  const level = getLevel(state.save.totalPrize);

  return (
    <div className="screen">
      <div style={{ textAlign: 'center', padding: '18px 0 10px' }}>
        <div style={{ fontSize: 36 }}>{result.cleared || !stage ? '🎉' : '💪'}</div>
        <h2 style={{ fontSize: 18, margin: '6px 0 4px', color: 'var(--accent)' }}>{title}</h2>
        <p className="muted" style={{ fontSize: 12, margin: 0 }}>{subtitle}</p>
      </div>

      <div style={{ margin: '14px 0' }}>
        {result.lines.map((line) => (
          <div
            key={line.label}
            style={{
              display: 'flex', justifyContent: 'space-between', fontSize: 13,
              padding: '7px 0', borderBottom: '1px dashed var(--border)',
            }}
          >
            <span>{line.label}</span>
            <b>{formatMoney(line.amount)}</b>
          </div>
        ))}
        <div
          style={{
            display: 'flex', justifyContent: 'space-between', fontSize: 16,
            fontWeight: 900, padding: '11px 0 2px', color: 'var(--accent)',
          }}
        >
          <span>합계</span>
          <span>{formatMoney(result.totalPrize)}</span>
        </div>
      </div>

      {result.newBadges.length > 0 && (
        <div style={{ display: 'grid', gap: 8, marginBottom: 14 }}>
          {result.newBadges.map((id) => {
            const badge = BADGE_BY_ID[id];
            if (!badge) return null;
            return (
              <div
                key={id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: 'var(--ok-bg)', border: '2px dashed var(--ok)',
                  borderRadius: 12, padding: 10,
                }}
              >
                <Medal emoji={badge.emoji} group={badge.group} earned size={38} />
                <div style={{ fontSize: 12 }}>
                  <b style={{ display: 'block', fontSize: 13 }}>새 뱃지 · {badge.name}</b>
                  획득했어요
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ display: 'grid', gap: 8 }}>
        {stage && (
          <button type="button" className="thick" onClick={retry}>
            다시 하기
          </button>
        )}
        {stage && result.next && (
          <button type="button" className="thick-accent" onClick={goNext}>
            다음 스테이지
          </button>
        )}
        <button type="button" className="thick" onClick={leave}>
          나가기
        </button>
      </div>

      {result.levelUp && levelUpOpen && (
        <Overlay onClose={() => setLevelUpOpen(false)}>
          <div
            style={{
              background: 'linear-gradient(165deg, var(--accent), var(--accent-shadow))',
              color: '#fff', borderRadius: 22, padding: '26px 18px 22px', textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 40 }}>🎊</div>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.14em', opacity: 0.9 }}>
              LEVEL UP
            </div>
            <div style={{ fontSize: 30, fontWeight: 900 }}>Lv.{result.levelUp.level}</div>
            <div style={{ fontSize: 15, fontWeight: 800 }}>{result.levelUp.title}</div>
            <div style={{ fontSize: 11, opacity: 0.9, marginTop: 12 }}>
              {level.remaining === null
                ? `누적 ${formatMoney(state.save.totalPrize)}`
                : `다음 레벨까지 ${formatMoney(level.remaining)} · 누적 ${formatMoney(state.save.totalPrize)}`}
            </div>
            <button
              type="button"
              onClick={() => setLevelUpOpen(false)}
              style={{
                marginTop: 16, width: '100%', border: 'none', borderRadius: 12,
                padding: '11px 0', background: '#fff', color: 'var(--accent-shadow)',
                fontWeight: 900, fontSize: 13,
              }}
            >
              좋아요
            </button>
          </div>
        </Overlay>
      )}
    </div>
  );
}
