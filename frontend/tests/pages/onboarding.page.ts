import { expect, type Locator, type Page } from '@playwright/test';

export class OnboardingPage {
  readonly page: Page;
  readonly stepIndicator: Locator;
  readonly currentStep: Locator;
  readonly nextButton: Locator;
  readonly backButton: Locator;
  readonly skipButton: Locator;
  readonly finishButton: Locator;
  readonly progressBar: Locator;

  // Step 1: Welcome
  readonly welcomeTitle: Locator;
  readonly welcomeDescription: Locator;

  // Step 2: Profile
  readonly fullNameInput: Locator;
  readonly profileForm: Locator;

  // Step 3: Preferences
  readonly themeSelection: Locator;
  readonly timezoneSelection: Locator;
  readonly notificationsToggle: Locator;

  // Step 4: Complete
  readonly completionMessage: Locator;
  readonly goToDashboardButton: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Navigation elements
    this.stepIndicator = page.locator('[data-testid="step-indicator"]');
    this.currentStep = page.locator('[data-testid="current-step"]');
    this.nextButton = page.getByRole('button', { name: /next|continue/i });
    this.backButton = page.getByRole('button', { name: /back|previous/i });
    this.skipButton = page.getByRole('button', { name: /skip/i });
    this.finishButton = page.getByRole('button', { name: /finish|complete/i });
    this.progressBar = page.locator('[data-testid="progress-bar"]');

    // Step 1: Welcome
    this.welcomeTitle = page.getByRole('heading', { name: /welcome/i });
    this.welcomeDescription = page.getByText(/let.*get you set up/i);

    // Step 2: Profile
    this.fullNameInput = page.getByRole('textbox', { name: /full name/i });
    this.profileForm = page.locator('[data-testid="profile-form"]');

    // Step 3: Preferences
    this.themeSelection = page.locator('[data-testid="theme-selection"]');
    this.timezoneSelection = page.getByRole('combobox', { name: /timezone/i });
    this.notificationsToggle = page.getByRole('checkbox', { name: /notifications/i });

    // Step 4: Complete
    this.completionMessage = page.getByText(/you.*re all set/i);
    this.goToDashboardButton = page.getByRole('button', { name: /go to dashboard/i });
  }

  async goto() {
    await this.page.goto('/onboarding');
    await expect(this.welcomeTitle).toBeVisible();
  }

  async expectToBeOnOnboardingPage() {
    await expect(this.page).toHaveURL('/onboarding');
    await expect(this.stepIndicator).toBeVisible();
  }

  async expectStep(stepNumber: number) {
    await expect(this.currentStep).toContainText(stepNumber.toString());
  }

  async clickNext() {
    await this.nextButton.click();
  }

  async clickBack() {
    await this.backButton.click();
  }

  async clickSkip() {
    await this.skipButton.click();
  }

  async clickFinish() {
    await this.finishButton.click();
  }

  // Step 1: Welcome
  async completeWelcomeStep() {
    await expect(this.welcomeTitle).toBeVisible();
    await expect(this.welcomeDescription).toBeVisible();
    await this.clickNext();
  }

  // Step 2: Profile
  async completeProfileStep(fullName: string) {
    await expect(this.fullNameInput).toBeVisible();
    await this.fullNameInput.fill(fullName);
    await this.clickNext();
  }

  // Step 3: Preferences
  async completePreferencesStep(options?: {
    theme?: 'light' | 'dark' | 'system';
    timezone?: string;
    notifications?: boolean;
  }) {
    if (options?.theme) {
      await this.themeSelection.getByText(options.theme, { exact: false }).click();
    }
    if (options?.timezone) {
      await this.timezoneSelection.selectOption(options.timezone);
    }
    if (options?.notifications !== undefined) {
      const isChecked = await this.notificationsToggle.isChecked();
      if (isChecked !== options.notifications) {
        await this.notificationsToggle.click();
      }
    }
    await this.clickNext();
  }

  // Step 4: Complete
  async completeOnboarding() {
    await expect(this.completionMessage).toBeVisible();
    await this.goToDashboardButton.click();
    
    // Should redirect to dashboard
    await this.page.waitForURL(/^(\/|\/dashboard)$/);
  }

  // Complete entire onboarding flow
  async completeFullOnboarding(userData: {
    fullName: string;
    theme?: 'light' | 'dark' | 'system';
    timezone?: string;
    notifications?: boolean;
  }) {
    await this.completeWelcomeStep();
    await this.completeProfileStep(userData.fullName);
    await this.completePreferencesStep({
      theme: userData.theme,
      timezone: userData.timezone,
      notifications: userData.notifications,
    });
    await this.completeOnboarding();
  }

  async expectProgressBar(percentage: number) {
    const progressElement = this.progressBar.locator('[style*="width"]');
    await expect(progressElement).toHaveAttribute('style', new RegExp(`width:\\s*${percentage}%`));
  }

  async expectOnStep(stepNumber: number, title: string) {
    await this.expectStep(stepNumber);
    await expect(this.page.getByRole('heading', { name: new RegExp(title, 'i') })).toBeVisible();
  }
}