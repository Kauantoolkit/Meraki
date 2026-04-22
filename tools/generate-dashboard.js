#!/usr/bin/env node
'use strict';

const https = require('https');
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.GITHUB_TOKEN;
const PROJECT_ID = 'PVT_kwHOBmmeQs4BRRd_';

if (!TOKEN) {
  console.error('GITHUB_TOKEN não definido.');
  process.exit(1);
}

function graphql(query) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query });
    const req = https.request({
      hostname: 'api.github.com',
      path: '/graphql',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'User-Agent': 'meraki-dashboard',
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function fetchItems() {
  const result = await graphql(`{
    node(id: "${PROJECT_ID}") {
      ... on ProjectV2 {
        items(first: 50) {
          nodes {
            fieldValues(first: 20) {
              nodes {
                ... on ProjectV2ItemFieldSingleSelectValue {
                  name
                  field { ... on ProjectV2SingleSelectField { name } }
                }
                ... on ProjectV2ItemFieldNumberValue {
                  number
                  field { ... on ProjectV2Field { name } }
                }
              }
            }
            content {
              ... on Issue {
                number
                title
                assignees(first: 5) { nodes { login } }
              }
              ... on DraftIssue {
                title
                assignees(first: 5) { nodes { login } }
              }
            }
          }
        }
      }
    }
  }`);

  return result.data.node.items.nodes.map(item => {
    const fields = {};
    item.fieldValues.nodes.forEach(fv => {
      if (!fv.field) return;
      const key = fv.field.name;
      if (fv.name !== undefined) fields[key] = fv.name;
      if (fv.number !== undefined) fields[key] = fv.number;
    });

    const content = item.content || {};
    return {
      title: content.title || '(sem título)',
      number: content.number || null,
      assignees: (content.assignees?.nodes || []).map(a => a.login),
      status: fields['Status'] || 'Backlog',
      estimate: fields['Estimate'] || 0,
      type: fields['Type'] || 'Planejada',
      size: fields['Size'] || '—',
      priority: fields['Priority'] || '—',
    };
  });
}

function computeStats(cards) {
  const COLUMNS = ['Backlog', 'Ready', 'In progress', 'In review', 'Done'];
  const TYPES = ['Planejada', 'Exploratória'];

  const byColumn = {};
  COLUMNS.forEach(col => {
    const c = cards.filter(x => x.status === col);
    byColumn[col] = { count: c.length, hours: c.reduce((s, x) => s + x.estimate, 0) };
  });

  const byType = {};
  TYPES.forEach(type => {
    const c = cards.filter(x => x.type === type);
    const done = c.filter(x => x.status === 'Done');
    byType[type] = {
      count: c.length,
      totalHours: c.reduce((s, x) => s + x.estimate, 0),
      doneCount: done.length,
      doneHours: done.reduce((s, x) => s + x.estimate, 0),
    };
  });

  const byMember = {};
  cards.forEach(card => {
    if (!card.assignees.length) return;
    const share = card.estimate / card.assignees.length;
    card.assignees.forEach(login => {
      if (!byMember[login]) byMember[login] = { total: 0, done: 0 };
      byMember[login].total += share;
      if (card.status === 'Done') byMember[login].done += share;
    });
  });

  return { byColumn, byType, byMember, COLUMNS, TYPES };
}

function pct(a, b) {
  return b === 0 ? 0 : Math.round((a / b) * 100);
}

function colColor(col) {
  const map = {
    'Backlog': '#64748b',
    'Ready': '#3b82f6',
    'In progress': '#f59e0b',
    'In review': '#8b5cf6',
    'Done': '#10b981',
  };
  return map[col] || '#888';
}

function typeColor(type) {
  return type === 'Exploratória' ? '#f97316' : '#3b82f6';
}

function statusBadge(status) {
  const colors = {
    'Backlog': '#64748b',
    'Ready': '#3b82f6',
    'In progress': '#f59e0b',
    'In review': '#8b5cf6',
    'Done': '#10b981',
  };
  const bg = colors[status] || '#888';
  return `<span style="background:${bg};color:#fff;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700">${status}</span>`;
}

function typeBadge(type) {
  const bg = typeColor(type);
  return `<span style="background:${bg};color:#fff;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700">${type}</span>`;
}

function generateHTML(cards, stats) {
  const { byColumn, byType, byMember, COLUMNS } = stats;
  const now = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

  const totalCards = cards.length;
  const doneCards = cards.filter(c => c.status === 'Done').length;
  const plannedHours = byType['Planejada']?.totalHours || 0;
  const exploratoryHours = byType['Exploratória']?.totalHours || 0;
  const plannedDoneHours = byType['Planejada']?.doneHours || 0;
  const overallPct = pct(doneCards, totalCards);

  // Column rows
  const columnRows = COLUMNS.map(col => {
    const { count, hours } = byColumn[col];
    const p = pct(count, totalCards);
    const color = colColor(col);
    return `
      <tr>
        <td style="font-weight:600;width:110px">${col}</td>
        <td style="width:60px;text-align:center">${count}</td>
        <td style="width:60px;text-align:center">${hours}h</td>
        <td>
          <div style="background:#e5e7eb;border-radius:4px;height:14px;overflow:hidden">
            <div style="background:${color};width:${p}%;height:100%;border-radius:4px;transition:width .3s"></div>
          </div>
        </td>
        <td style="width:40px;text-align:right;color:${color};font-weight:700">${p}%</td>
      </tr>`;
  }).join('');

  // Type blocks
  const typeBlocks = ['Planejada', 'Exploratória'].map(type => {
    const s = byType[type] || { count: 0, totalHours: 0, doneCount: 0, doneHours: 0 };
    const p = pct(s.doneCount, s.count);
    const hp = pct(s.doneHours, s.totalHours);
    const color = typeColor(type);
    return `
      <div style="flex:1;background:#fff;border-radius:8px;padding:16px;border:2px solid ${color}20">
        <div style="font-size:13px;font-weight:700;color:${color};margin-bottom:12px">${type.toUpperCase()}</div>
        <div style="display:flex;gap:16px;margin-bottom:12px">
          <div style="text-align:center;flex:1">
            <div style="font-size:24px;font-weight:700;color:#1a1a2e">${s.count}</div>
            <div style="font-size:10px;color:#888">cards</div>
          </div>
          <div style="text-align:center;flex:1">
            <div style="font-size:24px;font-weight:700;color:#1a1a2e">${s.totalHours}h</div>
            <div style="font-size:10px;color:#888">estimadas</div>
          </div>
          <div style="text-align:center;flex:1">
            <div style="font-size:24px;font-weight:700;color:${color}">${p}%</div>
            <div style="font-size:10px;color:#888">concluído</div>
          </div>
        </div>
        <div style="margin-bottom:6px">
          <div style="font-size:10px;color:#888;margin-bottom:3px">Cards concluídos (${s.doneCount}/${s.count})</div>
          <div style="background:#e5e7eb;border-radius:4px;height:10px">
            <div style="background:${color};width:${p}%;height:100%;border-radius:4px"></div>
          </div>
        </div>
        <div>
          <div style="font-size:10px;color:#888;margin-bottom:3px">Horas concluídas (${s.doneHours}h/${s.totalHours}h)</div>
          <div style="background:#e5e7eb;border-radius:4px;height:10px">
            <div style="background:${color}99;width:${hp}%;height:100%;border-radius:4px"></div>
          </div>
        </div>
      </div>`;
  }).join('');

  // Member rows
  const memberRows = Object.entries(byMember).length
    ? Object.entries(byMember).sort((a, b) => b[1].total - a[1].total).map(([login, m]) => {
        const p = pct(m.done, m.total);
        return `
          <tr>
            <td style="font-weight:600">@${login}</td>
            <td style="text-align:center">${Math.round(m.total)}h</td>
            <td style="text-align:center;color:#10b981;font-weight:700">${Math.round(m.done)}h</td>
            <td>
              <div style="background:#e5e7eb;border-radius:4px;height:10px">
                <div style="background:#10b981;width:${p}%;height:100%;border-radius:4px"></div>
              </div>
            </td>
            <td style="text-align:right;color:#10b981;font-weight:700">${p}%</td>
          </tr>`;
      }).join('')
    : '<tr><td colspan="5" style="text-align:center;color:#888;font-style:italic">Nenhum membro atribuído ainda</td></tr>';

  // Card table rows
  const cardRows = cards.map(c => `
    <tr>
      <td style="color:#888;font-size:11px">${c.number ? '#' + c.number : '—'}</td>
      <td style="font-weight:600;max-width:280px">${c.title}</td>
      <td>${typeBadge(c.type)}</td>
      <td>${statusBadge(c.status)}</td>
      <td style="text-align:center">${c.estimate ? c.estimate + 'h' : '—'}</td>
      <td style="font-size:11px;color:#555">${c.assignees.map(a => '@' + a).join(', ') || '—'}</td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Meraki — Dashboard</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; background: #f5f5f7; color: #1a1a2e; font-size: 13px; }
  .header { background: #1a1a2e; color: #fff; padding: 18px 28px; display: flex; justify-content: space-between; align-items: center; }
  .header h1 { font-size: 18px; font-weight: 700; }
  .header p { font-size: 11px; color: #aab; margin-top: 3px; }
  .updated { font-size: 11px; color: #aab; }
  .content { padding: 20px 28px; display: flex; flex-direction: column; gap: 20px; }
  .stats-row { display: flex; gap: 16px; }
  .stat-card { background: #fff; border-radius: 8px; padding: 16px 20px; flex: 1; border-left: 4px solid; }
  .stat-card .value { font-size: 28px; font-weight: 700; }
  .stat-card .label { font-size: 11px; color: #888; margin-top: 2px; }
  .section { background: #fff; border-radius: 8px; padding: 16px 20px; }
  .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: #888; margin-bottom: 14px; }
  table { width: 100%; border-collapse: collapse; }
  td, th { padding: 7px 10px; border-bottom: 1px solid #f0f0f0; vertical-align: middle; }
  th { font-size: 11px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: .4px; background: #f8f9fc; }
  tbody tr:hover td { background: #f8f9fc; }
  .types-row { display: flex; gap: 16px; }
  footer { text-align: center; padding: 14px; font-size: 11px; color: #888; border-top: 1px solid #e0e0e0; background: #fff; }
</style>
</head>
<body>
<div class="header">
  <div>
    <h1>MERAKI — Dashboard de Progresso</h1>
    <p>Plataforma de contratação baseada em projetos técnicos</p>
  </div>
  <div class="updated">Atualizado em: ${now}</div>
</div>

<div class="content">

  <div class="stats-row">
    <div class="stat-card" style="border-color:#3b82f6">
      <div class="value">${totalCards}</div>
      <div class="label">Total de cards</div>
    </div>
    <div class="stat-card" style="border-color:#10b981">
      <div class="value" style="color:#10b981">${overallPct}%</div>
      <div class="label">Concluído (${doneCards}/${totalCards} cards)</div>
    </div>
    <div class="stat-card" style="border-color:#3b82f6">
      <div class="value">${plannedHours}h</div>
      <div class="label">Horas planejadas · ${plannedDoneHours}h concluídas</div>
    </div>
    <div class="stat-card" style="border-color:#f97316">
      <div class="value">${exploratoryHours}h</div>
      <div class="label">Horas exploratórias</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Progresso por coluna</div>
    <table>
      <thead><tr><th>Coluna</th><th>Cards</th><th>Horas</th><th style="width:60%">Progresso</th><th>%</th></tr></thead>
      <tbody>${columnRows}</tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Planejada vs Exploratória</div>
    <div class="types-row">${typeBlocks}</div>
  </div>

  <div class="section">
    <div class="section-title">Por membro</div>
    <table>
      <thead><tr><th>Membro</th><th>Horas atribuídas</th><th>Horas concluídas</th><th style="width:50%">Progresso</th><th>%</th></tr></thead>
      <tbody>${memberRows}</tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Todos os cards</div>
    <table>
      <thead><tr><th>#</th><th>Título</th><th>Tipo</th><th>Status</th><th>Estimativa</th><th>Responsáveis</th></tr></thead>
      <tbody>${cardRows}</tbody>
    </table>
  </div>

</div>
<footer>Meraki v1.0 · Gerado automaticamente via GitHub Actions</footer>
</body>
</html>`;
}

async function main() {
  console.log('Buscando dados do projeto...');
  const cards = await fetchItems();
  console.log(`${cards.length} cards encontrados.`);

  const stats = computeStats(cards);
  const html = generateHTML(cards, stats);

  const outPath = path.join(__dirname, 'dashboard.html');
  fs.writeFileSync(outPath, html, 'utf8');
  console.log(`Dashboard gerado: ${outPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
