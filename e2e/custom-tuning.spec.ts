import { expect, test } from '@playwright/test'

import { APP_URL, stubMicrophone } from './helpers'

const G_SHARP_1_HZ = 51.91

async function editStringToGSharp1(page: import('@playwright/test').Page) {
  // First tap targets the string, second tap opens the note picker.
  const stringButton = page.getByRole('button', { name: '1 E2' })
  await stringButton.click()
  await stringButton.click()
  await page.getByRole('button', { name: 'G#', exact: true }).click()
  await page.getByRole('button', { name: '1', exact: true }).click()
  await page.getByRole('button', { name: 'Done' }).click()
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

test('saved custom tunings persist across reloads and can be deleted', async ({
  page,
}) => {
  await stubMicrophone(page, G_SHARP_1_HZ)
  await page.goto(APP_URL)

  await editStringToGSharp1(page)

  await page.getByRole('button', { name: 'Custom' }).click()
  await page.getByPlaceholder('Tuning name').fill('Demiurge')
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Demiurge' })).toBeVisible()

  await page.reload()
  await page.getByRole('button', { name: 'Standard E' }).click()
  await expect(page.getByText('My tunings')).toBeVisible()
  await page.getByRole('button', { name: /Demiurge G#1/ }).click()
  await expect(page.getByRole('button', { name: '1 G#1' })).toBeVisible()

  await page.getByRole('button', { name: 'Demiurge' }).click()
  await page.getByRole('button', { name: 'Delete' }).click()
  await expect(page.getByText('My tunings')).not.toBeVisible()
})

test('selecting a preset applies its notes', async ({ page }) => {
  await page.goto(APP_URL)

  await page.getByRole('button', { name: 'Standard E' }).click()
  await page.getByRole('button', { name: /^Drop D D2/ }).click()

  await expect(page.getByRole('button', { name: '1 D2' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Drop D' })).toBeVisible()
})
