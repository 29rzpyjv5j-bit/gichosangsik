import { useNavigate } from 'react-router-dom';
import { useGame } from '../state/GameProvider';
import { getLevel } from '../domain/level';
import { clearedCount, nextStageAnywhere } from '../domain/unlock';
import {
  isDailyBonusEligible, mulberry32, pickDailyQuestions, todayString, unlockedQuestions,
} from '../domain/dailyGame';
import { ALL_QUESTIONS } from '../data/questions';
import { CATEGORIES, CATEGORY_BY_ID } from '../data/categories';
import { LEVELS } from '../data/levels';
import { AVATARS } from '../data/shop';
import { TIER_NAMES } from '../types';
import { formatMoney } from '../components/Money';
import { ThickButton } from '../components/ThickButton';
import { ProgressBar } from '../components/ProgressBar';

const cardStyle = {
  border: '2px solid var(--border)',
  borderBottomWidth: 4,
  borderRadius: 16,
  background: 'var(--surface)',
  color: 'var(--text)',
} as const;

export default function Home() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const save = state.save;
  const level = getLevel(save.totalPrize);
  const levelFloor = LEVELS[level.level - 1].threshold;
  const today = todayString();
  const pool = unlockedQuestions(save, ALL_QUESTIONS);
  const bonusLeft = isDailyBonusEligible(save, today);
  const avatar = AVATARS.find((a) => a.id === save.settings.avatar)?.emoji ?? '🙂';
  const resume = nextStageAnywhere(save, save.lastPlayed?.category ?? null);

  function startDaily() {
    const questions = pickDailyQuestions(save, ALL_QUESTIONS, mulberry32(Date.now() & 0xffff));
    if (questions.length === 0) return;
    dispatch({ type: 'START_DAILY', questions });
    navigate('/quiz');
  }

  function startResume() {
    if (!resume) return;
    navigate(`/category/${resume.category}`);
  }

  return (
    <div className="screen">
      {/* 프로필 카드 */}
      <button
        type="button"
        aria-label="프로필·설정"
        onClick={() => navigate('/profile')}
        style={{ ...cardStyle, width: '100%', padding: 16, marginBottom: 14, textAlign: 'left' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span
            aria-hidden
            style={{
              width: 56, height: 56, borderRadius: '50%', flex: '0 0 auto',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 34, background: 'var(--ok-bg)',
            }}
          >
            {avatar}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--accent)' }}>
              Lv.{level.level}
            </div>
            <div style={{ fontSize: 19, fontWeight: 900, marginBottom: 6 }}>{level.title}</div>
            <ProgressBar
              value={save.totalPrize - levelFloor}
              max={level.nextThreshold === null ? 1 : level.nextThreshold - levelFloor}
            />
            <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>
              {level.remaining === null
                ? '최고 레벨이에요'
                : `다음 레벨까지 ${formatMoney(level.remaining)}`}
            </div>
          </div>
          <span aria-hidden className="muted" style={{ fontSize: 22 }}>›</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14 }}>
          <div style={{ background: 'var(--bg)', borderRadius: 10, padding: '8px 10px' }}>
            <div className="muted" style={{ fontSize: 11 }}>누적 상금</div>
            <div style={{ fontSize: 16, fontWeight: 900 }}>
              <span>{formatMoney(save.totalPrize)}</span>
            </div>
          </div>
          <div style={{ background: 'var(--bg)', borderRadius: 10, padding: '8px 10px' }}>
            <div className="muted" style={{ fontSize: 11 }}>지갑</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--accent)' }}>
              <span>{formatMoney(save.wallet)}</span>
            </div>
          </div>
        </div>
      </button>

      {/* 오늘의 볼게임 */}
      <div style={{ marginBottom: 12 }}>
        <ThickButton accent onClick={startDaily} disabled={pool.length === 0}>
          {pool.length === 0
            ? '문제 준비 중'
            : bonusLeft
              ? '오늘의 볼게임 시작 ▶'
              : '한 판 더 ▶'}
        </ThickButton>
        <p className="muted" style={{ fontSize: 11, margin: '6px 2px 0' }}>
          {bonusLeft
            ? '여러 카테고리를 섞은 5문제 · 완료하면 보너스 30,000원'
            : '오늘 보너스는 받았어요. 문제 상금은 그대로 받습니다'}
        </p>
      </div>

      <div style={{ marginBottom: 20 }}>
        <ThickButton onClick={startResume}>
          {resume
            ? resume.category === save.lastPlayed?.category
              ? `이어서 하기 · ${CATEGORY_BY_ID[resume.category].name} ${TIER_NAMES[resume.tier]} ${resume.stage}`
              : `${CATEGORY_BY_ID[resume.category].name}부터 시작하기`
            : '모든 스테이지를 깼어요'}
        </ThickButton>
      </div>

      {/* 카테고리 그리드 */}
      <h2 style={{ fontSize: 17, margin: '0 2px 10px' }}>카테고리</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        {CATEGORIES.map((c) => {
          const done = clearedCount(save, c.id);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => navigate(`/category/${c.id}`)}
              style={{ ...cardStyle, padding: '14px 12px', textAlign: 'left' }}
            >
              <div aria-hidden style={{ fontSize: 30, lineHeight: 1, marginBottom: 8 }}>{c.emoji}</div>
              <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 8 }}>{c.name}</div>
              <ProgressBar value={done} max={9} />
              <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>클리어 {done}/9</div>
            </button>
          );
        })}
      </div>

      {/* 뱃지·오답노트·상점 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {[
          { to: '/badges', emoji: '🏅', label: `뱃지 ${save.badges.length}개` },
          { to: '/wrong-notes', emoji: '📕', label: `오답노트 ${save.wrongNotes.length}문제` },
          { to: '/shop', emoji: '🛍️', label: '상점' },
        ].map((item) => (
          <button
            key={item.to}
            type="button"
            onClick={() => navigate(item.to)}
            style={{ ...cardStyle, padding: '12px 4px', textAlign: 'center' }}
          >
            <div aria-hidden style={{ fontSize: 24 }}>{item.emoji}</div>
            <div style={{ fontSize: 12, fontWeight: 800, marginTop: 4 }}>{item.label}</div>
          </button>
        ))}
      </div>

      {state.storageWarning !== 'none' && (
        <p style={{ fontSize: 11, color: 'var(--no)', marginTop: 14 }}>
          {state.storageWarning === 'unavailable'
            ? '이 브라우저에서는 기록을 저장할 수 없어요. 창을 닫으면 진행이 사라집니다.'
            : '저장된 기록을 읽지 못해 새로 시작했어요.'}
        </p>
      )}
    </div>
  );
}
