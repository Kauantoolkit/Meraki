import { test as base, expect, type TestInfo } from '@playwright/test'

export interface ServerError {
  url: string
  status: number
  body: string
}

/** Diagnóstico vivo de uma jornada: erros de servidor, erros de console e screenshots por etapa. */
export interface Rec {
  serverErrors: ServerError[]
  consoleErrors: string[]
  /** Tira um screenshot numerado da etapa e anexa ao relatório HTML. */
  shoot: (label: string) => Promise<void>
}

/**
 * `test` estendido com a fixture `rec`:
 *  - captura toda resposta 5xx (com corpo) e erros de console/página;
 *  - oferece `shoot(label)` para o screenshot-por-etapa;
 *  - ao final, anexa os diagnósticos e FALHA o teste se houve 5xx (é o que aponta a origem do bug).
 */
export const test = base.extend<{ rec: Rec }>({
  rec: async ({ page }, use, testInfo: TestInfo) => {
    const serverErrors: ServerError[] = []
    const consoleErrors: string[] = []
    let n = 0

    page.on('response', async (res) => {
      if (res.status() >= 500) {
        let body = ''
        try {
          body = (await res.text()).slice(0, 800)
        } catch {
          /* corpo já consumido — ignora */
        }
        serverErrors.push({ url: res.url(), status: res.status(), body })
      }
    })
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })
    page.on('pageerror', (err) => consoleErrors.push(String(err?.message ?? err)))

    const shoot = async (label: string) => {
      n += 1
      const slug = `${String(n).padStart(2, '0')}-${label
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')}`
      const file = testInfo.outputPath(`${slug}.png`)
      await page.screenshot({ path: file })
      await testInfo.attach(slug, { path: file, contentType: 'image/png' })
    }

    await use({ serverErrors, consoleErrors, shoot })

    if (serverErrors.length) {
      await testInfo.attach('server-errors.json', {
        body: JSON.stringify(serverErrors, null, 2),
        contentType: 'application/json',
      })
    }
    if (consoleErrors.length) {
      await testInfo.attach('console-errors.txt', {
        body: consoleErrors.join('\n'),
        contentType: 'text/plain',
      })
    }
    expect(
      serverErrors,
      `Backend retornou 5xx durante a jornada:\n${JSON.stringify(serverErrors, null, 2)}`,
    ).toEqual([])
  },
})

export { expect }
