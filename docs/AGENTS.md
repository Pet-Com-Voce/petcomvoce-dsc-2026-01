# AGENTS — Referência de Desenvolvimento

Guia completo de convenções, padrões, arquitetura e restrições para agentes desenvolvedores do **Pet Com Você**.

Antes de implementar qualquer feature, leia também os documentos especializados no diretório `docs/`:
- [`docs/domain.md`](./domain.md) — modelo de domínio completo, entidades e invariantes
- [`docs/architecture.md`](./architecture.md) — módulos, fronteiras e padrões de comunicação
- [`docs/api.md`](./api.md) — contratos e assinaturas das APIs REST
- [`docs/flows.md`](./flows.md) — fluxos do sistema (consulta, banho, hotel, etc.)
- [`docs/use-cases.md`](./use-cases.md) — detalhamento dos casos de uso de cada módulo

---

## Comandos Úteis

No terminal, você pode utilizar os seguintes comandos para o ciclo de desenvolvimento e testes:

```bash
# Executar o servidor de desenvolvimento
npm run start:dev

# Executar todos os testes da aplicação
npm test

# Executar um único arquivo de teste específico
npx jest src/modules/scheduling/application/use-cases/create-appointment.use-case.spec.ts

# Iniciar o banco de dados PostgreSQL local via Docker
docker compose up -d
```

---

## Convenções de Código

### Linguagem e Nomenclatura
- **Código em inglês**: variáveis, funções, classes, métodos, tabelas e nomes de arquivos devem ser escritos em inglês.
- **Mensagens e comentários em português**: mensagens de erro expostas ao usuário final, logs de erros negociais e comentários no código devem ser escritos em português.
- **Nomes de entidades**: PascalCase (`PetRecord`, `ScheduledAppointment`).
- **Nomes de eventos**: PascalCase com o sufixo `Event` (`MedicalRecordClosedEvent`).
- **Nomes de enums**: UPPER_SNAKE_CASE para os valores (`SCHEDULED`, `IN_PROGRESS`, `COMPLETED`).
- **Endpoints REST**: kebab-case no plural com substantivos (`/scheduled-appointments`, `/medical-records`).

### Valores Monetários
- **SEMPRE** armazenar valores monetários em centavos como um número inteiro (`integer` / `number` inteiro), evitando o uso de `decimal`, `float` ou `double` para evitar problemas de arredondamento.
- **Nomenclatura das colunas**: utilizar sufixos descritivos, como `valor_centavos`, `total_centavos`, `preco_centavos`.
- Converter e formatar para exibição decimal apenas na camada de apresentação (Frontend).

### Identificadores
- Todos os identificadores de entidades e chaves primárias/estrangeiras **devem ser UUID v4**.
- Coluna padrão: `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`.
- Referências externas: `pet_id UUID NOT NULL REFERENCES pets(id)`.

### Timestamps
- Usar obrigatoriamente `timestamptz` (timestamp com timezone) no PostgreSQL.
- Colunas obrigatórias em todas as tabelas: `created_at` e `updated_at`.
- Adicionar um trigger de auto-update para `updated_at` em todas as tabelas.

### Convenção de Testes
- **Framework**: Jest com `ts-jest`.
- **Nomenclatura de arquivos**: sufixo `*.spec.ts` dentro de `src/`.
- **Injeção de dependências nos testes**: os testes de casos de uso (`use-cases`) devem injetar mocks diretamente pelo construtor, sem utilizar o container de injeção de dependência (DI) do NestJS nos testes unitários.

---

## Módulos — Regras de Fronteira

O sistema é construído sobre uma arquitetura de **Monólito Modular** em NestJS. Cada módulo é um contexto delimitado (Bounded Context) e possui total autonomia sobre seus dados. 

**Regra Crítica:** Um módulo **NUNCA** deve importar repositórios ou entidades de domínio diretamente de outro módulo, nem ler/gravar nas tabelas de outros módulos via SQL/ORM. A comunicação e compartilhamento de dados ocorrem apenas via interfaces de serviço ou troca de IDs.

| Módulo NestJS | Pasta do Módulo | Entidades Principais e Responsabilidades |
|---|---|---|
| **IdentidadeAcesso** | `src/modules/identity-access/` | `Tutor`, `Pet`, `Funcionario`, autenticação JWT, controle de cargos/roles |
| **Clinico** | `src/modules/clinical/` | `Prontuario`, `RegistroVacinal`, histórico de vacinas e insumos clínicos utilizados |
| **AgendamentoServicos** | `src/modules/scheduling/` | `Agendamento`, fila de espera, serviços de banho, tosa e hotelzinho |
| **EstoquePDV** | `src/modules/inventory-pdv/` | `Produto`, `Venda`, controle de inventário de estoque e ponto de venda (PDV) |
| **FinanceiroNotificacoes** | `src/modules/financial-notifications/` | `Orcamento`, `Pagamento`, `Notificacao`, integração com WhatsApp |

