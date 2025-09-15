import { expect, type Locator, type Page } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly heroSection: Locator;
  readonly heroTitle: Locator;
  readonly heroDescription: Locator;
  readonly getStartedButton: Locator;
  readonly dashboardSection: Locator;
  readonly welcomeMessage: Locator;
  readonly todaysScore: Locator;
  readonly streakCounter: Locator;
  readonly completedTasks: Locator;
  readonly weeklyScore: Locator;
  readonly header: Locator;
  readonly sidebar: Locator;
  readonly userMenu: Locator;
  readonly signOutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Hero section (unauthenticated)
    this.heroSection = page.locator('[data-testid="hero-section"]').or(
      page.locator('text=Build Better Habits').locator('..')
    );
    this.heroTitle = page.getByRole('heading', { name: /build better habits/i });
    this.heroDescription = page.getByText(/track your daily habits/i);
    this.getStartedButton = page.getByRole('link', { name: /get started/i });
    
    // Dashboard section (authenticated)
    this.dashboardSection = page.locator('[data-testid="dashboard"]').or(
      page.getByText('Welcome Back!').locator('..')
    );
    this.welcomeMessage = page.getByText('Welcome Back!');
    this.todaysScore = page.getByText(/today.*score/i).locator('..').getByText(/\+?\d+/);
    this.streakCounter = page.getByText(/streak/i).locator('..').getByText(/\d+\s*days?/);
    this.completedTasks = page.getByText(/completed/i).locator('..').getByText(/\d+\/\d+/);
    this.weeklyScore = page.getByText(/this week/i).locator('..').getByText(/\+?\d+/);
    
    // Navigation elements
    this.header = page.locator('header');
    this.sidebar = page.locator('aside').or(page.locator('[data-testid="sidebar"]'));
    this.userMenu = page.locator('[data-testid="user-menu"]');
    this.signOutButton = page.getByRole('button', { name: /sign out/i });
  }

  async goto() {
    await this.page.goto('/');
  }

  async expectHeroSection() {
    await expect(this.heroTitle).toBeVisible();
    await expect(this.heroDescription).toBeVisible();
    await expect(this.getStartedButton).toBeVisible();
  }

  async expectDashboard() {
    await expect(this.welcomeMessage).toBeVisible();
    await expect(this.todaysScore).toBeVisible();
    await expect(this.streakCounter).toBeVisible();
    await expect(this.completedTasks).toBeVisible();
  }

  async expectAuthenticatedState() {
    await expect(this.signOutButton).toBeVisible();
    await expect(this.dashboardSection).toBeVisible();
    await expect(this.heroSection).not.toBeVisible();
  }

  async expectUnauthenticatedState() {
    await expect(this.heroSection).toBeVisible();
    await expect(this.getStartedButton).toBeVisible();
    await expect(this.dashboardSection).not.toBeVisible();
  }

  async clickGetStarted() {
    await this.getStartedButton.click();
    await expect(this.page).toHaveURL(/\/login/);
  }

  async signOut() {
    await this.signOutButton.click();
    // Wait for redirect to home with hero section
    await this.page.waitForURL('/');
    await this.expectUnauthenticatedState();
  }

  async navigateToProfile() {
    // Click on settings/profile icon in header
    const settingsIcon = this.page.getByRole('button').filter({ has: this.page.locator('svg') }).first();
    await settingsIcon.click();
    await expect(this.page).toHaveURL('/profile');
  }

  async navigateToTasks() {
    const tasksLink = this.page.getByRole('link', { name: /tasks/i });
    await tasksLink.click();
    await expect(this.page).toHaveURL(/\/tasks/);
  }

  async navigateToAnalytics() {
    const analyticsLink = this.page.getByRole('link', { name: /analytics/i });
    await analyticsLink.click();
    await expect(this.page).toHaveURL(/\/analytics/);
  }

  async navigateToHistory() {
    const historyLink = this.page.getByRole('link', { name: /history/i });
    await historyLink.click();
    await expect(this.page).toHaveURL(/\/history/);
  }

  // Utility methods for dashboard data
  async getTodaysScore(): Promise<string> {
    return await this.todaysScore.textContent() || '0';
  }

  async getStreakCount(): Promise<string> {
    return await this.streakCounter.textContent() || '0 days';
  }

  async getCompletedTasksCount(): Promise<string> {
    return await this.completedTasks.textContent() || '0/0';
  }

  async getWeeklyScore(): Promise<string> {
    return await this.weeklyScore.textContent() || '0';
  }
}