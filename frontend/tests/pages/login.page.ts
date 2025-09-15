import { expect, type Locator, type Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly signUpButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly errorMessage: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByRole('textbox', { name: /email/i });
    this.passwordInput = page.getByRole('textbox', { name: /password/i });
    this.signInButton = page.getByRole('button', { name: /sign in/i });
    this.signUpButton = page.getByRole('button', { name: /sign up/i });
    this.forgotPasswordLink = page.getByRole('link', { name: /forgot.*password/i });
    this.errorMessage = page.locator('[data-testid="error-message"]').or(
      page.locator('.text-destructive').or(
        page.locator('[role="alert"]')
      )
    );
    this.successMessage = page.locator('[data-testid="success-message"]').or(
      page.locator('.text-success')
    );
  }

  async goto() {
    await this.page.goto('/login');
    await expect(this.page).toHaveTitle(/login|sign in/i);
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async clickSignIn() {
    await this.signInButton.click();
  }

  async clickSignUp() {
    await this.signUpButton.click();
  }

  async login(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickSignIn();
  }

  async expectToBeOnLoginPage() {
    await expect(this.page).toHaveURL(/\/login/);
    await expect(this.signInButton).toBeVisible();
  }

  async expectErrorMessage(message?: string) {
    await expect(this.errorMessage).toBeVisible();
    if (message) {
      await expect(this.errorMessage).toContainText(message);
    }
  }

  async expectSuccessMessage(message?: string) {
    await expect(this.successMessage).toBeVisible();
    if (message) {
      await expect(this.successMessage).toContainText(message);
    }
  }

  async expectLoginSuccess() {
    // Wait for redirect to home/dashboard
    await this.page.waitForURL(/^(\/|\/dashboard)$/, { timeout: 10000 });
  }
}