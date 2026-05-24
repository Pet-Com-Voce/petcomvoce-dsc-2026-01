# Pet Com Você

![Status: Em Desenvolvimento](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow)
![Node](https://img.shields.io/badge/Node.js-18%2B-green)
![NestJS](https://img.shields.io/badge/NestJS-10.x-red)
![License: MIT](https://img.shields.io/badge/License-MIT-blue)

Sistema integrado de gestão para pet shops e clínicas veterinárias. Centraliza agendamento, prontuário clínico, estoque, PDV, financeiro e notificações automáticas via WhatsApp em uma única plataforma.

---

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Backend | NestJS (Node.js + TypeScript) |
| Frontend Web | React.js |
| App Móvel | React Native |
| Banco de Dados | PostgreSQL via Supabase |
| Notificações | WhatsApp Business API |
| Comunicação assíncrona interna | EventEmitter2 (NestJS) |

**Arquitetura:** Monólito Modular — um único processo deployável com cinco módulos de contexto delimitado.

---

## Usuários do Sistema

| Ator | Papel |
|---|---|
| Administrador / Recepcionista | Entrada operacional: agenda, cadastros, PDV, financeiro |
| Veterinário | Registra prontuários, prescrições, vacinas e insumos |
| Tutor | Aprova orçamentos, acompanha saúde do pet via app |
| Sistema | Jobs agendados: notificações preditivas, alertas de estoque |

---

## Base de Conhecimento

| Arquivo | Conteúdo |
|---|---|
| [`docs/domain.md`](./docs/domain.md) | Entidades, atributos, relacionamentos, agregados e regras de negócio |
| [`docs/flows.md`](./docs/flows.md) | Fluxo principal (consulta veterinária) e fluxos secundários |
| [`docs/api.md`](./docs/api.md) | Contratos de API — entrada, processamento e saída de cada operação |
| [`docs/architecture.md`](./docs/architecture.md) | Módulos, fronteiras, padrões de comunicação, decisões técnicas e roadmap |
| [`docs/AGENTS.md`](./docs/AGENTS.md) | Referência rápida de convenções, padrões e restrições para agentes desenvolvedores |
| [`docs/reference/`](./docs/reference/) | PDFs originais do trabalho acadêmico (fonte primária) |

---

## Módulos Internos

| Módulo | Responsabilidade |
|---|---|
| `IdentidadeAcesso` | Autenticação, cadastro de tutores e funcionários, roles/permissões |
| `Clinico` | Prontuários, vacinas, insumos clínicos |
| `AgendamentoServicos` | Agenda, fila de espera, banho, tosa, hotelzinho |
| `EstoquePDV` | Catálogo de produtos, estoque, vendas no PDV, baixa automática |
| `FinanceiroNotificacoes` | Pagamentos, orçamentos, fluxo de caixa, WhatsApp preditivo |

---

## Contexto do Problema

Pet shops e clínicas veterinárias de pequeno e médio porte operam com sistemas isolados ou papel. Isso causa:
- Perda de histórico médico entre atendimentos
- Falhas de comunicação entre equipes (recepção ↔ veterinário ↔ grooming)
- Ausência de visão 360° da jornada do animal
- Recompra não rastreada (tutores esquecem de repor ração e vacinas)

**Solução:** centralizar toda a jornada do animal em um único sistema — do cadastro ao pagamento, do prontuário ao lembrete automatizado.

---

## Pré-requisitos

Antes de iniciar, você precisará ter instalado em sua máquina:
- [Node.js](https://nodejs.org/) (versão 18 ou superior recomendada)
- [Docker](https://www.docker.com/) e Docker Compose (para rodar o banco de dados local)
- [Git](https://git-scm.com/)

---

## Como executar o projeto localmente

Siga as instruções abaixo para clonar, instalar dependências e rodar o projeto.

### 1. Clonar o repositório
```bash
git clone https://github.com/seu-usuario/pet-com-voce.git
cd pet-com-voce
```

### 2. Configurar o ambiente
Crie o arquivo `.env` baseado no exemplo fornecido:
```bash
cp .env.example .env
```
Variáveis de ambiente principais:
- `DB_HOST`, `DB_PORT`: Configurações do banco de dados
- `DB_USERNAME`, `DB_PASSWORD`: Credenciais do banco

### 3. Instalar dependências
```bash
npm install
```

### 4. Executar o sistema
```bash
# Iniciar o servidor em modo de desenvolvimento
npm run start:dev
```

---

## Testes Automatizados

O projeto utiliza o framework Jest para testes unitários.

```bash
# Executar todos os testes
npm run test

# Executar testes gerando relatório de cobertura
npm run test:cov
```

---

## Endpoints Principais

Abaixo estão alguns dos principais endpoints implementados e seus códigos de status HTTP (200, 201 para sucesso, 400, 404 para erro). Para mais detalhes, consulte `docs/api.md` e os arquivos `.http` em `docs/http/`.

**Agendar Serviço** (`POST /api/appointments`)
```json
// Payload da requisição
{
  "petId": "uuid",
  "serviceId": "uuid",
  "date": "2023-11-20T14:30:00Z"
}

// Resposta 201 Created
{
  "id": "uuid",
  "status": "SCHEDULED"
}
```

---

## Contribuição

Siga o fluxo básico para contribuir:
1. Crie uma branch com um prefixo indicativo (`feature/nome-da-feature`, `fix/nome-do-bug`).
2. Faça commits claros referenciando a issue (ex: `feat(agendamento): cria endpoint de reserva`).
3. Abra um Pull Request para a branch `main`.

## Licença

Este projeto está sob a licença MIT. Para mais detalhes, consulte o arquivo LICENSE.
