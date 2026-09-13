import { useNavigate } from 'react-router-dom';
import { useGame } from '../state/GameProvider';
import { getLevel } from '../domain/level';
import { nextStageAnywhere } from '../domain/unlock';
import {
  isDailyBonusEligible, mulberry32, pickDailyQuestions, todayString, unlockedQuestions,
} from '../domain/dailyGame';
import { ALL_QUESTIONS } from '../data/questions';
import { CATEGORIES, CATEGORY_BY_ID } from '../data/categories';
import { AVATARS } from '../data/shop';
import { TIER_NAMES } from '../types';
import { formatMoney } from '../components/Money';
import { ThickButton } from '../components/ThickButton';

export default function Home() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const save = state.save;
  const level = getLevel(save.totalPrize);
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
      <header style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{ fontSize: 30 }}>{avatar}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 900 }}>
            Lv.{level.level} {level.title}
          </div>
          <div className="muted" style={{ fontSize: 12 }}>
            누적 <span>{formatMoney(save.totalPrize)}</span> · 지갑 <span>{formatMoney(save.wallet)}</span>
          </div>
        </div>
      </header>

      <div style={{ marginBottom: 16 }}>
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

      <div style={{ display: 'grid', gap: 8, marginBottom: 18 }}>
        <ThickButton onClick={startResume}>
          {resume
            ? save.lastPlayed
              ? `이어서 하기 · ${CATEGORY_BY_ID[resume.category].name} ${TIER_NAMES[resume.tier]} ${resume.stage}`
              : `${CATEGORY_BY_ID[resume.category].name}부터 시작하기`
            : '모든 스테이지를 깼어요'}
        </ThickButton>
        <ThickButton onClick={() => navigate('/badges')}>
          뱃지 · {save.badges.length}개
        </ThickButton>
        <ThickButton onClick={() => navigate('/wrong-notes')}>
          오답노트 · {save.wrongNotes.length}문제
        </ThickButton>
        <ThickButton onClick={() => navigate('/shop')}>상점</ThickButton>
      </div>

      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 14 }}>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => navigate(`/category/${c.id}`)}
            style={{
              whiteSpace: 'nowrap',
              border: '2px solid var(--border)',
              background: 'var(--surface)',
              borderRadius: 99,
              padding: '7px 12px',
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {c.emoji} {c.name}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 14, fontSize: 12 }}>
        <button
          type="button"
          className="muted"
          style={{ background: 'none', border: 'none', padding: 0 }}
          onClick={() => navigate('/categories')}
        >
          카테고리 전체 보기
        </button>
        <button
          type="button"
          className="muted"
          style={{ background: 'none', border: 'none', padding: 0 }}
          onClick={() => navigate('/profile')}
        >
          프로필·설정
        </button>
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
