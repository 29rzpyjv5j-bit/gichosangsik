import type { CategoryId, Question, StageNo } from '../../types';
import { TIERS } from '../../types';

const STAGES: StageNo[] = [1, 2, 3];
const WRITTEN_AT = /^\d{4}-\d{2}$/;

export function validateQuestions(questions: Question[], category: CategoryId): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();

  for (const q of questions) {
    const at = `[${q.id}]`;

    if (seen.has(q.id)) errors.push(`${at} id 중복`);
    seen.add(q.id);

    if (q.category !== category) errors.push(`${at} 카테고리 불일치: ${q.category}`);

    if (q.type === 'choice' && q.choices.length !== 4) {
      errors.push(`${at} 4지선다는 보기 4개여야 함 (현재 ${q.choices.length})`);
    }
    if (q.type === 'ox' && (q.choices.length !== 2 || q.choices[0] !== 'O' || q.choices[1] !== 'X')) {
      errors.push(`${at} OX 문제의 보기는 ['O','X'] 여야 함`);
    }

    if (q.answerIndex < 0 || q.answerIndex >= q.choices.length) {
      errors.push(`${at} 정답 번호가 범위를 벗어남: ${q.answerIndex}`);
    }

    if (new Set(q.choices).size !== q.choices.length) errors.push(`${at} 보기 중복`);

    if (q.prompt.trim() === '') errors.push(`${at} 문항이 비어 있음`);
    if (q.hint.trim() === '') errors.push(`${at} 힌트가 비어 있음`);
    if (q.explanation.trim() === '') errors.push(`${at} 해설이 비어 있음`);

    const answer = q.choices[q.answerIndex];
    if (q.type === 'choice' && answer && q.hint.includes(answer)) {
      errors.push(`${at} 힌트에 정답 누설: "${answer}"`);
    }
    // OX는 정답이 'O'/'X' 한 글자라 단순 포함 검사를 쓰면 'OECD', 'X선' 같은
    // 멀쩡한 힌트까지 걸린다. 대신 "정답을 말하는 어법"만 좁게 잡는다:
    // '정답'이나 '답' 뒤에 조사(은/는/이/가)·문장부호(:,：)·공백·여는 따옴표를
    // 임의 순서로 사이에 두고 정답 글자가 오는 경우만 누설로 본다.
    if (q.type === 'ox' && (answer === 'O' || answer === 'X')) {
      const oxLeakPattern = new RegExp(`(정답|답)[은는이가]?\\s*[:：]?\\s*['"“‘]?\\s*${answer}\\b`);
      if (oxLeakPattern.test(q.hint)) {
        errors.push(`${at} 힌트에 정답 누설: "${answer}"`);
      }
    }

    if (!WRITTEN_AT.test(q.writtenAt)) errors.push(`${at} writtenAt 형식 오류: ${q.writtenAt}`);
  }

  for (const tier of TIERS) {
    for (const stage of STAGES) {
      const n = questions.filter((q) => q.tier === tier && q.stage === stage).length;
      if (n !== 5) {
        errors.push(`${category}-${tier}-${stage} 문제 수가 5개가 아님 (현재 ${n})`);
      }
    }
  }

  return errors;
}
