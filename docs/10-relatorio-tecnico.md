# MERAKI - Relatório Técnico

## 1. Introdução

Este relatório técnico apresenta a arquitetura e as decisões de design do sistema MERAKI, uma plataforma que conecta empresas com especialistas para execução de projetos técnicos. O sistema foi desenvolvido como projeto de conclusão de curso universitário.

---

## 2. Decisões Arquiteturais

### 2.1 Por que Microsserviços?

**Justificativa:**

Os microsserviços foram escolhidos para o backend do MERAKI devido às seguintes razões:

| Benefício | Descrição |
|-----------|-----------|
| **Escalabilidade independente** | Cada serviço pode ser escalado separadamente conforme a demanda. Por exemplo, o serviço de projetos pode ter mais instâncias que o de pagamentos. |
| **Manutenibilidade** | Equipes podem trabalhar em serviços diferentes simultaneamente, com menor risco de conflitos. |
| **Tecnologia específica** | Cada serviço pode utilizar a tecnologia mais adequada para sua função específica. |
| **Falhas isoladas** | Problemas em um serviço não afetam diretamente os outros, aumentando a resiliência do sistema. |
| **Deploy independente** | Atualizações podem ser deployadas sem paralisar todo o sistema. |

**Aplicação no MERAKI:**

```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   User      │ │  Project    │ │   Bidding   │ │  Delivery   │ │  Payment    │ │  Portfolio  │
│  Service    │ │  Service    │ │   Service   │ │   Service   │ │  Service    │ │  Service    │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

- **User Service** (Identity & Access): Gerencia usuários, autenticação e autorização
- **Project Service**: Gerencia projetos e milestones (owner do Milestone)
- **Bidding Service**: Gerencia propostas e seleção do vencedor (RN02, RN03)
- **Delivery Service**: Gerencia Kanban, validação de milestones e histórico (RF08, RN04, RN07)
- **Payment Service**: Gerencia pagamentos com retenção de taxa (RN05, RN06)
- **Portfolio Service**: Gerencia histórico profissional e perfis públicos (RF11, RF12, RF13, RF14)

---

### 2.2 Por que Flutter + MVVM para o Mobile App?

**Justificativa:**

O Flutter com arquitetura MVVM foi escolhido como framework mobile pelas seguintes razões:

| Aspecto | Benefício |
|---------|-----------|
| **Cross-platform nativo** | Um único codebase Dart gera apps iOS e Android com performance nativa |
| **Arquitetura MVVM** | Separação clara entre View (Widgets), ViewModel (lógica) e Model (dados/API) |
| **Riverpod** | Gerenciamento de estado reativo, type-safe e testável sem BuildContext |
| **Dio HTTP Client** | Client HTTP robusto com interceptors para JWT, retry e logging |
| **Hive** | Banco de dados NoSQL local em Dart puro — sem dependência nativa, rápido e simples |

**Estrutura de camadas MVVM no MERAKI:**

```
┌─────────────────────────────────────────────────────────────┐
│                      VIEW (Widgets)                         │
│  (StatelessWidget + Consumer/ConsumerWidget)                │
│                                                              │
│  • LoginScreen (ref.watch(authProvider))                    │
│  • ProjectsScreen (ref.watch(projectsProvider))             │
│  • KanbanScreen (RF08 - acompanhamento visual)              │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ ref.watch / ref.read
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  VIEWMODEL (StateNotifier)                   │
│  (Lógica de apresentação, estados: loading/data/error)      │
│                                                              │
│  • AuthViewModel (StateNotifier<AsyncValue<User>>)          │
│  • ProjectViewModel (StateNotifier<AsyncValue<List<Project>>>│
│  • BidViewModel (StateNotifier<AsyncValue<Bid>>)            │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Repository interface
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     REPOSITORY / DATA                       │
│  (Abstração de fontes: API remota + cache local Hive)      │
│                                                              │
│  • ProjectRepository → Dio (API) + Hive (cache)             │
│  • AuthRepository → Dio (login) + Hive Encrypted (token)   │
└─────────────────────────────────────────────────────────────┘
```

---

### 2.3 Por que Repository Pattern?

**Justificativa:**

O Repository Pattern foi implementado pelos seguintes motivos:

| Benefício | Descrição |
|-----------|-----------|
| **Abstração de dados** | O ViewModel não precisa saber se os dados vêm da API (Dio) ou do cache local (Hive) |
| **Facilidade de mudança** | Alterar a fonte de dados (API → Hive cache) não afeta as camadas superiores |
| **Código reutilizável** | Lógica de acesso a dados centralizada e reutilizável |
| **Testabilidade** | Repositórios podem ser mockados para testes unitários de ViewModel |
| **Separação de Concerns** | ViewModels focam na lógica de apresentação, Repositories na origem dos dados |

**Exemplo de Implementação (Dart):**

```dart
// Interface — define o contrato sem expor implementação
abstract class IProjectRepository {
  Future<List<Project>> getProjects();
}

// Implementação — alterna entre Dio (API) e Hive (cache) sem afetar o ViewModel
class ProjectRepository implements IProjectRepository {
  final DioClient _dio;
  final Box<ProjectModel> _hiveBox;

  ProjectRepository(this._dio, this._hiveBox);

  @override
  Future<List<Project>> getProjects() async {
    // Retorna cache se disponível
    if (_hiveBox.isNotEmpty) {
      return _hiveBox.values.map((m) => m.toDomain()).toList();
    }
    // Senão busca da API e salva no Hive
    final response = await _dio.get('/projects');
    final projects = (response.data as List)
        .map((j) => ProjectModel.fromJson(j))
        .toList();
    await _hiveBox.addAll(projects);
    return projects.map((m) => m.toDomain()).toList();
  }
}

// ViewModel — usa a interface, não sabe de onde vêm os dados
class ProjectViewModel extends StateNotifier<AsyncValue<List<Project>>> {
  final IProjectRepository _repo;
  ProjectViewModel(this._repo) : super(const AsyncValue.loading()) {
    loadProjects();
  }

  Future<void> loadProjects() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _repo.getProjects());
  }
}
```

---

### 2.4 Por que RabbitMQ?

**Justificativa:**

O RabbitMQ foi escolhido como message broker para comunicação entre microsserviços:

| Característica | Benefício |
|----------------|-----------|
| **Arquitetura Pub/Sub** | Serviços podem publicar e consumir eventos de forma desacoplada |
| **Confiabilidade** | Mensagens podem ser persistidas e ter delivery guarantee |
| **Flexibilidade** | Suporte a múltiplos patterns de messaging (topic, direct, fanout) |
| **Escalabilidade** | Consumidores podem ser escalados horizontalmente de forma independente |
| **Observabilidade** | Interface de gerenciamento para monitoração |

**Eventos Implementados no MERAKI:**

```
┌────────────────────┐    publicador    ┌──────────────────┐
│   Bidding Service │ ───────────────► │                  │
│  (bid.accepted)   │                  │                  │
└────────────────────┘                  │                  │
                                       │   RabbitMQ       │
