import { useNavigate } from 'react-router-dom';
import { useGame } from '../state/GameProvider';
import { ALL_QUESTIONS, QUESTION_BY_ID } from '../data/questions';
import { CATEGORIES, CATEGORY_BY_ID } from '../data/categories';
import {
  isDailyBonusEligible, mulberry32, pickDailyQuestions, todayString, unlockedQuestions,
} from '../domain/dailyGame';
import { TIER_NAMES } from '../types';
import type { CategoryId, Question } from '../types';
import { Icon, ISLAND_COLOR, Landmark } from '../components/Icons';

const REVIEW_BATCH = 10;

export default function WrongNotes() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const save = state.save;

  const pool = unlockedQuestions(save, ALL_QUESTIONS);
  const bonusLeft = isDailyBonusEligible(save, todayString());

  const questions = save.wrongNotes
    .map((id) => QUESTION_BY_ID[id])
    .filter((q): q is Question => Boolean(q));

  const grouped = CATEGORIES
    .map((c) => ({ category: c.id as CategoryId, items: questions.filter((q) => q.category === c.id) }))
    .filter((g) => g.items.length > 0);

  function startDaily() {
    const picked = pickDailyQuestions(save, ALL_QUESTIONS, mulberry32(Date.now() & 0xffff));
    if (picked.length === 0) return;
    dispatch({ type: 'START_DAILY', questions: picked });
    navigate('/quiz');
  }

  function startReview() {
    const batch = questions.slice(0, REVIEW_BATCH);
    if (batch.length === 0) return;
    dispatch({ type: 'START_REVIEW', questions: batch });
    navigate('/quiz');
  }

  return (
    <div className="screen">
      <h1 style={{ fontSize: 22, margin: '4px 4px 14px' }}>복습</h1>

      <div
        className="puffy"
        style={{ padding: 14, marginBottom: 14, background: 'linear-gradient(160deg,#ffc2a8,#ff8a65)', color: '#fff' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Icon name="dice" size={54} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 900, fontSize: 17 }}>섞어 풀기</div>
            <div style={{ fontSize: 11, opacity: 0.95 }}>
              {bonusLeft
                ? '연 섬들에서 5문제를 섞어요 · 오늘 보너스 30,000원'
                : '오늘 보너스는 받았어요 · 문제 상금은 그대로'}
            </div>
          </div>
        </div>
        <button
          type="button"
          className="thick-accent"
          disabled={pool.length === 0}
          onClick={startDaily}
          style={{ marginTop: 10, background: 'linear-gradient(180deg,#ffe28a,#ffcf4d)', color: '#8a5a00', padding: 10 }}
        >
          {pool.length === 0 ? '문제 준비 중' : bonusLeft ? '섞어 풀기 시작 ▶' : '한 판 더 ▶'}
        </button>
      </div>

      <div className="puffy" style={{ padding: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: questions.length ? 12 : 0 }}>
          <Icon name="book" size={40} />
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 16, margin: 0 }}>오답노트</h2>
            <div className="muted" style={{ fontSize: 11 }}>맞히면 목록에서 빠지고 5,000원</div>
          </div>
          {questions.length > 0 && (
            <button type="button" className="thick-accent" onClick={startReview} style={{ width: 'auto', padding: '8px 14px', fontSize: 13 }}>
              복습 시작 · {Math.min(questions.length, REVIEW_BATCH)}문제
            </button>
          )}
        </div>

        {questions.length === 0 ? (
          <p className="muted" style={{ fontSize: 13, textAlign: 'center', margin: '18px 0 6px' }}>
            아직 틀린 문제가 없어요. 섬으로 떠나 보세요!
          </p>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {grouped.map((group) => (
              <section key={group.category}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <Landmark category={group.category} size={26} />
                  <b style={{ fontSize: 13 }}>{CATEGORY_BY_ID[group.category].name}</b>
                  <span className="muted" style={{ fontSize: 11 }}>{group.items.length}문제</span>
                </div>
                <div style={{ display: 'grid', gap: 6 }}>
                  {group.items.map((q) => (
                    <div
                      key={q.id}
                      style={{
                        borderRadius: 14, padding: '9px 12px', fontSize: 13, lineHeight: 1.5,
                        background: `${ISLAND_COLOR[group.category]}66`,
                      }}
                    >
                      {q.prompt}
                      <span className="muted" style={{ display: 'block', fontSize: 11, marginTop: 2 }}>
                        {TIER_NAMES[q.tier]} {q.stage}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
