# Meraki — Mapa de Fluxos do Frontend

> Gerado com base no código-fonte React (`frontend/src/`) e validado contra a DRS v1.0.
> Cada página lista seus caminhos possíveis. Caminhos já visitados na árvore são marcados com `[CICLO]`.
> Status de teste: `[ ]` não testado · `[✓]` passou · `[✗]` falhou

---

## Cobertura DRS

### Requisitos Funcionais

| RF | Descrição | Coberto? | Páginas | Gaps |
|----|-----------|:--------:|---------|------|
| RF01 | Cadastro de empresas | Sim | `/signup` | — |
| RF02 | Cadastro de especialistas | Sim | `/signup` | — |
| RF03 | Criação de projetos | Sim | `/projects/new` | — |
| RF04 | Definição de milestones | Sim | `/projects/new` (step 4) | — |
| RF05 | Envio de propostas | Sim | `/bidding/:id` | — |
| RF06 | Avaliação de propostas | Sim | `/projects/:id/bids` | — |
| RF07 | Seleção do vencedor | Sim | `/projects/:id/bids` | — |
| RF08 | Acompanhamento via Kanban | Sim | `/kanban/:id` | — |
| RF09 | Validação de milestones | Sim | `/kanban/:id` | — |
| RF10 | Liberação de pagamento | Sim | `/financial`, `/kanban/:id` | — |
| RF11 | Histórico de entregas | **Parcial** | `/portfolio`, `/earnings` | Sem tela dedicada de histórico por projeto |
| RF12 | Perfil público especialistas | Sim | `/profile/specialist/:id` | — |
| RF13 | Perfil público empresas | Sim | `/profile/company/:id` | — |
| RF14 | Histórico profissional | **Parcial** | `/portfolio`, `/profile/specialist/:id` | Depende do portfolio-service (T12b) |

### Regras de Negócio

| RN | Descrição | Coberto? | Onde | Gaps |
|----|-----------|:--------:|------|------|
| RN01 | Qualidade do escopo | Parcial | `/projects/new` (validação wizard) | Validação real é backend |
| RN02 | Uma proposta por especialista/projeto | Sim | `/bidding/:id` checa `myBids()` | — |
| RN03 | Um vencedor por projeto | Sim | `/projects/:id/bids` | — |
| RN04 | Milestones sequenciais | **A testar** | `/kanban/:id` | Verificar se botão é desabilitado fora de ordem |
| RN05 | Pagamento após validação | Sim | `/kanban/:id` + `/financial` | — |
| RN06 | Taxa percentual da plataforma | **Não visível** | — | Lógica só no backend; sem exibição no frontend |
| RN07 | Histórico automático | Backend | `/portfolio` exibe resultado | — |

---

## Estrutura de Páginas

```
Públicas: /, /login, /signup, /password-recovery, /privacy
Protegidas: /dashboard, /projects/new, /bidding/:id, /projects/:id/bids,
            /kanban/:id, /talents, /portfolio, /profile/specialist/:id,
            /profile/company/:id, /financial, /earnings, /inbox, /events,
            /settings, /support, /admin
```

---

## Fluxos

