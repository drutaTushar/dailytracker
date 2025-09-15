import { expect, type Locator, type Page } from '@playwright/test';

export class ProfilePage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly fullNameInput: Locator;
  readonly displayNameInput: Locator;
  readonly avatarUrlInput: Locator;
  readonly themeSelect: Locator;
  readonly timezoneSelect: Locator;
  readonly reminderTimeInput: Locator;
  readonly notificationsCheckbox: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;
  readonly loadingSpinner: Locator;
  readonly accountInfo: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByRole('heading', { name: /profile settings/i });
    
    // Form inputs
    this.fullNameInput = page.getByRole('textbox', { name: /full name/i });
    this.displayNameInput = page.getByRole('textbox', { name: /display name/i });
    this.avatarUrlInput = page.getByRole('textbox', { name: /avatar url/i });
    this.themeSelect = page.getByRole('combobox', { name: /theme/i });
    this.timezoneSelect = page.getByRole('combobox', { name: /timezone/i });
    this.reminderTimeInput = page.getByLabel(/daily reminder time/i);
    this.notificationsCheckbox = page.getByRole('checkbox', { name: /enable notifications/i });
    
    // Action buttons
    this.saveButton = page.getByRole('button', { name: /save changes/i });
    this.cancelButton = page.getByRole('button', { name: /cancel/i });
    
    // Messages and states
    this.successMessage = page.locator('[data-testid="success-message"]').or(
      page.locator('.text-success')
    );
    this.errorMessage = page.locator('[data-testid="error-message"]').or(
      page.locator('.text-destructive')
    );
    this.loadingSpinner = page.getByText(/saving/i).or(
      page.locator('[data-testid="loading"]')
    );
    
    // Account information section
    this.accountInfo = page.locator('[data-testid="account-info"]').or(
      page.getByText('Account Information').locator('..')
    );
  }

  async goto() {
    await this.page.goto('/profile');
    await expect(this.pageTitle).toBeVisible();
  }

  async expectToBeOnProfilePage() {
    await expect(this.page).toHaveURL('/profile');
    await expect(this.pageTitle).toBeVisible();
  }

  async fillFullName(name: string) {
    await this.fullNameInput.fill(name);
  }

  async fillDisplayName(name: string) {
    await this.displayNameInput.fill(name);
  }

  async fillAvatarUrl(url: string) {
    await this.avatarUrlInput.fill(url);
  }

  async selectTheme(theme: 'light' | 'dark' | 'system') {
    await this.themeSelect.selectOption(theme);
  }

  async selectTimezone(timezone: string) {
    await this.timezoneSelect.selectOption(timezone);
  }

  async setReminderTime(time: string) {
    await this.reminderTimeInput.fill(time);
  }

  async toggleNotifications(enabled: boolean) {
    const isChecked = await this.notificationsCheckbox.isChecked();
    if (isChecked !== enabled) {
      await this.notificationsCheckbox.click();
    }
  }

  async saveChanges() {
    await this.saveButton.click();
  }

  async cancelChanges() {
    await this.cancelButton.click();
  }

  async expectSuccessMessage(message?: string) {
    await expect(this.successMessage).toBeVisible();
    if (message) {
      await expect(this.successMessage).toContainText(message);
    }
  }

  async expectErrorMessage(message?: string) {
    await expect(this.errorMessage).toBeVisible();
    if (message) {
      await expect(this.errorMessage).toContainText(message);
    }
  }

  async expectLoadingState() {
    await expect(this.loadingSpinner).toBeVisible();
  }

  async waitForSaveComplete() {
    // Wait for loading to disappear
    await expect(this.loadingSpinner).not.toBeVisible({ timeout: 5000 });
  }

  async updateProfile(profileData: {
    fullName?: string;
    displayName?: string;
    avatarUrl?: string;
    theme?: 'light' | 'dark' | 'system';
    timezone?: string;
    reminderTime?: string;
    notifications?: boolean;
  }) {
    if (profileData.fullName) {
      await this.fillFullName(profileData.fullName);
    }
    if (profileData.displayName) {
      await this.fillDisplayName(profileData.displayName);
    }
    if (profileData.avatarUrl) {
      await this.fillAvatarUrl(profileData.avatarUrl);
    }
    if (profileData.theme) {
      await this.selectTheme(profileData.theme);
    }
    if (profileData.timezone) {
      await this.selectTimezone(profileData.timezone);
    }
    if (profileData.reminderTime) {
      await this.setReminderTime(profileData.reminderTime);
    }
    if (profileData.notifications !== undefined) {
      await this.toggleNotifications(profileData.notifications);
    }

    await this.saveChanges();
    await this.waitForSaveComplete();
  }

  async getFormValues() {
    return {
      fullName: await this.fullNameInput.inputValue(),
      displayName: await this.displayNameInput.inputValue(),
      avatarUrl: await this.avatarUrlInput.inputValue(),
      theme: await this.themeSelect.inputValue(),
      timezone: await this.timezoneSelect.inputValue(),
      reminderTime: await this.reminderTimeInput.inputValue(),
      notifications: await this.notificationsCheckbox.isChecked(),
    };
  }

  async expectFormValues(expectedValues: {
    fullName?: string;
    displayName?: string;
    avatarUrl?: string;
    theme?: string;
    timezone?: string;
    reminderTime?: string;
    notifications?: boolean;
  }) {
    if (expectedValues.fullName) {
      await expect(this.fullNameInput).toHaveValue(expectedValues.fullName);
    }
    if (expectedValues.displayName !== undefined) {
      await expect(this.displayNameInput).toHaveValue(expectedValues.displayName);
    }
    if (expectedValues.avatarUrl !== undefined) {
      await expect(this.avatarUrlInput).toHaveValue(expectedValues.avatarUrl);
    }
    if (expectedValues.theme) {
      await expect(this.themeSelect).toHaveValue(expectedValues.theme);
    }
    if (expectedValues.timezone) {
      await expect(this.timezoneSelect).toHaveValue(expectedValues.timezone);
    }
    if (expectedValues.reminderTime) {
      await expect(this.reminderTimeInput).toHaveValue(expectedValues.reminderTime);
    }
    if (expectedValues.notifications !== undefined) {
      if (expectedValues.notifications) {
        await expect(this.notificationsCheckbox).toBeChecked();
      } else {
        await expect(this.notificationsCheckbox).not.toBeChecked();
      }
    }
  }
}