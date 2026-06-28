'use client';

import type { Persona } from '@/config/services';

interface PersonaItem {
  id: Persona;
  label: string;
  emoji: string;
}

interface Props {
  personas: PersonaItem[];
  selected: Persona | null;
  onSelect: (id: Persona) => void;
}

export function PersonaGrid({ personas, selected, onSelect }: Props) {
  return (
    <div className="persona-grid" role="group" aria-label="เลือกตัวตน">
      {personas.map((p) => (
        <button
          key={p.id}
          type="button"
          className={`persona-card${selected === p.id ? ' persona-card--active' : ''}`}
          onClick={() => onSelect(p.id)}
          aria-pressed={selected === p.id}
        >
          <span className="persona-emoji" aria-hidden="true">
            {p.emoji}
          </span>
          <span className="persona-label">{p.label}</span>
        </button>
      ))}
    </div>
  );
}
