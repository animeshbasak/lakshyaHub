// Lightweight word-level diff for showing what AI rewrite changed.
// Not a full LCS — we just tokenize on whitespace and mark which words are new
// vs unchanged. Good enough for inline highlight of short resume bullets.

export type DiffToken = { text: string; kind: 'same' | 'added' | 'removed' };

function tokenize(s: string): string[] {
  return s.split(/(\s+)/).filter((t) => t.length > 0);
}

// Longest-common-subsequence on tokens.
function lcs(a: string[], b: string[]): number[][] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i += 1) {
    for (let j = 1; j <= n; j += 1) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp;
}

export function diffTokens(before: string, after: string): DiffToken[] {
  const a = tokenize(before);
  const b = tokenize(after);
  const dp = lcs(a, b);
  const out: DiffToken[] = [];

  let i = a.length;
  let j = b.length;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      out.push({ text: a[i - 1], kind: 'same' });
      i -= 1;
      j -= 1;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      out.push({ text: a[i - 1], kind: 'removed' });
      i -= 1;
    } else {
      out.push({ text: b[j - 1], kind: 'added' });
      j -= 1;
    }
  }
  while (i > 0) {
    out.push({ text: a[i - 1], kind: 'removed' });
    i -= 1;
  }
  while (j > 0) {
    out.push({ text: b[j - 1], kind: 'added' });
    j -= 1;
  }

  return out.reverse();
}

export function diffStats(before: string, after: string) {
  const beforeWords = before.trim().split(/\s+/).filter(Boolean).length;
  const afterWords = after.trim().split(/\s+/).filter(Boolean).length;
  const delta = afterWords - beforeWords;
  const pct = beforeWords === 0 ? 0 : Math.round((delta / beforeWords) * 100);
  return { beforeWords, afterWords, delta, pct };
}
