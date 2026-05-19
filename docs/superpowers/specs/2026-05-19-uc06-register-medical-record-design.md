# UC06 — Registrar Prontuário: Design Spec

**Date:** 2026-05-19
**Status:** Approved
**Use case:** UC06 from `docs/use-cases.md`
**Endpoint:** `POST /appointments/:id/medical-record`
**Module:** `Clinico` (`src/modules/clinical/`)

---

## Context

UC04 (Agendar Serviço) and UC05 (Realizar Check-in) are implemented. UC06 is the next step in the main consultation flow: the vet, after the pet is checked in (`EM_ANDAMENTO`), fills out the clinical record and closes it. Closing the record triggers an async event that decrements stock in the `EstoquePDV` module.

---

## Scope

- Flesh out `MedicalRecord` and `MedicalRecordSupply` TypeORM entities
- Implement `RegisterMedicalRecordUseCase` with all business rule validations
- Unit tests (constructor-injection pattern, same as UC04)
- HTTP controller wired into `ClinicalModule`
- Add `@nestjs/event-emitter` as the event infrastructure
- Stub `Product` entity + `MedicalRecordClosedHandler` in new `InventoryPdvModule`
- Update `docs/api.md` with new endpoint contract
- Update `docs/use-cases.md` marking UC06 as implemented

---

## Entities

### MedicalRecord (`medical_records`)

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | Auto-generated |
| `petId` | UUID | FK reference (no cross-module TypeORM relation) |
| `veterinarioId` | UUID | FK → Employee |
| `appointmentId` | UUID | FK → Appointment (unique) |
| `anamnese` | text nullable | Tutor's report and complaints |
| `exameClinico` | text nullable | Physical exam findings |
| `diagnostico` | text nullable | Vet's diagnosis |
| `prescricao` | text nullable | Prescription and instructions |
| `retornoRecomendado` | date nullable | Suggested return date |
| `createdAt` | timestamptz | Auto |
| `updatedAt` | timestamptz | Auto |

### MedicalRecordSupply (`medical_record_supplies`)

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | Auto-generated |
| `medicalRecordId` | UUID | FK → MedicalRecord |
| `productId` | UUID | UUID reference only — no cross-module ORM relation |
| `quantidade` | integer | Units used |
| `observacoes` | text nullable | Usage notes |
| `createdAt` | timestamptz | Auto |

### Product stub (`products`) — in `InventoryPdvModule`

Only the columns needed by the stock decrement handler:
| Column | Type |
|---|---|
| `id` | UUID PK |
| `quantidadeEmEstoque` | integer |
| `quantidadeMinima` | integer |

---

## Use Case: RegisterMedicalRecordUseCase

**File:** `src/modules/clinical/application/use-cases/register-medical-record.use-case.ts`

**Constructor injections:**
- `AppointmentRepository` (TypeORM `Repository<Appointment>`)
- `MedicalRecordRepository` (TypeORM `Repository<MedicalRecord>`)
- `MedicalRecordSupplyRepository` (TypeORM `Repository<MedicalRecordSupply>`)
- `EventEmitter2`

**Input DTO:** `CreateMedicalRecordDto`
```typescript
{
  veterinarioId: string        // UUID of the authenticated vet
  anamnese?: string
  exameClinico?: string
  diagnostico?: string
  prescricao?: string
  retornoRecomendado?: string  // ISO date YYYY-MM-DD
  supplies: Array<{
    productId: string
    quantidade: number
    observacoes?: string
  }>
}
```

**Execution flow:**
1. Load appointment by `appointmentId` (from URL param) → `NotFoundException` (404) if missing
2. Check `appointment.status === EM_ANDAMENTO` → `UnprocessableEntityException` (422) if not
3. Check `appointment.funcionarioId === dto.veterinarioId` → `ForbiddenException` (403) if mismatch (RN06)
4. Persist `MedicalRecord`
5. Persist each `MedicalRecordSupply` linked to the new record
6. Emit `medical-record.closed` with payload:
   ```typescript
   { appointmentId, suppliesUsed: [{ productId, quantity }] }
   ```
7. Return the created `MedicalRecord`

---

## Unit Tests

**File:** `src/modules/clinical/application/use-cases/register-medical-record.use-case.spec.ts`

Constructor-injection pattern (no DI container). All dependencies are `jest.fn()` mocks.