```json
{
  "pages": {

    "/": {
      "name": "Landing Page",
      "auth": "public",
      "drs": [],
      "flows": {
        "F01-click-login": {
          "action": "Click botão Login (nav ou CTA)",
          "destino": "/login",
          "status": "[ ]"
        },
        "F02-click-signup": {
          "action": "Click botão Registrar (nav, hero ou CTA)",
          "destino": "/signup",
          "status": "[ ]"
        },
        "F03-auto-redirect-auth": {
          "action": "Usuário já autenticado → redirect automático",
          "destino": "/dashboard",
          "condition": "user != null && !isLoading",
          "status": "[ ]"
        }
      }
    },

    "/login": {
      "name": "Login",
      "auth": "public",
      "drs": ["RNF01"],
      "flows": {
        "F04-login-empresa-sucesso": {
          "action": "Preencher form (tab Empresa) → submit com credenciais válidas",
          "destino": "/dashboard",
          "condition": "authApi.login() retorna 200",
          "drs": ["RF01"],
          "status": "[ ]"
        },
        "F05-login-especialista-sucesso": {
          "action": "Preencher form (tab Especialista) → submit com credenciais válidas",
          "destino": "/dashboard",
          "condition": "authApi.login() retorna 200",
          "drs": ["RF02"],
          "status": "[ ]"
        },
        "F06-login-falha": {
          "action": "Preencher form → submit com credenciais inválidas",
          "destino": "/login (permanece)",
          "condition": "authApi.login() retorna erro",
          "expected": "Exibe mensagem de erro",
          "status": "[ ]"
        },
        "F07-click-esqueceu-senha": {
          "action": "Click 'Esqueceu?'",
          "destino": "/password-recovery",
          "status": "[ ]"
        },
        "F08-click-solicitar-registro": {
          "action": "Click 'SOLICITAR REGISTRO'",
          "destino": "/signup",
          "status": "[ ]"
        }
      }
    },

    "/signup": {
      "name": "Cadastro",
      "auth": "public",
      "drs": ["RF01", "RF02"],
      "flows": {
        "F09-registro-empresa-sucesso": {
          "action": "Selecionar tipo Empresa → preencher form → submit",
          "destino": "/dashboard",
          "condition": "authApi.register() retorna 200",
          "drs": ["RF01"],
          "status": "[ ]"
        },
        "F10-registro-especialista-sucesso": {
          "action": "Selecionar tipo Especialista → preencher form → submit",
          "destino": "/dashboard",
          "condition": "authApi.register() retorna 200",
          "drs": ["RF02"],
          "status": "[ ]"
        },
        "F11-registro-falha": {
          "action": "Submit com dados inválidos ou email duplicado",
          "destino": "/signup (permanece)",
          "expected": "Exibe mensagem de erro",
          "status": "[ ]"
        },
        "F12-click-retornar-login": {
          "action": "Click 'RETORNAR AO LOGIN'",
          "destino": "/login",
          "status": "[ ]"
        }
      }
    },

    "/password-recovery": {
      "name": "Recuperação de Senha",
      "auth": "public",
      "scope": "FORA DO ESCOPO INICIAL",
      "drs": [],
      "flows": {
        "F13-submit-email": {
          "action": "Preencher email → submit",
          "destino": "/password-recovery (permanece, mostra confirmação)",
          "status": "[ ]"
        },
        "F14-retornar-login": {
          "action": "Click botão retornar",
          "destino": "/login",
          "status": "[ ]"
        }
      }
    },

    "/privacy": {
      "name": "Política de Privacidade",
      "auth": "public",
      "drs": [],
      "flows": {
        "F15-voltar": {
          "action": "Click botão voltar",
          "destino": "(página anterior)",
          "status": "[ ]"
        }
      }
    },

    "/dashboard": {
      "name": "Dashboard (Router)",
      "auth": "protected",
      "drs": [],
      "flows": {
        "F16-redirect-empresa": {
          "action": "Renderiza DashboardEmpresa",
          "condition": "user.userType === 'company'",
          "destino": "/dashboard (empresa view)",
          "status": "[ ]"
        },
        "F17-redirect-especialista": {
          "action": "Renderiza DashboardEspecialista",
          "condition": "user.userType !== 'company'",
          "destino": "/dashboard (especialista view)",
          "status": "[ ]"
        },
        "F18-sem-auth": {
          "action": "Sem autenticação → redirect",
          "destino": "/login",
          "status": "[ ]"
        }
      }
    },

    "/dashboard#empresa": {
      "name": "Dashboard Empresa",
      "auth": "protected",
      "role": "company",
      "drs": [],
      "flows": {
        "F19-deploy-projeto": {
          "action": "Click 'Deploy Projeto'",
          "destino": "/projects/new",
          "drs": ["RF03"],
          "status": "[ ]"
        },
        "F20-ver-propostas": {
          "action": "Click 'VER_PROPOSTAS' em um ProjectCard",
          "destino": "/projects/:id/bids",
          "drs": ["RF06"],
          "status": "[ ]"
        },
        "F21-open-kanban": {
          "action": "Click 'OPEN_KANBAN' em um ProjectCard",
          "destino": "/kanban/:id",
          "drs": ["RF08"],
          "status": "[ ]"
        },
        "F22-nav-talentos": {
          "action": "Navbar → TALENTOS",
          "destino": "/talents",
          "status": "[ ]"
        },
        "F23-nav-kanban": {
          "action": "Navbar → KANBAN",
          "destino": "/kanban",
          "status": "[ ]"
        },
        "F24-nav-inbox": {
          "action": "Navbar → INBOX",
          "destino": "/inbox",
          "status": "[ ]"
        },
        "F25-nav-financeiro": {
          "action": "Navbar → FINANCEIRO",
          "destino": "/financial",
          "drs": ["RF10"],
          "status": "[ ]"
        },
        "F26-nav-eventos": {
          "action": "Navbar → EVENTOS",
          "destino": "/events",
          "status": "[ ]"
        },
        "F27-nav-suporte": {
          "action": "Navbar → SUPORTE",
          "destino": "/support",
          "status": "[ ]"
        },
        "F28-nav-settings": {
          "action": "Navbar → SETTINGS",
          "destino": "/settings",
          "status": "[ ]"
        },
        "F29-nav-admin": {
          "action": "Navbar → ADMIN",
          "destino": "/admin",
          "status": "[ ]"
        },
        "F30-logout": {
          "action": "Dropdown → Sair",
          "destino": "/login",
          "status": "[ ]"
        }
      }
    },

    "/dashboard#especialista": {
      "name": "Dashboard Especialista",
      "auth": "protected",
      "role": "specialist",
      "drs": [],
      "flows": {
        "F31-procurar-projetos": {
          "action": "Click 'Procurar Projetos'",
          "destino": "/talents",
          "status": "[ ]"
        },
        "F32-apply-bid": {
          "action": "Click 'APPLY_BID' em OpenProjects card",
          "destino": "/bidding/:id",
          "drs": ["RF05"],
          "status": "[ ]"
        },
        "F33-abrir-kanban": {
          "action": "Click 'ABRIR_KANBAN' em MyProjects card",
          "destino": "/kanban/:id",
          "drs": ["RF08"],
          "status": "[ ]"
        },
        "F34-nav-portfolio": {
          "action": "Navbar → PORTFÓLIO",
          "destino": "/portfolio",
          "drs": ["RF14"],
          "status": "[ ]"
        },
        "F35-nav-kanban": {
          "action": "Navbar → KANBAN",
          "destino": "/kanban",
          "status": "[ ]"
        },
        "F36-nav-inbox": {
          "action": "Navbar → INBOX",
          "destino": "/inbox",
          "status": "[ ]"
        },
        "F37-nav-ganhos": {
          "action": "Navbar → GANHOS",
          "destino": "/earnings",
          "status": "[ ]"
        },
        "F38-nav-eventos": {
          "action": "Navbar → EVENTOS",
          "destino": "/events",
          "status": "[ ]"
        },
        "F39-nav-suporte": {
          "action": "Navbar → SUPORTE",
          "destino": "/support",
          "status": "[ ]"
        },
        "F40-nav-settings": {
          "action": "Navbar → SETTINGS",
          "destino": "/settings",
          "status": "[ ]"
        },
        "F41-logout": {
          "action": "Dropdown → Sair",
          "destino": "/login",
          "status": "[ ]"
        }
      }
    },

    "/projects/new": {
      "name": "Criar Projeto",
      "auth": "protected",
      "role": "company",
      "drs": ["RF03", "RF04", "RN01"],
      "flows": {
        "F42-step1-next": {
          "action": "Preencher título + descrição → Next",
          "destino": "/projects/new (step 2)",
          "status": "[ ]"
        },
        "F43-step2-prev": {
          "action": "Step 2 → Previous",
          "destino": "/projects/new (step 1)",
          "status": "[ ]"
        },
        "F44-step2-next": {
          "action": "Preencher stack/requisitos → Next",
          "destino": "/projects/new (step 3)",
          "status": "[ ]"
        },
        "F45-step3-prev": {
          "action": "Step 3 → Previous",
          "destino": "/projects/new (step 2)",
          "status": "[ ]"
        },
        "F46-step3-next": {
          "action": "Preencher budget + deadline → Next",
          "destino": "/projects/new (step 4)",
          "status": "[ ]"
        },
        "F47-step4-prev": {
          "action": "Step 4 → Previous",
          "destino": "/projects/new (step 3)",
          "status": "[ ]"
        },
        "F48-deploy-sucesso": {
          "action": "Step 4 → Deploy com dados válidos",
          "destino": "/projects/new (terminal overlay)",
          "condition": "projectsApi.create() retorna 201",
          "drs": ["RF03", "RF04", "RN01"],
          "status": "[ ]"
        },
        "F49-deploy-falha-validacao": {
          "action": "Step 4 → Deploy com título <10 chars ou budget <=0 ou deadline passada ou 0 requisitos",
          "destino": "/projects/new (permanece com erro)",
          "condition": "API rejeita por RN01",
          "drs": ["RN01"],
          "status": "[ ]"
        },
        "F50-retornar-workspace": {
          "action": "Terminal overlay → 'Retornar ao Workspace'",
          "destino": "/dashboard",
          "status": "[ ]"
        },
        "F51-navbar-back": {
          "action": "Navbar → botão voltar",
          "destino": "/dashboard",
          "status": "[ ]"
        }
      }
    },

    "/bidding/:projectId": {
      "name": "Submeter Proposta",
      "auth": "protected",
      "role": "specialist",
      "drs": ["RF05", "RN02"],
      "flows": {
        "F52-submit-bid-sucesso": {
          "action": "Preencher valor + duração + proposta → submit",
          "destino": "/bidding/:id (overlay sucesso)",
          "condition": "bidsApi.submit() retorna 201 && sem bid existente",
          "drs": ["RF05"],
          "status": "[ ]"
        },
        "F53-submit-bid-falha": {
          "action": "Submit com dados inválidos",
          "destino": "/bidding/:id (permanece com erro)",
          "status": "[ ]"
        },
        "F54-bid-ja-existe": {
          "action": "Página carrega com bid existente (RN02)",
          "destino": "/bidding/:id (overlay com bid existente, bloqueado)",
          "condition": "bidsApi.myBids() retorna bid para esse projeto",
          "drs": ["RN02"],
          "status": "[ ]"
        },
        "F55-template-proposta": {
          "action": "Click botão template → insere texto padrão",
          "destino": "/bidding/:id (permanece, textarea preenchida)",
          "status": "[ ]"
        },
        "F56-retornar-workspace": {
          "action": "Overlay → 'Retornar ao Workspace'",
          "destino": "/dashboard",
          "status": "[ ]"
        },
        "F57-navbar-back": {
          "action": "Navbar → voltar",
          "destino": "/dashboard",
          "status": "[ ]"
        }
      }
    },

    "/projects/:projectId/bids": {
      "name": "Avaliar Propostas",
      "auth": "protected",
      "role": "company",
      "drs": ["RF06", "RF07", "RN03"],
      "flows": {
        "F58-rejeitar-bid": {
          "action": "Click 'REJEITAR' → confirmar modal",
          "destino": "/projects/:id/bids (permanece, lista atualizada)",
          "condition": "bidsApi.reject() retorna 200",
          "drs": ["RF06"],
          "status": "[ ]"
        },
        "F59-aceitar-bid": {
          "action": "Click 'ACEITAR_BID' → confirmar modal",
          "destino": "/kanban/:projectId",
          "condition": "bidsApi.accept() retorna 200 → redirect após 1200ms",
          "drs": ["RF07", "RN03"],
          "status": "[ ]"
        },
        "F60-aceitar-bid-falha": {
          "action": "Click aceitar → API retorna erro",
          "destino": "/projects/:id/bids (permanece com erro)",
          "status": "[ ]"
        },
        "F61-especialista-ja-selecionado": {
          "action": "Página carrega com especialista já aceito",
          "destino": "/projects/:id/bids (banner + botão ABRIR_KANBAN)",
          "drs": ["RN03"],
          "status": "[ ]"
        },
        "F62-abrir-kanban-pos-selecao": {
          "action": "Banner → 'ABRIR_KANBAN'",
          "destino": "/kanban/:projectId",
          "status": "[ ]"
        },
        "F63-navbar-back": {
          "action": "Navbar → voltar",
          "destino": "/dashboard",
          "status": "[ ]"
        },
        "F64-sem-propostas": {
          "action": "Página carrega sem nenhuma proposta",
          "destino": "/projects/:id/bids (permanece, estado vazio)",
          "expected": "Exibe estado vazio",
          "status": "[ ]"
        }
      }
    },

    "/kanban/:projectId": {
      "name": "Kanban Board",
      "auth": "protected",
      "drs": ["RF08", "RF09", "RN04", "RN05"],
      "flows": {
        "F65-sem-projectId": {
          "action": "Acessa /kanban sem :projectId",
          "destino": "/dashboard",
          "condition": "redirect automático",
          "status": "[ ]"
        },
        "F66-especialista-iniciar-milestone": {
          "action": "Especialista → 'INICIAR TRABALHO' em milestone PENDING",
          "destino": "/kanban/:id (milestone move para IN_PROGRESS)",
          "condition": "milestone anterior APPROVED ou é a primeira",
          "drs": ["RF08", "RN04"],
          "status": "[ ]"
        },
        "F67-especialista-submeter-entrega": {
          "action": "Especialista → 'SUBMETER ENTREGA' → preencher modal (repo URL + release notes) → submit",
          "destino": "/kanban/:id (milestone move para SUBMITTED_REVIEW)",
          "drs": ["RF09"],
          "status": "[ ]"
        },
        "F68-empresa-aprovar-milestone": {
          "action": "Empresa → 'APROVAR & PAGAR' em milestone SUBMITTED_REVIEW → confirmar modal",
          "destino": "/kanban/:id (milestone move para APPROVED + trigger pagamento)",
          "drs": ["RF09", "RF10", "RN05"],
          "status": "[ ]"
        },
        "F69-iniciar-milestone-fora-ordem": {
          "action": "Especialista tenta iniciar milestone sem anterior aprovada (RN04)",
          "destino": "/kanban/:id (permanece, erro esperado)",
          "expected": "Botão desabilitado ou erro da API",
          "drs": ["RN04"],
          "gap": "VERIFICAR: frontend bloqueia ou depende só do backend?",
          "status": "[ ]"
        },
        "F70-submeter-sem-dados": {
          "action": "Abre modal de submit sem preencher campos → tenta enviar",
          "destino": "/kanban/:id (permanece, validação frontend)",
          "status": "[ ]"
        },
        "F71-navbar-back": {
          "action": "Navbar → voltar",
          "destino": "/dashboard",
          "status": "[ ]"
        }
      }
    },

    "/talents": {
      "name": "Explorar Talentos",
      "auth": "protected",
      "drs": ["RF12"],
      "flows": {
        "F72-search": {
          "action": "Digitar termo → SEARCH()",
          "destino": "/talents (lista filtrada)",
          "status": "[ ]"
        },
        "F73-filtrar-skills": {
          "action": "Selecionar skills + faixa de preço + nível → Aplicar Filtros",
          "destino": "/talents (lista filtrada)",
          "status": "[ ]"
        },
        "F74-ver-perfil": {
          "action": "Click 'VER_PERFIL' em specialist card",
          "destino": "/profile/specialist/:id",
          "drs": ["RF12"],
          "status": "[ ]"
        },
        "F75-contratar": {
          "action": "Click 'CONTRATAR' (placeholder, não funcional)",
          "destino": "/talents (permanece)",
          "expected": "Sem ação — botão placeholder",
          "status": "[ ]"
        },
        "F76-lista-vazia": {
          "action": "Search/filtro sem resultados",
          "destino": "/talents (estado vazio)",
          "status": "[ ]"
        }
      }
    },

    "/portfolio": {
      "name": "Meu Portfólio",
      "auth": "protected",
      "role": "specialist",
      "drs": ["RF11", "RF14"],
      "flows": {
        "F77-tab-historico": {
          "action": "Click tab 'Histórico de Projetos'",
          "destino": "/portfolio (tab historico)",
          "drs": ["RF11", "RF14"],
          "status": "[ ]"
        },
        "F78-tab-repos": {
          "action": "Click tab 'Repositórios Públicos'",
          "destino": "/portfolio (tab repos)",
          "status": "[ ]"
        },
        "F79-editar-perfil": {
          "action": "Click 'Editar Perfil' (placeholder)",
          "destino": "/portfolio (permanece)",
          "expected": "Sem ação — botão placeholder",
          "status": "[ ]"
        }
      }
    },

    "/profile/specialist/:id": {
      "name": "Perfil Especialista (público)",
      "auth": "protected",
      "drs": ["RF12", "RF14"],
      "flows": {
        "F80-tab-historico": {
          "action": "Click tab 'Histórico de Projetos'",
          "destino": "/profile/specialist/:id (tab historico)",
          "drs": ["RF14"],
          "status": "[ ]"
        },
        "F81-tab-repos": {
          "action": "Click tab 'Repositórios Públicos'",
          "destino": "/profile/specialist/:id (tab repos)",
          "status": "[ ]"
        },
        "F82-iniciar-projeto": {
          "action": "Click 'Iniciar Projeto' (se empresa logada)",
          "destino": "/projects/new",
          "status": "[ ]"
        },
        "F83-navbar-back": {
          "action": "Navbar → voltar",
          "destino": "/talents",
          "status": "[ ]"
        }
      }
    },

    "/profile/company/:id": {
      "name": "Perfil Empresa (público)",
      "auth": "protected",
      "drs": ["RF13"],
      "flows": {
        "F84-navbar-back": {
          "action": "Navbar → voltar",
          "destino": "/talents",
          "status": "[ ]"
        }
      }
    },

    "/financial": {
      "name": "Financeiro (Empresa)",
      "auth": "protected",
      "role": "company",
      "drs": ["RF10", "RN05"],
      "gap": "RN06 (taxa plataforma) não é exibida no frontend",
      "flows": {
        "F85-aprovar-release": {
          "action": "Click 'APROVAR RELEASE' em milestone pendente",
          "destino": "/financial (permanece, lista atualizada)",
          "condition": "paymentsApi.releaseMilestone() retorna 200",
          "drs": ["RF10", "RN05"],
          "status": "[ ]"
        },
        "F86-aprovar-release-falha": {
          "action": "Click aprovar → API retorna erro",
          "destino": "/financial (permanece com erro)",
          "status": "[ ]"
        }
      }
    },

    "/earnings": {
      "name": "Ganhos (Especialista)",
      "auth": "protected",
      "role": "specialist",
      "drs": ["RF10"],
      "gap": "RN06 (taxa plataforma) não é exibida — especialista não vê o desconto",
      "flows": {
        "F87-solicitar-saque": {
          "action": "Click 'Solicitar Saque' (placeholder)",
          "destino": "/earnings (permanece)",
          "expected": "Sem ação — botão placeholder",
          "status": "[ ]"
        },
        "F88-lista-vazia": {
          "action": "Sem transações",
          "destino": "/earnings (estado vazio)",
          "status": "[ ]"
        }
      }
    },

    "/inbox": {
      "name": "Mensagens",
      "auth": "protected",
      "scope": "FORA DO ESCOPO INICIAL",
      "drs": [],
      "flows": {
        "F89-selecionar-contato": {
          "action": "Click em contato na sidebar",
          "destino": "/inbox (chat aberto)",
          "status": "[ ]"
        },
        "F90-enviar-mensagem": {
          "action": "Digitar mensagem → enviar",
          "destino": "/inbox (mensagem na lista)",
          "status": "[ ]"
        },
        "F91-buscar-contato": {
          "action": "Digitar no campo de busca",
          "destino": "/inbox (lista filtrada)",
          "status": "[ ]"
        }
      }
    },

    "/events": {
      "name": "Notificações/Eventos",
      "auth": "protected",
      "scope": "FORA DO ESCOPO INICIAL",
      "drs": [],
      "flows": {
        "F92-marcar-lida": {
          "action": "Click em notificação → marcar como lida",
          "destino": "/events (permanece, item atualizado)",
          "status": "[ ]"
        },
        "F93-purge-all": {
          "action": "Click 'Purge All'",
          "destino": "/events (permanece, lista limpa)",
          "status": "[ ]"
        }
      }
    },

    "/settings": {
      "name": "Configurações",
      "auth": "protected",
      "scope": "FORA DO ESCOPO INICIAL",
      "drs": [],
      "flows": {
        "F94-tab-conta": {
          "action": "Click tab 'Conta Básica'",
          "destino": "/settings (tab conta)",
          "status": "[ ]"
        },
        "F95-tab-seguranca": {
          "action": "Click tab 'Segurança'",
          "destino": "/settings (tab segurança)",
          "status": "[ ]"
        },
        "F96-tab-faturacao": {
          "action": "Click tab 'Faturação'",
          "destino": "/settings (tab faturação — vazia)",
          "status": "[ ]"
        },
        "F97-salvar-conta": {
          "action": "Editar campos → Salvar",
          "destino": "/settings (permanece, dados atualizados)",
          "status": "[ ]"
        },
        "F98-encerrar-sessao": {
          "action": "Click 'Encerrar Sessão'",
          "destino": "/login",
          "status": "[ ]"
        }
      }
    },

    "/support": {
      "name": "Suporte",
      "auth": "protected",
      "scope": "FORA DO ESCOPO INICIAL",
      "drs": [],
      "flows": {
        "F99-enviar-ticket": {
          "action": "Preencher assunto + descrição → ENVIAR_TICKET (placeholder)",
          "destino": "/support (permanece)",
          "expected": "Sem ação real — placeholder",
          "status": "[ ]"
        }
      }
    },

    "/admin": {
      "name": "Painel Admin",
      "auth": "protected",
      "role": "company",
      "scope": "FORA DO ESCOPO INICIAL",
      "drs": [],
      "flows": {
        "F100-visualizar-stats": {
          "action": "Página carrega com stats e logs mock",
          "destino": "/admin (permanece)",
          "status": "[ ]"
        }
      }
    }
  },

  "meta": {
    "total_flows": 100,
    "total_pages": 20,
    "scoped_pages": 14,
    "fora_escopo_pages": 6,
    "guards": {
      "ProtectedRoute": "Redireciona para /login se !user",
      "role_company": "Navbar mostra itens de empresa",
      "role_specialist": "Navbar mostra itens de especialista"
    },
    "ciclos_conhecidos": [
      "/login <-> /signup (F08 e F12)",
      "/login <-> /password-recovery (F07 e F14)",
      "/dashboard <-> /projects/new (F19 e F50/F51)",
      "/dashboard <-> /kanban/:id (F21/F33 e F71)",
      "/dashboard <-> /bidding/:id (F32 e F56/F57)",
      "/dashboard <-> /projects/:id/bids (F20 e F63)",
      "/talents <-> /profile/specialist/:id (F74 e F83)"
    ],
    "gaps_drs": [
      "RF11: Sem tela dedicada de histórico de entregas por projeto",
      "RF14: Depende do portfolio-service estar validado (T12b)",
      "RN04: Verificar se frontend bloqueia milestone fora de ordem ou só backend",
      "RN06: Taxa da plataforma não exibida em /financial nem /earnings"
    ]
  }
}
```

