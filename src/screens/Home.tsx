import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../state/GameProvider';
import { getLevel } from '../domain/level';
import { clearedCount, nextStageAnywhere } from '../domain/unlock';
import { growthStageOf, nextGrowthStage } from '../domain/growth';
import {
  isDailyBonusEligible, mulberry32, pickDailyQuestions, todayString, unlockedQuestions,
} from '../domain/dailyGame';
import { ALL_QUESTIONS } from '../data/questions';
import { CATEGORIES, CATEGORY_BY_ID } from '../data/categories';
import { LEVELS } from '../data/levels';
import { TIER_NAMES } from '../types';
import { formatMoney } from '../components/Money';
import { ProgressBar } from '../components/ProgressBar';
import { Penguin } from '../components/Penguin';

const card = {
  border: '2px solid var(--border)',
  borderBottomWidth: 4,
  borderRadius: 18,
  background: 'var(--surface)',
  color: 'var(--text)',
} as const;

const pill = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  background: 'var(--surface)',
  border: '2px solid var(--border)',
  borderRadius: 99,
  padding: '5px 12px 5px 6px',
  fontWeight: 900,
  fontSize: 14,
} as const;

function QuestRow({
  icon, iconBg, title, sub, done, disabled, onClick,
}: {
  icon: string;
  iconBg: string;
  title: ReactNode;
  sub: ReactNode;
  done?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        ...card,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        textAlign: 'left',
        opacity: disabled ? 0.55 : 1,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 46, height: 46, borderRadius: 14, flex: '0 0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, background: iconBg,
        }}
      >
        {icon}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 15, fontWeight: 900 }}>{title}</span>
        <span className="muted" style={{ display: 'block', fontSize: 11, marginTop: 2 }}>{sub}</span>
      </span>
      <span
        aria-hidden
        style={{
          width: 30, height: 30, borderRadius: '50%', flex: '0 0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 900,
          background: done ? 'var(--accent)' : 'var(--bg)',
          color: done ? '#fff' : 'var(--muted)',
          border: done ? 'none' : '2px solid var(--border)',
        }}
      >
        {done ? '✓' : '›'}
      </span>
    </button>
  );
}

