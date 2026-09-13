import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../state/GameProvider';
import {
  currentQuestion, canUseItem, isFinished, ITEM_EMOJI, ITEM_LABEL, ITEM_PRICE,
} from '../domain/quizSession';
import type { ItemId } from '../domain/quizSession';
import { todayString } from '../domain/dailyGame';
import { CATEGORY_BY_ID } from '../data/categories';
import { TIER_NAMES } from '../types';
import { formatMoney } from '../components/Money';
import { ProgressBar } from '../components/ProgressBar';

const ITEMS: ItemId[] = ['half', 'hint', 'pass'];

export default function Quiz() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const session = state.session;
  // react-router는 내부적으로 navigate()를 startTransition으로 처리하므로,
  // FINISH로 session을 비운 직후의 렌더는 아직 /quiz에 머문 채로 한 번 더 일어날 수 있다.
  // 그 순간을 "세션 없이 들어옴"으로 오인해 홈으로 되돌리지 않도록 표시해 둔다.
  const leavingRef = useRef(false);

  // 렌더 중에 dispatch하면 안 되므로 세션 종료 처리는 모두 effect에서 한다.
  useEffect(() => {
    if (!session) {
      if (!leavingRef.current) navigate('/', { replace: true });
      return;
    }
    if (isFinished(session)) {
      leavingRef.current = true;
      dispatch({ type: 'FINISH', today: todayString() });
      navigate('/result', { replace: true });
    }
  }, [session, dispatch, navigate]);

  if (!session || isFinished(session)) return null;

  const q = currentQuestion(session);
  const removed = session.removedChoices[session.index] ?? [];
  const used = session.usedItems[session.index] ?? [];
  const hintOpen = session.hintOpen[session.index] === true;
  const picked = session.pickedIndex;

  const heading =
    session.mode.kind === 'stage'
      ? `${CATEGORY_BY_ID[session.mode.category].name} · ${TIER_NAMES[session.mode.tier]} ${session.mode.stage}`
      : session.mode.kind === 'daily'
        ? '오늘의 볼게임'
        : '오답노트 복습';

  function exit() {
    if (session!.spent > 0) {
      const ok = window.confirm(
        '지금 나가면 이 판은 기록되지 않아요. 이미 쓴 아이템 비용은 돌려받지 못합니다. 나갈까요?',
      );
      if (!ok) return;
    }
    dispatch({ type: 'ABANDON' });
    navigate('/', { replace: true });
  }

  function choiceStyle(i: number) {
    if (!session!.revealed) {
      return { background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' };
    }
    if (i === q.answerIndex) {
      return { background: 'var(--ok-bg)', borderColor: 'var(--ok)', color: '#3f7a15' };
    }
    if (i === picked) {
      return { background: 'var(--no-bg)', borderColor: 'var(--no)', color: '#b2372a' };
    }
    return { background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--muted)' };
  }

  return (
    <div className="screen">
      <header
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: 12, fontWeight: 800, color: 'var(--muted)', marginBottom: 8,
        }}
      >
        <span>{heading}</span>
        <span>
          {session.index + 1}/{session.questions.length}
          <button
            type="button"
            onClick={exit}
            style={{ background: 'none', border: 'none', marginLeft: 10, color: 'var(--muted)' }}
          >
            나가기
          </button>
        </span>
      </header>

      <ProgressBar value={session.index} max={session.questions.length} />

      <h2 style={{ fontSize: 17, lineHeight: 1.5, margin: '18px 0 16px' }}>{q.prompt}</h2>

      {hintOpen && (
        <p
          style={{
            background: 'var(--hint-bg)', border: '2px solid var(--hint)', borderRadius: 12,
            padding: '10px 12px', fontSize: 13, lineHeight: 1.5, margin: '0 0 14px',
          }}
        >
          <span aria-hidden="true">💡 </span>
          {q.hint}
        </p>
      )}

      <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
        {q.choices.map((choice, i) => {
          const gone = removed.includes(i);
          return (
            <button
              key={choice}
              type="button"
              className="thick"
              disabled={gone || session.revealed}
              onClick={() => dispatch({ type: 'ANSWER', choiceIndex: i })}
              style={{
                ...choiceStyle(i),
                textDecoration: gone ? 'line-through' : 'none',
                opacity: gone ? 0.3 : 1,
              }}
            >
              {choice}
              {session.revealed && i === q.answerIndex ? ' ✓' : ''}
            </button>
          );
        })}
      </div>

      {session.revealed ? (
        <>
          <p
            style={{
              background: 'var(--ok-bg)', borderLeft: '4px solid var(--accent)',
              borderRadius: 10, padding: '10px 12px', fontSize: 13, lineHeight: 1.6,
              margin: '0 0 14px', color: 'var(--text)',
            }}
          >
            {q.explanation}
          </p>
          <button type="button" className="thick-accent" onClick={() => dispatch({ type: 'NEXT' })}>
            계속
          </button>
        </>
      ) : (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {ITEMS.map((item) => {
            const alreadyUsed = used.includes(item);
            return (
              <button
                key={item}
                type="button"
                className="thick"
                disabled={alreadyUsed || !canUseItem(session, item, state.save.wallet)}
                onClick={() => dispatch({ type: 'USE_ITEM', item })}
                style={{ textAlign: 'center', padding: '8px 4px', fontSize: 11 }}
              >
                <span style={{ display: 'block', fontSize: 16 }}>{ITEM_EMOJI[item]}</span>
                {alreadyUsed ? '사용됨' : ITEM_LABEL[item]}
                <span className="muted" style={{ display: 'block', fontSize: 9 }}>
                  {alreadyUsed ? '' : formatMoney(ITEM_PRICE[item])}
                </span>
              </button>
            );
          })}
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent)', width: 72 }}>
            지갑
            <br />
            {formatMoney(state.save.wallet)}
          </span>
        </div>
      )}
    </div>
  );
}