### Estrutura Interna de Cada Módulo

Cada módulo é organizado estritamente segundo as quatro camadas abaixo:

```
src/modules/<module>/
├── domain/
│   ├── entities/          # Entidades de domínio (onde ficam as regras de negócio e invariantes)
│   ├── events/            # Eventos publicados pelo módulo
│   └── services/          # Serviços de domínio (Domain Services)
├── application/
│   ├── use-cases/         # Casos de uso da aplicação (um arquivo por caso de uso)
│   └── dtos/              # DTOs de entrada e saída
├── infrastructure/
│   ├── repositories/      # Implementações dos repositórios (TypeORM ou Prisma)
│   └── controllers/       # Controllers HTTP (ou no nível raiz do módulo)
└── <module>.module.ts
```

### Regra de Camadas (Layering Rule)
O fluxo de dependência é unidirecional:
$$\text{Controllers} \longrightarrow \text{Use Cases} \longrightarrow \text{Domain Services} \longrightarrow \text{Repositories}$$
A camada de domínio (`domain`) é o núcleo da aplicação e deve ser pura, possuindo zero conhecimento sobre protocolos HTTP, implementações de ORM ou detalhes de APIs externas.

### Comunicação Entre Módulos
- **Síncrona (Interfaces de Serviço):** Quando o resultado da operação de outro módulo é estritamente necessário para prosseguir ou bloquear a requisição atual (ex: `AgendamentoServicos` chama `IdentidadeAcesso` e `Clinico` para verificar se as vacinas obrigatórias estão válidas antes de confirmar uma reserva de `HOTEL`).
- **Assíncrona (Eventos via `EventEmitter2`):** Utilizada para efeitos colaterais do tipo "dispare e esqueça" (fire-and-forget), sem bloquear o fluxo do caso de uso principal.

#### Eventos Internos Cadastrados:

| Evento | Publicado por | Consumido por | Descrição / Payload mínimo |
|---|---|---|---|
| `medical-record.closed` | `Clinico` | `EstoquePDV` | Fecha prontuário e realiza baixa automática dos insumos: `{ appointmentId, suppliesUsed: [{ productId, quantity }] }` |
| `appointment.completed` | `AgendamentoServicos` | `FinanceiroNotificacoes` | Finaliza o atendimento e agenda lembretes de pós-serviço: `{ appointmentId, petId, tutorId }` |
| `inventory.minimum-reached` | `EstoquePDV` | `FinanceiroNotificacoes` | Alerta quando o estoque chega ao limite mínimo para compra: `{ productId, productName, currentQuantity, minimumQuantity }` |

---

## Status dos Agregados

As transições de estados das entidades devem ser validadas e respeitar estritamente os seguintes caminhos:

### Agendamento (`Appointment`)
```
SCHEDULED → CONFIRMED → IN_PROGRESS → COMPLETED
                    ↓
                CANCELLED
                    ↓
              NO_SHOW
```

### Orçamento (`Budget` / `Orcamento`)
```
PENDING → APPROVED → (pagamento processado)
       → REJECTED
       → EXPIRED
```

### Venda (`Sale` / `Venda`)
```
OPEN → COMPLETED
    → CANCELLED
```

### Pagamento (`Payment` / `Pagamento`)
```
PENDING → APPROVED
       → REJECTED
       → REFUNDED  (operação explícita obrigatória; sem alteração direta para APPROVED)
```

### Notificação (`Notification` / `Notificacao`)
```
SENT → DELIVERED → READ
    → FAILED
```

---

## Regras Críticas de Domínio (Invariantes)

Estas regras representam leis de negócio inabaláveis e devem possuir validações ativas na camada de domínio:

