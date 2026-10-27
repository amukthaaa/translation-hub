function tokenize(text) {
  return text.match(/\s+|[^\s]+/g) || [];
}

// Word-level diff via LCS, returning tokens of newText flagged as changed
// where they don't appear in the matching subsequence with oldText.
export function diffWords(oldText, newText) {
  const a = tokenize(oldText);
  const b = tokenize(newText);
  const m = a.length;
  const n = b.length;

  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const result = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (a[i] === b[j]) {
      result.push({ value: b[j], changed: false });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      i++;
    } else {
      result.push({ value: b[j], changed: true });
      j++;
    }
  }
  while (j < n) {
    result.push({ value: b[j], changed: true });
    j++;
  }

  return result.map((t) => ({ ...t, changed: t.changed && !/^\s+$/.test(t.value) }));
}
