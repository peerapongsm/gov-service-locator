'use client';

import { useState } from 'react';
import { SERVICES, PERSONAS, type Persona } from '@/config/services';
import { PersonaGrid } from './components/PersonaGrid';
import { ServiceList } from './components/ServiceList';

function HeroSearchIcon() {
  return (
    <svg
      className="hero__search-icon"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="9" cy="9" r="6" />
      <path d="m14 14 3 3" />
    </svg>
  );
}

export default function Home() {
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [query, setQuery] = useState('');
  const [viewAll, setViewAll] = useState(false);

  const isListMode = selectedPersona !== null || query.trim() !== '' || viewAll;

  const filteredServices = (() => {
    const q = query.trim().toLowerCase();
    if (q !== '') return SERVICES.filter((s) => s.title.toLowerCase().includes(q));
    if (selectedPersona !== null)
      return SERVICES.filter((s) => s.persona.includes(selectedPersona));
    return SERVICES;
  })();

  const currentPersonaLabel =
    selectedPersona !== null
      ? PERSONAS.find((p) => p.id === selectedPersona)?.label ?? ''
      : '';

  const listTitle = query.trim()
    ? 'ผลการค้นหา'
    : selectedPersona !== null
    ? `บริการสำหรับ${currentPersonaLabel}`
    : 'บริการทั้งหมด';

  function handlePersonaSelect(id: Persona) {
    setSelectedPersona(id);
    setQuery('');
    setViewAll(false);
  }

  function handleViewAll() {
    setViewAll(true);
    setSelectedPersona(null);
    setQuery('');
  }

  function handleClear() {
    setSelectedPersona(null);
    setQuery('');
    setViewAll(false);
  }

  function handleQueryChange(val: string) {
    setQuery(val);
    if (val.trim() !== '') {
      setSelectedPersona(null);
      setViewAll(false);
    }
  }

  // Key forces ServiceList to remount (reset local filter) when context changes
  const listKey =
    selectedPersona !== null
      ? selectedPersona
      : query.trim() !== ''
      ? 'query'
      : 'all';

  return (
    <>
      <header className="site-header">
        <div className="container">
          <div className="site-header__inner">
            <span className="site-header__dot" aria-hidden="true" />
            <span className="site-header__name">หาบริการรัฐใกล้ฉัน</span>
            <span className="site-header__subtitle">คู่มือบริการสำหรับคนทั่วไป</span>
          </div>
        </div>
      </header>

      <main>
        <section className="hero" aria-label="ค้นหาบริการรัฐ">
          <div className="container">
            <p className="hero__eyebrow">บริการรัฐ · สำหรับคนทั่วไป</p>
            <h1 className="hero__heading">
              คุณคือใคร?
              <br />
              <em>อยากทำอะไร?</em>
            </h1>
            <p className="hero__sub">
              เลือกตัวตนของคุณ แล้วเราจะพาไปหาบริการที่ใช่
              <br />
              ไม่ต้องเดาว่าต้องไปที่ไหน ไม่ต้องวนหาในเว็บราชการ
            </p>
            <div className="hero__actions">
              <div className="hero__search-wrap">
                <HeroSearchIcon />
                <input
                  className="field"
                  type="search"
                  placeholder="ค้นหาชื่อบริการ เช่น บัตรประชาชน..."
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  aria-label="ค้นหาบริการ"
                />
              </div>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleViewAll}
                aria-label={`ดูบริการทั้งหมด ${SERVICES.length} รายการ`}
              >
                ดูทั้งหมด&nbsp;·&nbsp;{SERVICES.length} บริการ
              </button>
            </div>
          </div>
        </section>

        {isListMode ? (
          <section className="list-section" aria-label={listTitle}>
            <div className="container">
              <div className="list-header">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={handleClear}
                  aria-label="ย้อนกลับไปหน้าหลัก"
                >
                  ← กลับ
                </button>
                <h2 className="list-header__title">
                  {listTitle}
                  <span className="list-header__count">
                    &nbsp;({filteredServices.length} รายการ)
                  </span>
                </h2>
              </div>
              <ServiceList key={listKey} services={filteredServices} />
            </div>
          </section>
        ) : (
          <section className="persona-section" aria-label="เลือกตัวตน">
            <div className="container">
              <h2 className="persona-section__title">เลือกตัวตนของคุณ</h2>
              <PersonaGrid
                personas={PERSONAS}
                selected={selectedPersona}
                onSelect={handlePersonaSelect}
              />
            </div>
          </section>
        )}
      </main>

      <footer className="site-footer">
        <div className="container">
          <p className="site-footer__text">
            ข้อมูลอ้างอิงเพื่อความสะดวก โปรดตรวจสอบกับหน่วยงานก่อนเดินทาง
            <br />
            อัปเดตล่าสุด 2026 · ไม่ใช่เว็บไซต์ทางการของหน่วยงานรัฐ
          </p>
        </div>
      </footer>
    </>
  );
}
