import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('affiche les filtres et la grille média', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('Vos likes avec médias')).toBeVisible();
    await expect(page.getByPlaceholder('Recherche mots-clés, hashtags, @auteur')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Images' })).toBeVisible();
  });
});