┌────────────────────┐                  │                  │
│  Payment Service  │ ◄─────────────── │  Exchange:      │
│  (consumidor)     │    consumidor    │  meraki.events   │
└────────────────────┘                  │                  │
                                       └──────────────────┘

Eventos:
• user.registered     → Notifica outros serviços sobre novo usuário
• project.created    → Permite que especialistas vejam novos projetos
• bid.submitted      → Notifica empresa sobre nova proposta
• bid.accepted       → Atualiza projeto com especialista
• milestone.completed → Prepara pagamento
• payment.released   → Atualiza status do projeto
```

---

### 2.5 Por que Hive para Armazenamento Local?

**Justificativa:**

O Hive foi escolhido como solução de armazenamento local para o app Flutter:

| Benefício | Descrição |
|-----------|-----------|
| **Dart nativo** | Implementado 100% em Dart, sem dependências nativas (sem SQLite overhead) |
| **Alta performance** | Baseado em key-value store, com leitura/escrita mais rápida que SQLite |
| **Criptografia** | HiveAesCipher para armazenar tokens JWT de forma segura |
| **Offline first** | Dados disponíveis mesmo sem conexão, sincronizados quando a rede retornar |
| **Simples de usar** | API fluente, TypeAdapters gerados com build_runner |

**O que é armazenado e onde:**

| Dado | Box Hive | Razão |
|------|----------|-------|
| Token JWT | `authBox` (AES encrypted) | Segurança — criptografado no dispositivo |
| Dados do usuário | `userBox` | Exibir perfil sem nova requisição |
| Cache de projetos | `cacheBox` (com TTL) | Reduzir chamadas à API, suporte offline |
| Preferências | `prefsBox` | Tema, configurações de exibição |

---

## 3. Arquitetura Geral do Sistema

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MERAKI SYSTEM ARCHITECTURE                          │
└─────────────────────────────────────────────────────────────────────────────┘

                          ┌──────────────────┐
                          │ FLUTTER MOBILE   │
                          │  APP (MVVM)      │
                          └────────┬─────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
              ┌─────┴─────┐  ┌─────┴─────┐  ┌─────┴─────┐
              │   Cache   │  │   API    │  │   Auth    │
              │  (Hive)   │  │  (Dio)   │  │  (Hive    │
              │           │  │          │  │ Encrypted)│
              └───────────┘  └─────┬─────┘  └───────────┘
                                   │
                                   ▼
                          ┌──────────────────┐
                          │   API GATEWAY    │
                          │    (NestJS)      │
                          └────────┬─────────┘
                                   │
    ┌──────────┬───────────┬───────┴──┬──────────┬──────────┬──────────┐
    │          │           │          │          │          │          │
┌───┴────┐ ┌──┴─────┐ ┌───┴───┐ ┌───┴────┐ ┌───┴────┐ ┌───┴──────┐
│ User   │ │Project │ │Bidding│ │Delivery│ │Payment │ │Portfolio │
│Service │ │Service │ │Service│ │Service │ │Service │ │Service   │
└───┬────┘ └──┬─────┘ └───┬───┘ └───┬────┘ └───┬────┘ └───┬──────┘
    │         │           │         │          │          │
    └─────────┴───────────┴─────────┴──────────┴──────────┘
                                       │
                          ┌────────────┴────────────┐
                          │      RABBITMQ           │
                          │  (Message Broker)       │
                          └────────────┬────────────┘
                                       │
    ┌──────────┬───────────┬───────────┼───────────┬──────────┬──────────┐
    │          │           │           │           │          │          │
┌───┴────┐ ┌──┴────┐ ┌────┴────┐ ┌───┴─────┐ ┌───┴────┐ ┌───┴───────┐
│user_db │ │project│ │bidding_ │ │delivery_│ │payment │ │portfolio_ │
│        │ │_db    │ │db       │ │db       │ │_db     │ │db         │
└────────┘ └───────┘ └─────────┘ └─────────┘ └────────┘ └───────────┘
```