| Test | Expected outcome |
|---|---|
| Happy path — no supplies | Record saved, event emitted with `suppliesUsed: []` |
| Happy path — with supplies | Record saved, supplies saved, event emitted |
| Appointment not found | Throws `NotFoundException` |
| Appointment not `EM_ANDAMENTO` | Throws `UnprocessableEntityException` |
| Wrong vet | Throws `ForbiddenException` |

---

## EstoquePDV Event Handler

**File:** `src/modules/inventory-pdv/application/handlers/medical-record-closed.handler.ts`

```typescript
@OnEvent('medical-record.closed')
async handle(payload: MedicalRecordClosedPayload)
```

For each item in `suppliesUsed`:
- Load `Product` by `productId`
- Skip silently if product not found (clinical record must not fail due to stock issues per UC06 spec)
- Decrement `quantidadeEmEstoque` by `quantity` (floor at 0)
- If `quantidadeEmEstoque <= quantidadeMinima` → log warning (full `inventory.minimum-reached` event added in UC12)
- Save updated product

**Module:** `InventoryPdvModule` imports `TypeOrmModule.forFeature([Product])` and registers the handler as a provider.

---

## Infrastructure Changes

### Install event emitter
```
npm install @nestjs/event-emitter
```

### AppModule additions
- `EventEmitterModule.forRoot()` in imports
- `InventoryPdvModule` in imports
- `Product` entity in TypeORM entity list

### ClinicalModule additions
- `TypeOrmModule.forFeature([MedicalRecord, MedicalRecordSupply])` (already present, just confirm)
- `RegisterMedicalRecordUseCase` as provider
- `MedicalRecordController` as controller
- Re-export nothing (module is self-contained)

---

## HTTP Contract

### POST /appointments/:id/medical-record

**Roles:** `VET`

**Request body:**
```json
{
  "veterinarioId": "uuid",
  "anamnese": "string (optional)",
  "exameClinico": "string (optional)",
  "diagnostico": "string (optional)",
  "prescricao": "string (optional)",
  "retornoRecomendado": "YYYY-MM-DD (optional)",
  "supplies": [
    {
      "productId": "uuid",
      "quantidade": 2,
      "observacoes": "string (optional)"
    }
  ]
}
```

**201 Created:**
```json
{
  "data": {
    "id": "uuid",
    "petId": "uuid",
    "veterinarioId": "uuid",
    "appointmentId": "uuid",
    "anamnese": "...",
    "exameClinico": "...",
    "diagnostico": "...",
    "prescricao": "...",
    "retornoRecomendado": "YYYY-MM-DD",
    "supplies": [
      { "id": "uuid", "productId": "uuid", "quantidade": 2, "observacoes": "..." }
    ],
    "createdAt": "ISO timestamp",
    "updatedAt": "ISO timestamp"
  },
  "meta": { "timestamp": "ISO timestamp" }
}
```

**Error responses:**
- `403 Forbidden` — vet is not the one assigned to the appointment
- `404 Not Found` — appointment does not exist
- `422 Unprocessable Entity` — appointment is not `EM_ANDAMENTO`

---

## Files to Create / Modify

| Action | File |
|---|---|
| Modify | `src/modules/clinical/domain/entities/medical-record.entity.ts` |
| Modify | `src/modules/clinical/application/dtos/create.dto.ts` |
| Modify | `src/modules/clinical/application/dtos/response.dto.ts` |
| Create | `src/modules/clinical/application/use-cases/register-medical-record.use-case.ts` |
| Create | `src/modules/clinical/application/use-cases/register-medical-record.use-case.spec.ts` |
| Create | `src/modules/clinical/infrastructure/controllers/medical-record.controller.ts` |
| Modify | `src/modules/clinical/clinical.module.ts` |
| Create | `src/modules/inventory-pdv/domain/entities/product.entity.ts` |
| Create | `src/modules/inventory-pdv/application/handlers/medical-record-closed.handler.ts` |
| Create | `src/modules/inventory-pdv/inventory-pdv.module.ts` |
| Modify | `src/app.module.ts` |
| Modify | `docs/api.md` |
| Modify | `docs/use-cases.md` (mark UC06 as implemented) |

---

## Constraints & Edge Cases

- Cross-module references are UUID-only — `productId` in `MedicalRecordSupply` has no TypeORM foreign key constraint pointing to `products` table
- If the event handler fails (product not found), it must not propagate the error upstream — the clinical record is already committed
- UC06 does not block on stock shortages; it only records what was used (RN07 and the spec note "sistema alerta via stockAlerts, mas não bloqueia")
- The `veterinarioId` must come from the request body (simulating authenticated context) since JWT auth is not yet implemented in this codebase
