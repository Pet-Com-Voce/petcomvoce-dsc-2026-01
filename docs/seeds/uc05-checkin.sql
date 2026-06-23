-- =============================================================
-- Seeds para UC05 - Realizar Check-in do Atendimento
-- =============================================================

-- ---------------------------------------------------------------
-- 1. Tutor (tabela mínima, apenas id)
-- ---------------------------------------------------------------
INSERT INTO tutors (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------
-- 2. Pet vinculado ao Tutor
-- ---------------------------------------------------------------
INSERT INTO pets (id)
VALUES (2)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------
-- 3. Funcionário (veterinário responsável)
-- ---------------------------------------------------------------
INSERT INTO employees (id)
VALUES (3)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------
-- 4. Agendamento CONFIRMADO + orçamento APROVADO (caminho feliz)
-- ---------------------------------------------------------------
INSERT INTO appointments (id, "dataHora", duracao, tipo, status, "petId", "funcionarioId", observacoes, "createdAt", "updatedAt")
VALUES (
  1,
  NOW() + INTERVAL '1 hour',
  30,
  'CONSULTA',
  'CONFIRMADO',
  2,
  3,
  'Consulta de rotina',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO budgets (id, "appointmentId", valor, status, "createdAt", "updatedAt")
VALUES (
  1,
  1,
  15000, -- valor em centavos
  'APROVADO',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------
-- 5. Agendamento CONFIRMADO + orçamento PENDENTE  → erro 422 (RN02)
-- ---------------------------------------------------------------
INSERT INTO appointments (id, "dataHora", duracao, tipo, status, "petId", "funcionarioId", observacoes, "createdAt", "updatedAt")
VALUES (
  2,
  NOW() + INTERVAL '2 hours',
  30,
  'BANHO_TOSA',
  'CONFIRMADO',
  2,
  3,
  'Banho e tosa',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO budgets (id, "appointmentId", valor, status, "createdAt", "updatedAt")
VALUES (
  2,
  2,
  8000, -- valor em centavos
  'PENDENTE',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------
-- 6. Agendamento CANCELADO  → erro 409 (status incompatível)
-- ---------------------------------------------------------------
INSERT INTO appointments (id, "dataHora", duracao, tipo, status, "petId", "funcionarioId", observacoes, "createdAt", "updatedAt")
VALUES (
  3,
  NOW() - INTERVAL '1 day',
  30,
  'CONSULTA',
  'CANCELADO',
  2,
  3,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------
-- 7. Reset sequences to prevent conflicts with manually inserted IDs
-- ---------------------------------------------------------------
SELECT setval(pg_get_serial_sequence('tutors', 'id'), COALESCE((SELECT MAX(id) FROM tutors), 1));
SELECT setval(pg_get_serial_sequence('pets', 'id'), COALESCE((SELECT MAX(id) FROM pets), 1));
SELECT setval(pg_get_serial_sequence('employees', 'id'), COALESCE((SELECT MAX(id) FROM employees), 1));
SELECT setval(pg_get_serial_sequence('appointments', 'id'), COALESCE((SELECT MAX(id) FROM appointments), 1));
SELECT setval(pg_get_serial_sequence('budgets', 'id'), COALESCE((SELECT MAX(id) FROM budgets), 1));