---

## 4. Tecnologias Utilizadas

### Backend

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Node.js | 18+ | Runtime |
| NestJS | 10 | Framework |
| TypeORM | 0.3 | ORM |
| PostgreSQL | 15 | Banco de dados |
| RabbitMQ | 3 | Message broker |
| JWT | - | Autenticação |
| Swagger | - | Documentação API |

### Mobile App

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Flutter | 3.x | Framework cross-platform (Android/iOS) |
| Dart | 3.x | Linguagem de programação |
| Riverpod | 2.x | Gerenciamento de estado reativo |
| Dio | 5.x | HTTP client com interceptors |
| Hive | 2.x | Banco de dados local key-value |
| Freezed | 2.x | Geração de modelos imutáveis |
| GoRouter | 12.x | Navegação declarativa |

### Infraestrutura

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Docker | 24.x | Containerização de serviços |
| Docker Compose | 2.x | Orquestração local |

---

## 5. Fluxo de Dados Completo

### 5.1 Fluxo de Licitação (RF03–RF07)

```
1. Empresa faz login
   └─> Flutter App: AuthService.login() → API Gateway → User Service (JWT emitido)

2. Empresa cria projeto com milestones (RN01, RN04)
   └─> Flutter App: projectService.create()
       └─> API Gateway → Project Service
       └─> Project Service valida escopo (RN01) e cria milestones sequenciais (RN04)
       └─> Publica: project.created → RabbitMQ → Bidding Service

3. Especialistas visualizam e enviam propostas (RN02)
   └─> Flutter App: bidService.submit()
       └─> API Gateway → Bidding Service
       └─> Bidding Service valida: max 1 proposta ativa por especialista (RN02)
       └─> Publica: bid.submitted

4. Empresa avalia e seleciona vencedor (RN03)
   └─> Flutter App: bidService.accept()
       └─> Bidding Service valida: projeto ainda sem vencedor (RN03)
       └─> Publica: bid.accepted
           └─> Project Service atualiza projeto
           └─> Delivery Service inicia Kanban (RF08)

5. Especialista executa milestone → Empresa valida (RF09)
   └─> Delivery Service publica: milestone.validated
       └─> Payment Service libera pagamento com taxa (RN05, RN06)
       └─> Portfolio Service registra histórico automático (RN07)
```

