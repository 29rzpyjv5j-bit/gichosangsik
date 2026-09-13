import { useNavigate } from 'react-router-dom';
import { useGame } from '../state/GameProvider';
import { QUESTION_BY_ID } from '../data/questions';
import { CATEGORIES, CATEGORY_BY_ID } from '../data/categories';
import { TIER_NAMES } from '../types';
import type { CategoryId, Question } from '../types';

const REVIEW_BATCH = 10;

export default function WrongNotes() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();

  const questions = state.save.wrongNotes
    .map((id) => QUESTION_BY_ID[id])
    .filter((q): q is Question => Boolean(q));

  const grouped = CATEGORIES
    .map((c) => ({ category: c.id as CategoryId, items: questions.filter((q) => q.category === c.id) }))
    .filter((g) => g.items.length > 0);

  function startReview() {
    const batch = questions.slice(0, REVIEW_BATCH);
    if (batch.length === 0) return;
    dispatch({ type: 'START_REVIEW', questions: batch });
    navigate('/quiz');
  }

  return (
    <div className="screen">
      <button
        type="button"
        className="muted"
        style={{ background: 'none', border: 'none', padding: 0, marginBottom: 12 }}
        onClick={() => navigate('/')}
      >
        ‹ 홈
      </button>
      <h2 style={{ fontSize: 18, margin: '0 0 4px' }}>오답노트</h2>
      <p className="muted" style={{ fontSize: 12, margin: '0 0 14px' }}>
        맞히면 목록에서 빠집니다 · 정답마다 5,000원
      </p>

      {questions.length === 0 ? (
        <p style={{ fontSize: 13, padding: '30px 0', textAlign: 'center' }}>
          아직 틀린 문제가 없어요. 한 판 풀고 오세요!
        </p>
      ) : (
        <>
          <button
            type="button"
            className="thick-accent"
            onClick={startReview}
            style={{ marginBottom: 16 }}
          >
            복습 시작 · {Math.min(questions.length, REVIEW_BATCH)}문제
          </button>

          {grouped.map((group) => (
            <section key={group.category} style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 13, margin: '0 0 8px' }}>
                {CATEGORY_BY_ID[group.category].emoji} {CATEGORY_BY_ID[group.category].name}
                <span className="muted" style={{ fontWeight: 400 }}> · {group.items.length}문제</span>
              </h3>
              <div style={{ display: 'grid', gap: 6 }}>
                {group.items.map((q) => (
                  <div
                    key={q.id}
                    style={{
                      border: '2px solid var(--border)', borderRadius: 12,
                      padding: '10px 12px', fontSize: 13, lineHeight: 1.5,
                    }}
                  >
                    {q.prompt}
                    <span className="muted" style={{ display: 'block', fontSize: 11, marginTop: 3 }}>
                      {TIER_NAMES[q.tier]} {q.stage}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </>
      )}
    </div>
  );
}
