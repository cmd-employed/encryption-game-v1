// Client-only "crack the password" game with white/pink theme.
// When the player cracks the password the script opens a new tab to the invite URL.
(() => {
  const form = document.getElementById('guessForm');
  const guessInput = document.getElementById('guess');
  const message = document.getElementById('message');
  const historyEl = document.getElementById('history');
  const resultArea = document.getElementById('resultArea');
  const inviteLink = document.getElementById('inviteLink');

  const body = document.body;
  const SECRET = (body.dataset.secret || '').toString().toUpperCase();
  const INVITE = (body.dataset.invite || '').toString();
  const expectedLength = Math.max(1, SECRET.length || 6);

  // Update input attrs to match secret length
  guessInput.maxLength = expectedLength;
  guessInput.placeholder = `Enter ${expectedLength}-char guess`;

  let attempts = 0;
  const maxAttempts = 500;

  function computeBullsCows(secret, guess) {
    const n = secret.length;
    let bulls = 0;
    let cows = 0;
    const secretArr = secret.split('');
    const guessArr = guess.split('');
    const secretUsed = new Array(n).fill(false);
    const guessUsed = new Array(n).fill(false);

    for (let i = 0; i < n; i++) {
      if (guessArr[i] === secretArr[i]) {
        bulls++;
        secretUsed[i] = true;
        guessUsed[i] = true;
      }
    }
    for (let i = 0; i < n; i++) {
      if (guessUsed[i]) continue;
      for (let j = 0; j < n; j++) {
        if (secretUsed[j]) continue;
        if (guessArr[i] === secretArr[j]) {
          cows++;
          secretUsed[j] = true;
          guessUsed[i] = true;
          break;
        }
      }
    }
    return { bulls, cows };
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const raw = guessInput.value.trim();
    if (!raw) return;
    if (attempts >= maxAttempts) {
      message.textContent = `Reached the maximum of ${maxAttempts} attempts. Refresh to try again.`;
      return;
    }
    if (raw.length !== expectedLength) {
      message.textContent = `Guess must be ${expectedLength} characters.`;
      return;
    }
    attempts++;
    const guess = raw.toUpperCase();
    const { bulls, cows } = computeBullsCows(SECRET, guess);

    const li = document.createElement('li');
    li.innerHTML = `<span>${guess}</span><span>Bulls: ${bulls} • Cows: ${cows}</span>`;
    historyEl.prepend(li);

    if (bulls === expectedLength) {
      // Show result area and set invite link
      resultArea.hidden = false;
      inviteLink.href = INVITE || '#';
      message.innerHTML = `<strong>🎉 Correct! You cracked the password in ${attempts} attempt(s).</strong>`;
      guessInput.disabled = true;

      // Open invite in a new tab — triggered by the user's submit action so should not be blocked
      if (INVITE) {
        const newWin = window.open(INVITE, '_blank');
        if (newWin) try { newWin.opener = null; } catch (err) { /* ignore */ }
      }
    } else {
      message.textContent = `Attempt ${attempts}: ${bulls} bulls, ${cows} cows.`;
    }
    guessInput.value = '';
    guessInput.focus();
  });

  // Helpful reminder in console
  console.info('Game secret (client-side):', SECRET, 'Invite:', INVITE);
})();