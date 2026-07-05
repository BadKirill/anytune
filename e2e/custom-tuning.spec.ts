import { expect, test } from '@playwright/test'

import { APP_URL, stubMicrophone } from './helpers'

const G_SHARP_1_HZ = 51.91

async function editStringToGSharp1(page: import('@playwright/test').Page) {
  const stringButton = page.getByRole('button', { name: '1 E2' })
  await stringButton.click()
  await stringButton.click()
  await page.getByRole('button', { name: 'G#', exact: true }).click()
  await page.getByRole('button', { name: '1', exact: true }).click()
  await page.getByRole('button', { name: 'Done' }).click()
}

async function saveCustomTuning(page: import('@playwright/test').Page, name: string) {
  await page.getByRole('button', { name: 'Custom' }).click()
  const input = page.getByRole('textbox', { name: 'Tuning name' })
  await input.fill(name)
  await input.press('Enter')
  await expect(page.getByRole('button', { name: name })).toBeVisible()
}

async function swipeDeleteCustom(page: import('@playwright/test').Page, name: string) {
  const row = page.locator('.swipe-row', { hasText: name })
  await row.locator('.swipe-row-content').evaluate((el) => {
    el.style.transform = 'translateX(-72px)'
  })
  await row.locator('.swipe-action-delete').evaluate((el) => {
    ;(el as HTMLButtonElement).click()
  })
}

test('editing a string note creates a custom tuning and tunes against it', async ({
  page,
}) => {
  await stubMicrophone(page, G_SHARP_1_HZ)
  await page.goto(APP_URL)

  await editStringToGSharp1(page)

  await expect(page.getByRole('button', { name: '1 G#1' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Custom' })).toBeVisible()

  await page.getByRole('button', { name: 'Start tuning' }).click()
  await expect(page.getByText('String 1 (G#1): in tune')).toBeVisible()
})

test('saved custom tunings persist, rename on swipe, and delete resets header', async ({
  page,
}) => {
  await stubMicrophone(page, G_SHARP_1_HZ)
  await page.goto(APP_URL)

  await editStringToGSharp1(page)
  await saveCustomTuning(page, 'Demiurge')

  await page.reload()
  await page.getByRole('button', { name: 'Standard E' }).click()
  const demiurgeRow = page.getByRole('button', { name: /Demiurge G#1/ })
  await demiurgeRow.scrollIntoViewIfNeeded()
  await demiurgeRow.evaluate((el) => {
    ;(el as HTMLButtonElement).click()
  })
  await expect(page.getByRole('button', { name: 'Demiurge' })).toBeVisible()

  await page.getByRole('button', { name: 'Demiurge' }).click()
  const row = page.locator('.swipe-row', { hasText: 'Demiurge' })
  await row.locator('.swipe-row-content').evaluate((el) => {
    el.style.transform = 'translateX(72px)'
  })
  await row.locator('.swipe-action-edit').evaluate((el) => {
    ;(el as HTMLButtonElement).click()
  })
  const renameInput = page.getByRole('textbox', { name: 'Tuning name' })
  await renameInput.fill('Demiurge renamed')
  await renameInput.press('Enter')
  await expect(page.getByRole('button', { name: /Demiurge renamed G#1/ })).toBeVisible()
  await page.getByRole('button', { name: /Demiurge renamed G#1/ }).evaluate((el) => {
    ;(el as HTMLButtonElement).click()
  })
  await expect(page.getByRole('button', { name: 'Demiurge renamed' })).toBeVisible()

  await page.getByRole('button', { name: 'Demiurge renamed' }).click()
  await swipeDeleteCustom(page, 'Demiurge renamed')
  await page.getByRole('button', { name: 'Close' }).click()
  await expect(page.getByRole('button', { name: 'Standard E' })).toBeVisible()
})

test('selecting a preset applies its notes', async ({ page }) => {
  await page.goto(APP_URL)

  await page.getByRole('button', { name: 'Standard E' }).click()
  await page.getByRole('button', { name: /^Drop D D2/ }).click()

  await expect(page.getByRole('button', { name: '1 D2' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Drop D' })).toBeVisible()
})
