import { useState } from 'react';
import { useGame } from '../state/GameProvider';
import { decodeBackup, encodeBackup } from '../storage/save';
import { formatMoney } from './Money';

export function BackupCard() {
  const { state, dispatch } = useGame();
  const [code, setCode] = useState('');
  const [shown, setShown] = useState('');
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState<ReturnType<typeof decodeBackup>>(null);

  async function copy() {
    const text = encodeBackup(state.save);
    setShown(text);
    try {
      await navigator.clipboard.writeText(text);
      setMessage('백업 코드를 복사했어요. 메모장 등에 붙여 넣어 보관하세요.');
    } catch {
      setMessage('아래 코드를 길게 눌러 전체 복사해 보관하세요.');
    }
  }

  function check() {
    const save = decodeBackup(code);
    if (!save) {
      setPending(null);
      setMessage('올바른 백업 코드가 아니에요. GS1- 로 시작하는 코드 전체를 붙여 넣어 주세요.');
      return;
    }
    setPending(save);
    setMessage('');
  }

  function apply() {
    if (!pending) return;
    dispatch({ type: 'IMPORT_SAVE', save: pending });
    setPending(null);
    setCode('');
    setShown('');
    setMessage('기록을 불러왔어요!');
  }

  const box: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', borderRadius: 14, border: '2px solid var(--border)',
    background: '#fff', padding: 8, fontSize: 11, fontFamily: 'monospace', color: 'var(--text)', resize: 'none',
  };

  return (
    <div className="puffy" style={{ padding: 12, marginBottom: 18 }}>
      <h3 style={{ fontSize: 14, margin: '0 0 4px' }}>기록 백업</h3>
      <p className="muted" style={{ fontSize: 11, margin: '0 0 10px' }}>
        기록은 이 기기에만 저장돼요. 앱을 지우거나 기기를 바꾸기 전에 코드를 보관해 두세요.
      </p>

      <button type="button" className="thick" onClick={copy} style={{ marginBottom: 8 }}>
        백업 코드 복사
      </button>
      {shown && (
        <textarea aria-label="내 백업 코드" readOnly value={shown} rows={3} style={{ ...box, marginBottom: 8 }} onFocus={(e) => e.target.select()} />
      )}

      <textarea
        aria-label="백업 코드 입력"
        placeholder="GS1- 로 시작하는 백업 코드를 붙여 넣으세요"
        value={code}
        onChange={(e) => { setCode(e.target.value); setPending(null); }}
        rows={3}
        style={box}
      />
      {pending ? (
        <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
          <p style={{ fontSize: 12, color: 'var(--no)', margin: 0 }}>
            누적 {formatMoney(pending.totalPrize)} 기록으로 바꿔요. 지금 기록은 사라져요.
          </p>
          <button type="button" className="thick-accent" onClick={apply}>이 기록으로 바꾸기</button>
          <button type="button" className="thick" onClick={() => setPending(null)}>그만두기</button>
        </div>
      ) : (
        <button type="button" className="thick" disabled={!code.trim()} onClick={check} style={{ marginTop: 8 }}>
          코드로 불러오기
        </button>
      )}
      {message && <p role="status" style={{ fontSize: 11, margin: '8px 0 0' }}>{message}</p>}
    </div>
  );
}
