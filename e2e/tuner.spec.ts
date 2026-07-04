import { expect, test } from '@playwright/test'

import { APP_URL, setTestTone, stubMicrophone, stubMicrophoneDenied } from './helpers'

const A2_HZ = 110
const A2_FLAT_HZ = 106
const A2_SHARP_HZ = 114

test.describe('tuning with the microphone', () => {
  test('detects an in-tune string, then flat and sharp deviations', async ({ page }) => {
    await stubMicrophone(page, A2_HZ)
    await page.goto(APP_URL)

    await page.getByRole('button', { name: 'Start tuning' }).click()
    await expect(page.getByText('String 2 (A2): in tune')).toBeVisible()

    await setTestTone(page, A2_FLAT_HZ)
    await expect(page.getByText('String 2 (A2): too low — tighten')).toBeVisible()

    await setTestTone(page, A2_SHARP_HZ)
    await expect(page.getByText('String 2 (A2): too high — loosen')).toBeVisible()
  })

  test('targets only the manually selected string', async ({ page }) => {
    // 110 Hz is exactly A2 (string 2); with string 1 (E2) selected manually,
    // the same tone must be reported as sharp relative to E2, not in tune.
    await stubMicrophone(page, A2_HZ)
    await page.goto(APP_URL)

    await page.getByRole('button', { name: '1 E2' }).click()
    await page.getByRole('button', { name: 'Start tuning' }).click()
    await expect(page.getByText('String 1 (E2): too high — loosen')).toBeVisible()
  })

  test('shows an error when microphone access is denied', async ({ page }) => {
    await stubMicrophoneDenied(page)
    await page.goto(APP_URL)

    await page.getByRole('button', { name: 'Start tuning' }).click()
    await expect(page.getByText(/Microphone access denied/)).toBeVisible()
  })
})
