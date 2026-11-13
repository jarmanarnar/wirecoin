// Static markup; actions and behavior are owned by auth.js.
export const authTemplate = `
<dialog class="auth-dialog" id="auth-dialog" aria-label="Sign Up">
    <div class="auth-layout">
      <aside class="auth-promo" aria-hidden="true"></aside>

      <section class="auth-content">
        <div class="auth-heading">
          <div class="auth-tabs" role="tablist" aria-label="Account access">
            <button type="button" role="tab" id="auth-tab-signin" aria-controls="auth-panel" aria-selected="false" tabindex="-1" data-auth-tab="signin">Sign In</button>
            <button type="button" role="tab" id="auth-tab-signup" aria-controls="auth-panel" aria-selected="true" data-auth-tab="signup">Sign Up</button>
          </div>
          <button class="auth-close" type="button" aria-label="Close account dialog">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>
          </button>
        </div>

        <div class="auth-body" id="auth-panel" role="tabpanel" aria-labelledby="auth-tab-signup">
          <form class="auth-form" id="auth-form">
            <label class="auth-field">
              <span class="auth-sr-only" id="auth-identity-label">Email</span>
              <input id="auth-identity" type="email" placeholder="Email" autocomplete="username" required spellcheck="false" autocapitalize="none">
            </label>
            <label class="auth-field auth-field--password">
              <span class="auth-sr-only">Password</span>
              <input id="auth-password" type="password" placeholder="Password" aria-label="Password" autocomplete="new-password" required minlength="8">
              <button class="auth-eye" type="button" data-password-for="auth-password" aria-label="Show password" aria-pressed="false">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/><path class="eye-slash" d="M3 3 21 21"/></svg>
              </button>
            </label>
            <div class="auth-registration" id="auth-registration">
              <label class="auth-field auth-field--password">
                <span class="auth-sr-only">Password confirmation</span>
                <input id="auth-confirm" type="password" placeholder="Password confirmation" aria-label="Password confirmation" autocomplete="new-password" required minlength="8">
                <button class="auth-eye" type="button" data-password-for="auth-confirm" aria-label="Show password confirmation" aria-pressed="false">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/><path class="eye-slash" d="M3 3 21 21"/></svg>
                </button>
              </label>
              <label class="auth-check auth-terms">
                <input id="auth-terms" type="checkbox" required>
                <span>I confirm that I am at least 21 years old and agree to the <span class="auth-underlined">Terms &amp; Conditions</span> and <span class="auth-underlined">Privacy Policy</span>.</span>
              </label>
            </div>
            <div class="auth-login-options" id="auth-login-options" hidden>
              <label class="auth-check"><input id="auth-remember" type="checkbox"><span>Remember me</span></label>
              <button class="auth-link" id="auth-forgot" type="button">Forgot password?</button>
            </div>
            <p class="auth-field-hint" id="auth-field-hint" aria-live="polite"></p>
            <span data-button-slot="submit"></span>
          </form>

          <form class="auth-recovery" id="auth-recovery" hidden>
            <h2>Reset password</h2>
            <p>Enter your email to reset your password.</p>
            <label class="auth-field">
              <span class="auth-sr-only">Recovery email</span>
              <input id="auth-recovery-email" type="email" placeholder="Email" autocomplete="email" required spellcheck="false" autocapitalize="none">
            </label>
            <span data-button-slot="recovery"></span>
            <button class="auth-link auth-back" type="button" id="auth-back">Back to Sign In</button>
          </form>

          <div class="auth-social-area" id="auth-social-area">
            <div class="auth-divider"><span>or continue with</span></div>
            <div class="auth-socials">
              <span data-button-slot="Facebook"></span>
              <span data-button-slot="Google"></span>
            </div>
          </div>
          <p class="auth-feedback" id="auth-feedback" role="status"></p>
          <p class="auth-preview-note">WireCoin preview &middot; No account is created</p>
        </div>
      </section>
    </div>
  </dialog>
`;