1. **Consentimento financeiro:** O início ou execução de qualquer serviço só é permitido com o orçamento aprovado (`APPROVED`).
2. **Vacinas para hotelzinho:** O agendamento do tipo `HOTEL` deve ser bloqueado caso as vacinas antirrábica ou múltipla (V10) do pet estejam vencidas ou não registradas.
3. **Estoque negativo proibido:** Qualquer venda no PDV ou baixa automática é bloqueada se a `quantidadeEmEstoque` for menor que a `quantidadeRequisitada`.
4. **Pagamento aprovado imutável:** Um pagamento com status `APPROVED` não pode ser alterado ou deletado diretamente; qualquer estorno exige obrigatoriamente a execução de uma operação explícita de `refund`.
5. **Restrição de alteração de prontuário:** Somente o veterinário vinculado ao agendamento correspondente pode editar o prontuário (`Prontuario`) após a sua criação inicial.
6. **Baixa automática de insumos:** Ao fechar um prontuário médico, deve ser disparado o evento `medical-record.closed` para que o módulo de estoque realize a dedução automática dos produtos utilizados.

---

## Autenticação e Autorização

- **JWT Bearer Token** obrigatório em todas as rotas protegidas.
- O middleware ou guard de autenticação deve interceptar e validar o token **antes** de rotear a requisição aos módulos de negócio.
- **Roles/Cargos disponíveis**: `ADMIN`, `VET`, `GROOMER`, `RECEPTIONIST`, `TUTOR`.
- Autorização estrita por perfil nas rotas sensíveis:
  - `POST /medical-records` — Acesso exclusivo para `VET`.
  - `POST /vaccines` — Acesso exclusivo para `VET`.
  - `DELETE /appointments` — Acesso exclusivo para `ADMIN`.
  - `GET /pets/:id/history` — Permissão para `VET`, `ADMIN`, `RECEPTIONIST` ou o `TUTOR` que seja proprietário do pet.

---

## Padrões de Resposta da API

Todas as respostas HTTP do sistema devem respeitar rigorosamente os seguintes formatos:

### Sucesso (200 / 201)
```json
{
  "data": { ... },
  "meta": { "timestamp": "2024-01-01T10:00:00Z" }
}
```

### Erro de Validação (400)
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Campos obrigatórios ausentes",
  "details": [{ "field": "petId", "message": "campo obrigatório" }]
}
```

### Erro de Negócio / Regra de Invariante (422)
```json
{
  "error": "BUSINESS_RULE_VIOLATION",
  "message": "Estoque insuficiente para o produto solicitado",
  "details": { "productId": "uuid", "available": 2, "requested": 5 }
}
```

### Recurso Não Encontrado (404)
```json
{
  "error": "NOT_FOUND",
  "message": "Agendamento não encontrado"
}
```

---

## Banco de Dados e Persistência

- **Banco de Dados**: PostgreSQL hospedado no Supabase.
- **Mapeador Relacional (ORM)**: Prisma (preferencial) ou TypeORM (em migração).
- **Tabelas**: snake_case no plural (`pets`, `appointments`, `medical_records`).
- **Colunas**: snake_case (`pet_id`, `created_at`, `is_clinical_supply`).
- **Campos Padrão**: Todas as tabelas devem conter `id`, `created_at` e `updated_at`.
- **Soft Delete**: Adicionar campo `deleted_at timestamptz NULL` nos agregados onde a exclusão lógica for aplicável.

---

## Notificações WhatsApp

- **Canal de Disparo**: WhatsApp Business API oficial.
- **Comportamento Assíncrono**: As mensagens são disparadas de forma assíncrona (segundo plano) e nunca devem travar ou atrasar a resposta do fluxo principal de negócios.
- **Jobs Diários (Cron)**:
  - **Lembretes Vacinais**: Disparar notificação 30 dias antes de `data_proxima_dose`.
  - **Notificação Preditiva de Ração**: Disparar 5 dias antes da data estimada do término do produto com base no histórico de consumo do pet.

---

## O Que NÃO Fazer

- ❌ Não acessar ou consultar tabelas de outros módulos diretamente via queries SQL/ORM.
- ❌ Nunca usar tipos primitivos de ponto flutuante (`float`, `double`) para armazenar ou manipular valores monetários.
- ❌ Não reutilizar e compartilhar entidades de domínio ativamente entre módulos diferentes (copie e transacione apenas os IDs correspondentes).
- ❌ Não prosseguir ou processar pagamentos de atendimentos antes que o orçamento correspondente esteja `APPROVED`.
- ❌ Nunca alterar diretamente um pagamento com status `APPROVED` para outros estados (a única forma é através do fluxo explícito de `refund`).
- ❌ Não registrar ou associar prontuários médicos para agendamentos que não estejam com o status `IN_PROGRESS`.
- ❌ Não travar ou sincronizar o fluxo principal do usuário aguardando o recebimento ou envio de notificações (WhatsApp ou email).