export default function Home() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const save = state.save;
  const level = getLevel(save.totalPrize);
  const levelFloor = LEVELS[level.level - 1].threshold;
  const growth = growthStageOf(level.level);
  const nextGrowth = nextGrowthStage(level.level);
  const today = todayString();
  const pool = unlockedQuestions(save, ALL_QUESTIONS);
  const bonusLeft = isDailyBonusEligible(save, today);
  const resume = nextStageAnywhere(save, save.lastPlayed?.category ?? null);

  function startDaily() {
    const questions = pickDailyQuestions(save, ALL_QUESTIONS, mulberry32(Date.now() & 0xffff));
    if (questions.length === 0) return;
    dispatch({ type: 'START_DAILY', questions });
    navigate('/quiz');
  }

  return (
    <div className="screen">
      {/* 상단 재화 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <button type="button" onClick={() => navigate('/profile')} style={{ ...pill, cursor: 'pointer' }}>
          <span
            style={{
              background: 'var(--accent)', color: '#fff', borderRadius: 99,
              padding: '2px 8px', fontSize: 12,
            }}
          >
            Lv.{level.level}
          </span>
          {growth.name}
        </button>
        <span style={pill}>
          <span aria-hidden style={{ fontSize: 18 }}>🪙</span>
          <span>{formatMoney(save.wallet)}</span>
        </span>
      </div>

      {/* 캐릭터 무대 */}
      <div
        style={{
          position: 'relative',
          borderRadius: 26,
          overflow: 'hidden',
          background: 'linear-gradient(180deg, #cdeeff 0%, #eaf7ff 62%, #c8ecb4 62%, #b3e29a 100%)',
          padding: '18px 16px 14px',
          marginBottom: 12,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            position: 'relative',
            display: 'inline-block',
            background: '#fff',
            borderRadius: 16,
            padding: '8px 14px',
            fontSize: 13,
            fontWeight: 800,
            color: '#2b3a55',
            boxShadow: '0 3px 0 rgba(0,0,0,0.06)',
          }}
        >
          {pool.length === 0
            ? '문제가 곧 도착해요!'
            : bonusLeft
              ? '오늘의 퀴즈 풀러 가요!'
              : '오늘도 잘했어요. 한 판 더?'}
        </div>
        <div className="bob" style={{ margin: '6px auto 0', width: 150 }}>
          <Penguin stage={growth.index} size={150} />
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#2b5a2a' }}>{level.title}</div>
      </div>

      {/* 성장 게이지 */}
      <div style={{ ...card, padding: 14, marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <b style={{ fontSize: 14 }}>성장 게이지</b>
          <span className="muted" style={{ fontSize: 11 }}>
            누적 <span style={{ fontWeight: 900, color: 'var(--text)' }}>{formatMoney(save.totalPrize)}</span>
          </span>
        </div>
        <ProgressBar
          value={save.totalPrize - levelFloor}
          max={level.nextThreshold === null ? 1 : level.nextThreshold - levelFloor}
        />
        <div className="muted" style={{ fontSize: 11, marginTop: 6 }}>
          {level.remaining === null
            ? '최고 레벨이에요!'
            : `다음 레벨까지 ${formatMoney(level.remaining)}`}
          {nextGrowth && ` · 레벨 ${nextGrowth.fromLevel}이 되면 ${nextGrowth.name}(으)로 자라요`}
        </div>
      </div>

      {/* 오늘의 퀘스트 */}
      <h2 style={{ fontSize: 17, margin: '0 2px 10px' }}>오늘의 퀘스트</h2>
      <div style={{ display: 'grid', gap: 8, marginBottom: 20 }}>
        <QuestRow
          icon="🎯"
          iconBg="#fff1c7"
          title={pool.length === 0 ? '문제 준비 중' : bonusLeft ? '오늘의 볼게임 시작 ▶' : '한 판 더 ▶'}
          sub={bonusLeft ? '여러 카테고리 5문제 · 완료 보너스 30,000원' : '오늘 보너스는 받았어요 · 문제 상금은 그대로'}
          done={!bonusLeft}
          disabled={pool.length === 0}
          onClick={startDaily}
        />
        <QuestRow
          icon="🗺️"
          iconBg="#dff3d4"
          title={
            resume
              ? resume.category === save.lastPlayed?.category
                ? `이어서 하기 · ${CATEGORY_BY_ID[resume.category].name} ${TIER_NAMES[resume.tier]} ${resume.stage}`
                : `${CATEGORY_BY_ID[resume.category].name}부터 시작하기`
              : '모든 스테이지를 깼어요'
          }
          sub="다음 스테이지로 모험을 이어가요"
          disabled={!resume}
          onClick={() => resume && navigate(`/category/${resume.category}`)}
        />
        <QuestRow
          icon="📕"
          iconBg="#ffe3e0"
          title={`오답노트 복습 · ${save.wrongNotes.length}문제`}
          sub="틀린 문제를 다시 맞히면 5,000원"
          done={save.wrongNotes.length === 0}
          onClick={() => navigate('/wrong-notes')}
        />
      </div>

      {/* 카테고리 */}
      <h2 style={{ fontSize: 17, margin: '0 2px 10px' }}>탐험할 카테고리</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {CATEGORIES.map((c) => {
          const done = clearedCount(save, c.id);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => navigate(`/category/${c.id}`)}
              style={{ ...card, padding: '14px 12px', textAlign: 'left' }}
            >
              <div aria-hidden style={{ fontSize: 30, lineHeight: 1, marginBottom: 8 }}>{c.emoji}</div>
              <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 8 }}>{c.name}</div>
              <ProgressBar value={done} max={9} />
              <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>클리어 {done}/9</div>
            </button>
          );
        })}
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
