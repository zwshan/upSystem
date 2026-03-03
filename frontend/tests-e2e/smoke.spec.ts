import { expect, test } from '@playwright/test'

test('dashboard opens and nav works', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('countdown-card')).toBeVisible()
  await page.getByRole('link', { name: '题目管理' }).click()
  await expect(page.getByTestId('question-table')).toBeVisible()
})
