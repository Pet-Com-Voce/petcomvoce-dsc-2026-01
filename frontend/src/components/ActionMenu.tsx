import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Appointment } from '../types';
import { TIPO_LABELS, STATUS_LABELS } from '../utils';

interface ActionMenuProps {
  id: number | string;
  appointment?: Appointment;
  onCheckin?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ActionMenu({ id, appointment, onCheckin, onEdit, onDelete }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, right: 0 });

  useLayoutEffect(() => {
    if (open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 6, right: document.documentElement.clientWidth - rect.right });
    }
  }, [open]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (btnRef.current?.contains(e.target as Node)) return;
      if (menuRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    }
    // Close on any scroll to prevent floating menu
    function handleScroll() { setOpen(false); }
    
    document.addEventListener('mousedown', handleClick);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

  const canCheckin = appointment && ['PENDENTE', 'CONFIRMADO'].includes(appointment.status) && !!onCheckin;

  return (
    <>
      <button
        ref={btnRef}
        className="action-btn"
        id={`action-btn-${id}`}
        onClick={() => setOpen(o => !o)}
        title="Ações"
      >
        ⋯
      </button>
      {open && createPortal(
        <div 
          className="dropdown" 
          ref={menuRef} 
          style={{ position: 'fixed', top: pos.top, right: pos.right, margin: 0 }}
        >
          {canCheckin && onCheckin && (
            <button className="dropdown-item" onClick={() => { setOpen(false); onCheckin(); }}>
              ✅ Check-in
            </button>
          )}
          {onEdit && (
            <button className="dropdown-item" onClick={() => { setOpen(false); onEdit(); }}>
              ✏️ Editar
            </button>
          )}
          {onDelete && (
            <>
              {(onEdit || canCheckin) && <div className="dropdown-divider" />}
              <button className="dropdown-item danger" onClick={() => { setOpen(false); onDelete(); }}>
                🗑️ Remover
              </button>
            </>
          )}
        </div>,
        document.body
      )}
    </>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────
export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge ${status}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

// ─── Type chip ────────────────────────────────────────────────────────────────
export function TypeChip({ tipo }: { tipo: string }) {
  return (
    <span className="type-chip">
      {TIPO_LABELS[tipo] ?? tipo}
    </span>
  );
}