---

## Fluxos End-to-End (Jornadas Completas)

### Jornada Empresa

```
E2E-01: / → /login → /dashboard#empresa → /projects/new (4 steps) → /dashboard
         [RF01, RF03, RF04, RN01]

E2E-02: / → /signup (empresa) → /dashboard#empresa → /projects/new → /dashboard
         [RF01, RF03, RF04, RN01]

E2E-03: /dashboard#empresa → /projects/:id/bids → aceitar bid → /kanban/:id → aprovar milestones
         [RF06, RF07, RF08, RF09, RF10, RN03, RN04, RN05]

E2E-04: /dashboard#empresa → /talents → /profile/specialist/:id → /projects/new → /dashboard
         [RF12, RF03]

E2E-05: /dashboard#empresa → /financial → aprovar release
         [RF10, RN05]
```

### Jornada Especialista

```
E2E-06: / → /login → /dashboard#especialista → /bidding/:id → submit → /dashboard
         [RF02, RF05, RN02]

E2E-07: / → /signup (especialista) → /dashboard#especialista
         [RF02]

E2E-08: /dashboard#especialista → /kanban/:id → iniciar milestone → submeter entrega
         [RF08, RF09, RN04]

E2E-09: /dashboard#especialista → /portfolio
         [RF11, RF14]

E2E-10: /dashboard#especialista → /earnings
         [RF10]
```

### Fluxo Completo de Projeto (cross-role)

```
E2E-11: Empresa cria projeto (/projects/new)                    [RF03, RF04, RN01]
      → Especialista faz bid (/bidding/:id)                     [RF05, RN02]
      → Empresa aceita bid (/projects/:id/bids)                 [RF06, RF07, RN03]
      → Especialista trabalha milestones (/kanban/:id)           [RF08, RN04]
      → Empresa aprova milestones (/kanban/:id)                  [RF09, RN05]
      → Pagamento liberado (/financial)                          [RF10, RN05, RN06]
      → Especialista vê ganhos (/earnings)                       [RF10]
      → Histórico registrado (/portfolio)                        [RF11, RF14, RN07]
```
