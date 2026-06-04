import { type Page, type APIRequestContext } from '@playwright/test'
import { test, type Rec } from './recorder'

/** Estado compartilhado entre as etapas de uma jornada (ids, credenciais, tokens...). */
export interface FlowContext {
  page: Page
  request: APIRequestContext
  rec: Rec
  store: Record<string, any>
}

/** Nó = uma tela. `assert` prova que a tela está correta (o oráculo). */
export interface FlowNode {
  id: string
  assert: (ctx: FlowContext) => Promise<void>
}

/** Aresta = uma ação que leva de uma tela a outra. */
export interface FlowEdge {
  from: string
  to: string
  label: string
  action: (ctx: FlowContext) => Promise<void>
}

export interface FlowGraph {
  nodes: Record<string, FlowNode>
  edges: FlowEdge[]
}

/**
 * Percorre um caminho (sequência de ids de nó) no grafo:
 * valida o nó inicial, e a cada aresta executa a ação → valida o nó de destino → tira screenshot.
 * Protege contra ciclos (cada aresta só pode ser cruzada uma vez por caminho).
 */
export async function walk(ctx: FlowContext, graph: FlowGraph, path: string[]) {
  const seen = new Set<string>()
  const start = graph.nodes[path[0]]
  if (!start) throw new Error(`Nó inicial desconhecido: "${path[0]}"`)

  await test.step(`▶ ${path[0]}`, async () => {
    await start.assert(ctx)
    await ctx.rec.shoot(path[0])
  })

  let prev = path[0]
  for (let i = 1; i < path.length; i++) {
    const to = path[i]
    const key = `${prev} -> ${to}`
    if (seen.has(key)) throw new Error(`Ciclo detectado na aresta ${key}`)
    seen.add(key)

    const edge = graph.edges.find((e) => e.from === prev && e.to === to)
    if (!edge) throw new Error(`Sem aresta definida para ${key}`)
    const node = graph.nodes[to]
    if (!node) throw new Error(`Nó desconhecido: "${to}"`)

    await test.step(`→ ${edge.label}`, async () => {
      await edge.action(ctx)
      await node.assert(ctx)
      await ctx.rec.shoot(edge.label)
    })
    prev = to
  }
}
