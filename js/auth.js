/*!
 * Simple client-side gate (for portfolio sharing)
 * - One login per device/browser
 * - Re-login after EXP_DAYS (default 3 days)
 * - Unlimited retries (no lockout)
 *
 * NOTE:
 * This is NOT strong security (password is in this file).
 * It is a lightweight “casual gate” to prevent accidental viewing.
 */

const AUTH_KEY = "yc_portfolio_auth_ok_v1";
const AUTH_TS_KEY = "yc_portfolio_auth_ts_v1";
const EXP_DAYS = 3; // ← change days here

// Temporary password (change if you want)
const PASSWORD = "yc-portfolio-2026";

function now() {
  return Date.now();
}

function isAuthed() {
  try {
    const ok = localStorage.getItem(AUTH_KEY) === "1";
    const ts = Number(localStorage.getItem(AUTH_TS_KEY) || "0");
    if (!ok || !ts) return false;
    const ageMs = now() - ts;
    return ageMs >= 0 && ageMs < EXP_DAYS * 24 * 60 * 60 * 1000;
  } catch (e) {
    return false;
  }
}

function setAuthed() {
  try {
    localStorage.setItem(AUTH_KEY, "1");
    localStorage.setItem(AUTH_TS_KEY, String(now()));
  } catch (e) {}
}

function clearAuth() {
  try {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(AUTH_TS_KEY);
  } catch (e) {}
}

function normalizeInput(v) {
  // trim + normalize unicode (prevents weird full-width/half-width issues)
  return String(v || "").normalize("NFKC").trim();
}

function unlockHTML() {
  document.documentElement.classList.add("auth-ok");
}

function lockHTML() {
  document.documentElement.classList.remove("auth-ok");
}

function createGate() {
  const overlay = document.createElement("div");
  overlay.id = "yc-auth-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.innerHTML = `
    <div class="yc-auth-card">
      <div class="yc-auth-title">Password</div>
      <div class="yc-auth-desc">ポートフォリオ閲覧用のパスワードを入力してください。</div>
      <form class="yc-auth-form" autocomplete="off">
        <input class="yc-auth-input" type="password" inputmode="text" autocomplete="off" placeholder="password" />
        <button class="yc-auth-btn" type="submit">Enter</button>
      </form>
      <div class="yc-auth-error" aria-live="polite"></div>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    #yc-auth-overlay{
      position: fixed; inset: 0; z-index: 99999;
      display: flex; align-items: center; justify-content: center;
      background: rgba(0,0,0,.45);
      backdrop-filter: blur(2px);
      -webkit-backdrop-filter: blur(2px);
      padding: 18px;
    }
    .yc-auth-card{
      width: min(420px, 92vw);
      background: #eaeeef;
      border-radius: 18px;
      padding: 18px 16px 14px;
      box-shadow: 0 18px 40px rgba(0,0,0,.22);
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans JP", sans-serif;
      color: #111;
    }
    .yc-auth-title{ font-size: 18px; font-weight: 800; letter-spacing: .04em; }
    .yc-auth-desc{ font-size: 13px; margin-top: 6px; line-height: 1.7; opacity: .85; }
    .yc-auth-form{ display:flex; gap:10px; margin-top: 12px; }
    .yc-auth-input{
      flex:1; height: 40px; border-radius: 12px;
      border: 1px solid rgba(0,0,0,.15);
      padding: 0 12px; font-size: 14px;
      background: #fff;
    }
    .yc-auth-btn{
      height: 40px; padding: 0 14px;
      border-radius: 12px; border: none; cursor: pointer;
      background: #34a358; color: #eaeeef; font-weight: 700;
    }
    .yc-auth-error{ margin-top: 10px; font-size: 12.5px; color: #b00020; min-height: 1.2em; }
  `;
  document.head.appendChild(style);

  const form = overlay.querySelector("form");
  const input = overlay.querySelector("input");
  const err = overlay.querySelector(".yc-auth-error");

  function showError(msg) {
    err.textContent = msg || "";
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const val = normalizeInput(input.value);
    if (!val) {
      showError("パスワードを入力してください。");
      input.focus();
      return;
    }
    if (val === PASSWORD) {
      setAuthed();
      overlay.remove();
      unlockHTML();
      document.body.style.overflow = "";
      showError("");
      return;
    }
    // Fail: DO NOT write anything to storage (prevents “correct but says wrong” bugs)
    showError("パスワードが違います。もう一度入力してください。");
    input.value = "";
    input.focus();
  });

  document.body.appendChild(overlay);
  document.body.style.overflow = "hidden";
  // focus
  setTimeout(() => input.focus(), 0);
}

(function initAuthGate() {
  // If user once failed & some old code stored broken flags, clear them safely
  // (this prevents “1回失敗したら正しくても通らない”状態)
  try {
    const ok = localStorage.getItem(AUTH_KEY);
    const ts = localStorage.getItem(AUTH_TS_KEY);
    if (ok === "0" || (ok && !ts)) {
      clearAuth();
    }
  } catch(e) {}

  if (isAuthed()) {
    unlockHTML();
    return;
  }
  lockHTML();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createGate);
  } else {
    createGate();
  }
})();