---

## 6. Considerações de Segurança

| Medida | Descrição |
|--------|-----------|
| **JWT Token** | Autenticação stateless com tokens de curta duração |
| **Senha hasheada** | BCrypt para hash de senhas |
| **HTTPS** | Comunicação criptografada |
| **Validação de input** | Class-validator no backend |
| **CORS** | Controle de origens permitidas |
| **Rate Limiting** | Prevenção de ataques de força bruta |

---

## 7. Testes e Qualidade

### Estratégia de Testes

| Nível | Ferramenta | Escopo |
|-------|------------|--------|
| Unitário | Jest (Backend), Flutter Test + Mockito (Mobile) | Use cases, ViewModels, Repositories |
| Integração | Supertest (API) | Endpoints REST |
| UI | Flutter Integration Tests | Fluxos end-to-end (login, criação de projeto, bid) |

---

## 8. Conclusão

O sistema MERAKI foi arquitetado utilizando tecnologias modernas e padrões reconhecidos pela indústria:

- **Microsserviços** para escalabilidade e manutenibilidade
- **Flutter + MVVM** para o app mobile cross-platform (Android/iOS) com Riverpod e Dio
- **Repository Pattern** para abstração de dados no mobile (Dio API / Hive cache) e no backend
- **RabbitMQ** (ou Kafka) para comunicação orientada a eventos entre serviços
- **Hive** para armazenamento local seguro e offline-first no app Flutter

Esta arquitetura atende aos requisitos de um projeto de conclusão de curso universitário, demonstrando proficiência em desenvolvimento de sistemas distribuídos e aplicações mobile modernas.

---

## 9. Referências

- [NestJS Documentation](https://docs.nestjs.com)
- [Flutter Documentation](https://docs.flutter.dev)
- [Riverpod Documentation](https://riverpod.dev)
- [Dio HTTP Client](https://pub.dev/packages/dio)
- [Hive Database](https://pub.dev/packages/hive)
- [RabbitMQ Tutorials](https://www.rabbitmq.com/tutorials)
- [Domain Driven Design](https://domainlanguage.com/ddd/)
- [OpenAPI / Swagger](https://swagger.io/docs/)

---

## 10. Estrutura Final dos Documentos

```
docs/
├── 01-arquitetura-sistema.md              ✅ Visão geral da arquitetura
├── 02-design-microsservicos.md            ✅ Design detalhado dos serviços (DDD)
├── 03-implementacao-backend-nestjs.md     ✅ Implementação NestJS (user-service)
├── 04-configuracao-rabbitmq.md            ✅ Configuração de mensageria (RabbitMQ/Kafka)
├── 05-api-gateway.md                      ✅ API Gateway
├── 06-arquitetura-flutter-mvvm.md         ✅ Arquitetura Flutter MVVM (Riverpod)
├── 07-implementacao-flutter.md            ✅ Implementação Flutter/Dart
├── 08-integracao-api.md                   ✅ Integração API com Dio
├── 09-armazenamento-local.md              ✅ Armazenamento local com Hive
└── 10-relatorio-tecnico.md                ✅ Este documento
```

