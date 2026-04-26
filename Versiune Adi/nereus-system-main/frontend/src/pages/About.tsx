import { Link } from 'react-router-dom'

export default function About() {
  return (
    <div style={{
      height: '100vh', overflowY: 'auto', overflowX: 'hidden',
      background: 'var(--color-bg)',
      backgroundImage: 'radial-gradient(ellipse at 30% 20%, rgba(0,100,180,0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(0,60,120,0.1) 0%, transparent 60%)',
      padding: '0 0 60px',
    }}>
      {/* Nav */}
      <div className="glass" style={{ position: 'sticky', top: 0, zIndex: 50, padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', gap: '16px', borderRadius: 0 }}>
        <img src="/logo-solid.png" alt="Nereus" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
        <div style={{ flex: 1 }} />
        <Link to="/dashboard" style={{ textDecoration: 'none' }}>
          <button className="btn btn-primary" style={{ fontSize: '12px' }}>← Live Dashboard</button>
        </Link>
      </div>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 24px 0' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <img
            src="/logo-solid.png"
            alt="The Nereus System"
            style={{ height: '140px', width: 'auto', objectFit: 'contain', margin: '0 auto 20px', display: 'block', filter: 'drop-shadow(0 0 20px rgba(0,229,255,0.12))' }}
          />
          <p style={{ fontSize: '18px', color: 'var(--color-text-2)', maxWidth: '580px', margin: '0 auto', lineHeight: 1.6 }}>
            An early-warning system for water pollution, built for the <strong style={{ color: 'var(--color-primary)' }}>CASSINI Hackathon</strong> — Challenge #2: Space for Water.
          </p>
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['CASSINI Hackathon', 'Space for Water', 'Challenge #2'].map(tag => (
              <span key={tag} className="badge badge-citizen" style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>{tag}</span>
            ))}
          </div>
        </div>

        {/* ── The Problem ── */}
        <Section title="The Problem">
          <div className="glass" style={{
            marginTop: '16px', padding: '24px', borderLeft: '4px solid #ff6b35',
            background: 'linear-gradient(135deg, rgba(255,107,53,0.06) 0%, rgba(255,60,60,0.02) 100%)',
          }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '10px', fontWeight: 700, fontFamily: 'var(--font-mono)',
                color: '#ff6b35', background: 'rgba(255,107,53,0.12)', padding: '3px 10px',
                borderRadius: '4px', border: '1px solid rgba(255,107,53,0.25)',
                textTransform: 'uppercase', letterSpacing: '0.1em',
              }}>Real events</span>
            </div>

            <p style={{ fontSize: '14px', color: 'var(--color-text-1)', lineHeight: 1.7, margin: '0 0 14px' }}>
              In <strong style={{ color: '#ff6b35' }}>July 2021</strong> and again in <strong style={{ color: '#ff6b35' }}>July 2025</strong>, people in Timișoara 
              filmed dead fish floating on the Bega river. Heavy rain had overwhelmed the AQUATIM wastewater plant, and untreated 
              sewage got dumped straight into the canal.
            </p>
            <p style={{ fontSize: '14px', color: 'var(--color-text-2)', lineHeight: 1.7, margin: '0 0 14px' }}>
              By the time environmental authorities showed up to take water samples, over <strong style={{ color: '#ff3b3b' }}>20 hours</strong> had 
              passed. The pollution was already undetectable. Nobody was held accountable. Then the exact same thing happened four years later.
            </p>

            <div className="glass" style={{
              padding: '16px', borderLeft: '3px solid #00e87a',
              background: 'rgba(0,232,122,0.04)',
            }}>
              <div style={{ fontSize: '11px', color: '#00e87a', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>
                What Nereus would have done
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-text-1)', lineHeight: 1.6, margin: 0 }}>
                Detected the turbidity spike within the next Sentinel-2 pass (1–3 days), flagged it automatically, 
                and notified both citizens and authorities before the evidence disappeared. Early warning means early action.
              </p>
            </div>
          </div>
        </Section>

        {/* ── How It Works ── */}
        <Section title="How It Works">
          <div style={{ marginTop: '20px', overflowX: 'auto' }}>
            <svg viewBox="0 0 900 120" style={{ width: '100%', minWidth: '700px', height: 'auto' }}>
              <defs>
                <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill="#00e5ff" />
                </marker>
                <linearGradient id="boxGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(0,229,255,0.12)" />
                  <stop offset="100%" stopColor="rgba(0,229,255,0.04)" />
                </linearGradient>
              </defs>

              {[
                { x: 0,   label: 'Sentinel-2',    sub: 'Satellite',          color: '#a78bfa' },
                { x: 145, label: 'Copernicus',     sub: 'Data Space',         color: '#7c8aff' },
                { x: 290, label: 'openEO',         sub: 'Processing',         color: '#00b4ff' },
                { x: 435, label: 'Spectral Index', sub: 'NDWI · NDCI · Turb', color: '#00e87a' },
                { x: 580, label: 'ML Scoring',     sub: 'Isolation Forest',   color: '#ff8c00' },
                { x: 725, label: 'Alert',          sub: 'Dashboard + Feed',   color: '#ff3b3b' },
              ].map((box, i, arr) => (
                <g key={box.label}>
                  <rect x={box.x} y={20} width={120} height={70} rx={8} fill="url(#boxGrad)" stroke={box.color} strokeWidth={1.5} />
                  <rect x={box.x} y={20} width={120} height={3} rx={1.5} fill={box.color} />
                  <text x={box.x + 60} y={52} textAnchor="middle" fill="#e2f0ff" fontSize="12" fontWeight="700" fontFamily="Inter, sans-serif">{box.label}</text>
                  <text x={box.x + 60} y={72} textAnchor="middle" fill="#7aa8cc" fontSize="10" fontFamily="Inter, sans-serif">{box.sub}</text>
                  {i < arr.length - 1 && (
                    <line x1={box.x + 124} y1={55} x2={arr[i + 1].x - 4} y2={55} stroke="#00e5ff" strokeWidth={1.5} markerEnd="url(#arrowhead)" opacity={0.6} />
                  )}
                </g>
              ))}
            </svg>
          </div>
        </Section>

        {/* ── What We Built ── */}
        <Section title="What We Actually Built">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginTop: '16px' }}>
            {[
              { title: 'Satellite Scan Pipeline', desc: 'Pulls Sentinel-2 L2A data from the Copernicus Data Space via openEO. Computes three spectral indices (NDWI, NDCI, turbidity ratio) per pixel, then clusters anomalies and saves them as geolocated alerts.', color: '#a78bfa' },
              { title: 'ML Anomaly Detection', desc: 'An Isolation Forest model scores every detected anomaly based on its spectral values. No training labels needed — it learns what "normal" water looks like and flags outliers with a confidence score.', color: '#ff8c00' },
              { title: 'Interactive Map Dashboard', desc: 'Full-screen MapLibre map with a heatmap overlay, severity-coded alert markers, and a monitoring feed that filters to your current viewport. Search any city in Europe and scan it.', color: '#00b4ff' },
              { title: 'Citizen Reporting', desc: 'Anyone can submit a pollution report with a photo and their name. Reports are geotagged via the browser\'s Geolocation API (Galileo in Europe). Other users can upvote or downvote reports to verify them.', color: '#00e87a' },
              { title: 'Viewport-Bound Scanning', desc: 'The scan pipeline targets exactly the area visible on your screen. Pan to a random lake, hit Trigger Scan, and Nereus will analyze that specific region — no hardcoded coordinates.', color: '#00e5ff' },
              { title: 'Dynamic Heatmap Generation', desc: 'Pollution heatmaps are generated on-the-fly for any bounding box. The backend seeds deterministic patterns from the date, so the same day always shows the same data for reproducibility.', color: '#f5d800' },
            ].map(s => (
              <div key={s.title} className="glass" style={{ padding: '16px', borderLeft: `3px solid ${s.color}` }}>
                <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--color-text-1)', marginBottom: '6px' }}>{s.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-2)', lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Data Sources ── */}
        <Section title="Data Sources">
          <div className="glass" style={{ marginTop: '16px', overflowX: 'auto', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(0,229,255,0.15)' }}>
                  {['Source', 'What we use', 'What it detects'].map(h => (
                    <th key={h} style={{
                      padding: '12px 14px', textAlign: 'left', fontWeight: 700,
                      color: 'var(--color-primary)', fontSize: '11px',
                      letterSpacing: '0.08em', textTransform: 'uppercase',
                      fontFamily: 'var(--font-mono)',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { src: 'Sentinel-2 MSI', use: 'Bands B03, B04, B05, B08 at 10–20m resolution', detects: 'Water extent, algal blooms, turbidity', color: '#00b4ff' },
                  { src: 'Copernicus CDSE', use: 'L2A atmospherically corrected products via openEO', detects: 'Cloud-free scenes over target water bodies', color: '#7c8aff' },
                  { src: 'Isolation Forest', use: 'Unsupervised anomaly scoring on spectral indices', detects: 'Outlier pixels — pollution events without labeled data', color: '#ff8c00' },
                  { src: 'Galileo GNSS', use: 'Browser Geolocation API (defaults to Galileo in EU)', detects: 'Authenticated coordinates for citizen reports', color: '#a78bfa' },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '10px 14px', color: row.color, fontWeight: 600 }}>{row.src}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--color-text-2)', fontSize: '12px' }}>{row.use}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--color-text-2)', fontSize: '12px' }}>{row.detects}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* ── Spectral Indices ── */}
        <Section title="Spectral Indices">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            {[
              { name: 'NDWI — water mask', formula: '(B03 − B08) / (B03 + B08)', desc: 'Separates water from land. Values above −0.1 are classified as open water. Everything downstream only runs on water pixels.', color: '#00b4ff' },
              { name: 'NDCI — chlorophyll index', formula: '(B05 − B04) / (B05 + B04)', desc: 'Positive values mean elevated chlorophyll-a, which usually means algal blooms or cyanobacteria. This is the main "green water" detector.', color: '#00e87a' },
              { name: 'Turbidity — red/green ratio', formula: 'B04 / B03', desc: 'High ratios = more suspended particles. Catches sediment runoff, industrial discharge, and flood turbidity. Simple but effective.', color: '#ff8c00' },
            ].map(idx => (
              <div key={idx.name} className="glass" style={{ padding: '16px' }}>
                <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--color-text-1)', marginBottom: '6px' }}>{idx.name}</div>
                <code style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: idx.color, display: 'block', marginBottom: '8px', padding: '6px 10px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px' }}>
                  {idx.formula}
                </code>
                <div style={{ fontSize: '12px', color: 'var(--color-text-2)', lineHeight: 1.5 }}>{idx.desc}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Space Services ── */}
        <Section title="EU Space Services">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
            <div className="glass" style={{ padding: '20px', borderTop: '2px solid #a78bfa' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>🛰</div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-text-1)', marginBottom: '6px' }}>Copernicus</div>
              <ul style={{ fontSize: '12px', color: 'var(--color-text-2)', lineHeight: 1.7, paddingLeft: '16px' }}>
                <li>Sentinel-2 MSI multispectral imagery</li>
                <li>Copernicus Data Space Ecosystem (CDSE)</li>
                <li>openEO Python API for server-side processing</li>
                <li>5-day revisit, 10m spatial resolution</li>
              </ul>
            </div>
            <div className="glass" style={{ padding: '20px', borderTop: '2px solid #00b4ff' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>📡</div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-text-1)', marginBottom: '6px' }}>Galileo</div>
              <ul style={{ fontSize: '12px', color: 'var(--color-text-2)', lineHeight: 1.7, paddingLeft: '16px' }}>
                <li>W3C Geolocation API (browser-native)</li>
                <li>In Europe, positions default to Galileo</li>
                <li>Sub-metre accuracy with SBAS</li>
                <li>Every citizen report is geotagged</li>
              </ul>
            </div>
          </div>
        </Section>

        {/* ── Tech Stack ── */}
        <Section title="Tech Stack">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
            <div className="glass" style={{ padding: '20px' }}>
              <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--color-text-1)', marginBottom: '10px' }}>Frontend</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-2)', lineHeight: 1.8 }}>
                React + TypeScript, Vite, MapLibre GL, TanStack Query, Zustand, deployed on Vercel
              </div>
            </div>
            <div className="glass" style={{ padding: '20px' }}>
              <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--color-text-1)', marginBottom: '10px' }}>Backend</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-2)', lineHeight: 1.8 }}>
                Python, FastAPI, SQLModel (SQLite), scikit-learn (Isolation Forest), openEO, deployed on Render
              </div>
            </div>
          </div>
        </Section>

        {/* ── What's Next ── */}
        <Section title="What's Next">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginTop: '16px' }}>
            {[
              { icon: '⚙️', text: 'Physical IoT sensors in the water for ground-truth validation' },
              { icon: '🔐', text: 'Galileo OSNMA for cryptographically verified report coordinates' },
              { icon: '🔔', text: 'SMS/email alerts directly to ANAR and Garda de Mediu' },
              { icon: '📱', text: 'Mobile app with offline report queue' },
              { icon: '🛰', text: 'Sentinel-1 SAR for oil slick detection through clouds' },
              { icon: '🌍', text: 'Multi-basin rollout: Danube, Mureș, Siret' },
            ].map(item => (
              <div key={item.text} className="glass" style={{ padding: '12px 14px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                <span style={{ fontSize: '12px', color: 'var(--color-text-2)', lineHeight: 1.5 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '12px', color: 'var(--color-text-3)', marginBottom: '8px' }}>
            Built by MECHAFUSION for the CASSINI Hackathon 2026
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-3)', opacity: 0.6 }}>
            Powered by Copernicus · Galileo · EU Space Programme
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '48px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-1)', marginBottom: '4px' }}>{title}</h2>
      <div style={{ height: '2px', width: '48px', background: 'var(--color-primary)', borderRadius: '2px', marginBottom: '4px' }} />
      {children}
    </section>
  )
}
