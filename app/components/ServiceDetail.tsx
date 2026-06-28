import Link from 'next/link';
import type { Service } from '@/config/services';
import { Locator } from './Locator';

const CHANNEL_LABEL: Record<string, string> = {
  office: 'ติดต่อที่สำนักงาน',
  online: 'ทำออนไลน์ได้',
};

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 6.5l3 2.5 5-5" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
    </svg>
  );
}

interface Props {
  service: Service;
}

/** Returns true when lastVerified is older than ~6 months (183 days). */
function isStale(lastVerified: string): boolean {
  return Date.now() - Date.parse(lastVerified) > 1000 * 60 * 60 * 24 * 183;
}

export function ServiceDetail({ service }: Props) {
  const stale = isStale(service.lastVerified);

  return (
    <>
      <header className="site-header">
        <div className="container">
          <div className="site-header__inner">
            <span className="site-header__dot" aria-hidden="true" />
            <Link href="/" className="site-header__name" style={{ textDecoration: 'none' }}>
              หาบริการรัฐใกล้ฉัน
            </Link>
            <span className="site-header__subtitle">คู่มือบริการสำหรับคนทั่วไป</span>
          </div>
        </div>
      </header>

      <main>
        {/* ── Mini-hero ── */}
        <section className="detail-hero" aria-labelledby="detail-title">
          <div className="container">
            <Link href="/" className="detail-back" aria-label="กลับหน้าหลัก">
              ← กลับ
            </Link>
            <p className="detail-group">{service.group}</p>
            <h1 className="detail-title" id="detail-title">
              {service.title}
            </h1>
            <div className="detail-channel-row" aria-label="ช่องทางการให้บริการ">
              {service.channel.map((ch) => (
                <span
                  key={ch}
                  className={`badge ${ch === 'online' ? 'badge--channel-online' : 'badge--channel-office'}`}
                >
                  {CHANNEL_LABEL[ch]}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Body ── */}
        <section className="detail-body">
          <div className="container">
            <div className="detail-content">
              {/* Freshness warning — only when data is older than ~6 months */}
              {stale && (
                <div className="freshness-banner" role="alert" aria-live="polite">
                  <span aria-hidden="true" style={{ flexShrink: 0 }}>⚠️</span>
                  <span>
                    ข้อมูลตรวจล่าสุดนานแล้ว อาจเปลี่ยน — โปรดยืนยันที่ลิงก์ทางการ
                  </span>
                </div>
              )}

              <div className="detail-grid">
                {/* ── Left column: docs + meta ── */}
                <div className="detail-col">
                  {/* Documents checklist */}
                  <div className="detail-card">
                    <p className="detail-card__label">เอกสารที่ต้องใช้</p>
                    <ul className="docs-list" aria-label="รายการเอกสารที่ต้องเตรียม">
                      {service.docs.map((doc) => (
                        <li key={doc} className="docs-item">
                          <span className="docs-item__check" aria-hidden="true">
                            <CheckIcon />
                          </span>
                          <span>{doc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Fee + hours */}
                  <div className="detail-card">
                    <div className="detail-meta-pair">
                      <div>
                        <p className="meta-item__key">ค่าธรรมเนียม</p>
                        <p className="meta-item__val">{service.fee}</p>
                      </div>
                      <div>
                        <p className="meta-item__key">เวลาทำการ</p>
                        <p className="meta-item__val">{service.stdHours}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Right column: actions + locator ── */}
                <div className="detail-col">
                  {/* Official link + hotline + verified */}
                  <div className="detail-card">
                    <p className="detail-card__label">ลิงก์และข้อมูลติดต่อ</p>
                    <div className="detail-actions">
                      <a
                        href={service.officialUrl}
                        className="btn btn-primary"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`เปิดเว็บไซต์ทางการของ ${service.title}`}
                      >
                        <ExternalLinkIcon />
                        เว็บไซต์ทางการ
                      </a>
                      <a
                        href={`tel:${service.hotline}`}
                        className="btn btn-outline"
                        aria-label={`โทรสายด่วน ${service.hotline}`}
                      >
                        <PhoneIcon />
                        โทร {service.hotline}
                      </a>
                    </div>

                    <div className="detail-verified">
                      <span className="detail-verified__dot" aria-hidden="true" />
                      <span>ข้อมูลตรวจล่าสุด: {service.lastVerified}</span>
                    </div>

                    <p className="detail-disclaimer">
                      ข้อมูลอ้างอิงเพื่อความสะดวก อาจเปลี่ยนแปลง — โปรดตรวจสอบกับหน่วยงานก่อนเดินทาง
                    </p>
                  </div>

                  {/* Locator (lazy) */}
                  {service.locatorAvailable && <Locator service={service} />}
                </div>
              </div>
            </div>
          </div>
        </section>
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
