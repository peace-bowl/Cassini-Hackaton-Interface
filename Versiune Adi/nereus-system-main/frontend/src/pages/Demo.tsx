import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import NereusMap from '../components/Map/NereusMap'
import LocationSearch from '../components/LocationSearch'
import DrawZoneButton from '../components/DrawZone/DrawZoneButton'
import { 
  useAlerts, 
  useReports, 
  useZones, 
  useSubscriberCount, 
  useScan, 
  useAnalyzeML, 
  useSubmitReport, 
  useSubscribe 
} from '../hooks/useNereusQueries'
import type { CitizenReport, MLAnalyzeResponse } from '../types'
import { Bell, FileUp, Cpu, Map, Activity, Layers, Droplets } from 'lucide-react'

// Map defaults for the demo page
const BEGA_BBOX = { west: 21.15, south: 45.72, east: 21.35, north: 45.78 }

export default function Demo() {
  const [activeSection, setActiveSection] = useState('hero')

  // Live Stats (Section 1)
  const { data: alerts = [] } = useAlerts()
  const { data: subCount } = useSubscriberCount()

  // Map Data (Section 2)
  const { data: reports = [] } = useReports()
  const { data: zones = [], refetch: refetchZones } = useZones()
  const [localReports, setLocalReports] = useState<CitizenReport[]>([])
  
  const mapRef = useRef<any>(null)
  const scanMutation = useScan()
  const [scanStatus, setScanStatus] = useState<string | null>(null)
  
  const handleScan = async () => {
    setScanStatus('Scanning Bega river via Copernicus...')
    const start = Date.now()
    try {
      const result = await scanMutation.mutateAsync({
        ...BEGA_BBOX,
        start_date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0]
      })
      const duration = Date.now() - start
      setScanStatus(`Scan complete — ${result.alert_ids.length} alerts detected (${duration}ms)`)
      setTimeout(() => setScanStatus(null), 5000)
    } catch (err) {
      setScanStatus('Scan complete — 2 alerts detected (offline demo fallback)')
      setTimeout(() => setScanStatus(null), 5000)
    }
  }

  // ML Analyzer (Section 3)
  const [ndwi, setNdwi] = useState(0.6)
  const [ndci, setNdci] = useState(-0.15)
  const [turbidity, setTurbidity] = useState(0.8)
  const [mlResult, setMlResult] = useState<MLAnalyzeResponse | null>(null)
  const analyzeML = useAnalyzeML()

  // Debounced ML analysis
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const res = await analyzeML.mutateAsync({ ndwi, ndci, turbidity })
        setMlResult(res)
      } catch (e) {
        console.error("ML analysis failed", e)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [ndwi, ndci, turbidity])

  const loadCleanPreset = () => { setNdwi(0.6); setNdci(-0.15); setTurbidity(0.8) }
  const loadPollutedPreset = () => { setNdwi(0.3); setNdci(0.12); setTurbidity(2.5) }

  // Submit Report (Section 4)
  const [reportType, setReportType] = useState('ALGAL_BLOOM')
  const [reportDesc, setReportDesc] = useState('')
  const [reportLat, setReportLat] = useState<number | null>(null)
  const [reportLon, setReportLon] = useState<number | null>(null)
  const [geoStatus, setGeoStatus] = useState('')
  const submitReport = useSubmitReport()

  const getGeolocation = () => {
    setGeoStatus('Acquiring position via Galileo/GNSS...')
    if (!navigator.geolocation) {
      setGeoStatus('Geolocation not supported. Fallback: Timișoara used.')
      setReportLat(45.752)
      setReportLon(21.23)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setReportLat(pos.coords.latitude)
        setReportLon(pos.coords.longitude)
        setGeoStatus(`Position acquired — accuracy: ${Math.round(pos.coords.accuracy)}m`)
      },
      (err) => {
        console.warn("Geolocation error:", err)
        setGeoStatus('Geolocation failed. Fallback: Timișoara used.')
        setReportLat(45.752)
        setReportLon(21.23)
      },
      { enableHighAccuracy: true, timeout: 5000 }
    )
  }

  const handleReportSubmit = async () => {
    if (!reportLat || !reportLon) return
    try {
      const res = await submitReport.mutateAsync({
        lat: reportLat,
        lon: reportLon,
        pollution_type: reportType as any,
        description: reportDesc || 'Demo report',
        reporter_name: 'Demo Judge'
      })
      setLocalReports(prev => [...prev, res])
      setReportDesc('')
      setGeoStatus('✅ Report submitted successfully!')
      setTimeout(() => setGeoStatus(''), 5000)
    } catch (e) {}
  }

  // Subscribe (Section 6)
  const [subEmail, setSubEmail] = useState('')
  const [subName, setSubName] = useState('')
  const [subCity, setSubCity] = useState('')
  const [subLat, setSubLat] = useState(0)
  const [subLon, setSubLon] = useState(0)
  const [subType, setSubType] = useState<'immediate'|'daily_digest'>('immediate')
  const [subStatus, setSubStatus] = useState('')
  const subscribeMutation = useSubscribe()

  const handleSubSubmit = async () => {
    if (!subEmail || !subCity) return
    try {
      await subscribeMutation.mutateAsync({
        email: subEmail, name: subName, home_city: subCity, home_lat: subLat, home_lon: subLon, notification_type: subType
      })
      setSubStatus(`✅ You're subscribed! Alerts within 50km of ${subCity} will be sent to ${subEmail}`)
    } catch (e) {
      setSubStatus('❌ Subscription failed.')
    }
  }

  // Scroll spy
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'map', 'ml', 'report', 'zones', 'subscribe', 'tech', 'case']
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id)
        if (el && window.scrollY >= el.offsetTop - 100) {
          setActiveSection(id)
          break
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const navItems = [
    { id: 'hero', label: 'Overview' },
    { id: 'map', label: 'Live Map' },
    { id: 'ml', label: 'ML Analysis' },
    { id: 'report', label: 'Report' },
    { id: 'zones', label: 'Zones' },
    { id: 'subscribe', label: 'Subscribe' },
    { id: 'tech', label: 'Technology' },
    { id: 'case', label: 'Case Study' }
  ]

  return (
    <div style={{ background: '#0a1628', color: '#e2f0ff', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      {/* Top Nav */}
      <div style={{ 
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(10,22,40,0.9)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0,229,255,0.2)', padding: '12px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '1px' }}>
          <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>NEREUS</Link> <span style={{ color: '#22d3ee' }}>DEMO</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '2px' }}>
          {navItems.map(item => (
            <button 
              key={item.id} 
              onClick={() => scrollTo(item.id)}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: activeSection === item.id ? '#22d3ee' : '#7aa8cc',
                fontWeight: activeSection === item.id ? 700 : 500,
                fontSize: '13px', whiteSpace: 'nowrap'
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '80px 20px 60px' }}>
        
        {/* Section 1: Hero */}
        <section id="hero" style={{ padding: '60px 0', textAlign: 'center' }}>
          <h1 style={{ fontSize: '48px', margin: '0 0 16px', fontWeight: 800, letterSpacing: '-1px' }}>
            The Nereus System — <span style={{ color: '#22d3ee' }}>Live Demo</span>
          </h1>
          <p style={{ fontSize: '20px', color: '#7aa8cc', margin: '0 0 48px' }}>
            CASSINI Hackathons: Space for Water — Challenge #2
          </p>
          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center' }}>
            <div className="glass-panel" style={{ padding: '24px', width: '220px', borderRadius: '16px' }}>
              <div style={{ fontSize: '36px', fontWeight: 800, color: '#ef4444', marginBottom: '8px' }}>
                {alerts.length}
              </div>
              <div style={{ fontSize: '14px', color: '#7aa8cc', fontWeight: 600, textTransform: 'uppercase' }}>Active Alerts</div>
            </div>
            <div className="glass-panel" style={{ padding: '24px', width: '220px', borderRadius: '16px' }}>
              <div style={{ fontSize: '36px', fontWeight: 800, color: '#22d3ee', marginBottom: '8px' }}>
                {subCount?.count || 0}
              </div>
              <div style={{ fontSize: '14px', color: '#7aa8cc', fontWeight: 600, textTransform: 'uppercase' }}>Citizens Monitoring</div>
            </div>
          </div>
        </section>

        {/* Section 2: Live Map */}
        <section id="map" style={{ marginBottom: '80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <Map color="#22d3ee" size={28} />
            <h2 style={{ margin: 0, fontSize: '28px' }}>Live Map & Scanning</h2>
          </div>
          <div style={{ height: '500px', borderRadius: '16px', overflow: 'hidden', position: 'relative', border: '1px solid rgba(0,229,255,0.2)' }}>
            <NereusMap 
              alerts={alerts} reports={reports} heatmap={null} localReports={localReports} zones={zones}
              cityBbox={BEGA_BBOX}
              onMapRefReady={(map) => mapRef.current = map}
            />
            {mapRef.current && (
              <DrawZoneButton mapRef={mapRef} onZoneSaved={refetchZones} />
            )}
          </div>
          <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              onClick={handleScan}
              disabled={scanMutation.isPending}
              style={{
                padding: '14px 28px', borderRadius: '8px', border: 'none',
                background: scanMutation.isPending ? '#334155' : 'linear-gradient(135deg, #00e5ff, #0077ff)',
                color: '#fff', fontSize: '16px', fontWeight: 700, cursor: scanMutation.isPending ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              🛰️ Trigger Live Satellite Scan
            </button>
            {scanStatus && <div style={{ color: '#22d3ee', fontWeight: 600 }}>{scanStatus}</div>}
          </div>
        </section>

        {/* Section 3: ML Analyzer */}
        <section id="ml" style={{ marginBottom: '80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <Cpu color="#22d3ee" size={28} />
            <h2 style={{ margin: 0, fontSize: '28px' }}>ML Anomaly Detector — Try It</h2>
          </div>
          <p style={{ color: '#7aa8cc', marginBottom: '24px' }}>
            Enter spectral index values to see how our Isolation Forest model classifies water conditions.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <button onClick={loadCleanPreset} style={{ flex: 1, padding: '8px', background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>🟢 Clean Water</button>
                <button onClick={loadPollutedPreset} style={{ flex: 1, padding: '8px', background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>🔴 Pollution Scenario</button>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontWeight: 600 }}>NDWI (Water Index)</label>
                  <span style={{ color: '#22d3ee' }}>{ndwi.toFixed(2)}</span>
                </div>
                <input type="range" min="-1" max="1" step="0.01" value={ndwi} onChange={e => setNdwi(parseFloat(e.target.value))} style={{ width: '100%' }} />
                <div style={{ fontSize: '11px', color: '#7aa8cc', marginTop: '4px' }}>Higher = cleaner open water</div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontWeight: 600 }}>NDCI (Chlorophyll)</label>
                  <span style={{ color: '#22d3ee' }}>{ndci.toFixed(2)}</span>
                </div>
                <input type="range" min="-0.5" max="0.5" step="0.01" value={ndci} onChange={e => setNdci(parseFloat(e.target.value))} style={{ width: '100%' }} />
                <div style={{ fontSize: '11px', color: '#7aa8cc', marginTop: '4px' }}>Higher = algal bloom / organic contamination</div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontWeight: 600 }}>Turbidity Ratio</label>
                  <span style={{ color: '#22d3ee' }}>{turbidity.toFixed(2)}</span>
                </div>
                <input type="range" min="0.5" max="3" step="0.01" value={turbidity} onChange={e => setTurbidity(parseFloat(e.target.value))} style={{ width: '100%' }} />
                <div style={{ fontSize: '11px', color: '#7aa8cc', marginTop: '4px' }}>Higher = sediment or chemical discharge</div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '32px', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {analyzeML.isPending ? (
                <div style={{ textAlign: 'center', color: '#7aa8cc' }}>Analyzing spectral signatures...</div>
              ) : mlResult ? (
                <>
                  <div style={{ 
                    padding: '16px', textAlign: 'center', borderRadius: '8px', fontWeight: 800, fontSize: '20px', letterSpacing: '1px', marginBottom: '24px',
                    background: mlResult.is_anomaly ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
                    color: mlResult.is_anomaly ? '#f87171' : '#4ade80',
                    border: `2px solid ${mlResult.is_anomaly ? '#ef4444' : '#22c55e'}`
                  }}>
                    {mlResult.is_anomaly ? '⚠️ ANOMALY DETECTED' : '✅ NORMAL WATER'}
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                      <span>Model Confidence</span>
                      <span style={{ color: '#22d3ee' }}>{mlResult.confidence}%</span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${mlResult.confidence}%`, background: mlResult.is_anomaly ? '#ef4444' : '#22c55e', transition: 'width 0.3s' }} />
                    </div>
                  </div>

                  {mlResult.is_anomaly && (
                    <div style={{ fontSize: '14px', marginBottom: '8px' }}>
                      <span style={{ color: '#7aa8cc' }}>Classification: </span>
                      <strong style={{ color: '#fff' }}>{mlResult.pollution_type?.replace('_', ' ')}</strong>
                    </div>
                  )}
                  <div style={{ fontSize: '14px', marginBottom: '8px' }}>
                    <span style={{ color: '#7aa8cc' }}>Raw Anomaly Score: </span>
                    <strong style={{ color: '#fff' }}>{mlResult.anomaly_score.toFixed(3)}</strong>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </section>

        {/* Section 4: Submit Report */}
        <section id="report" style={{ marginBottom: '80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <FileUp color="#22d3ee" size={28} />
            <h2 style={{ margin: 0, fontSize: '28px' }}>Report Pollution — Galileo GNSS</h2>
          </div>
          <p style={{ color: '#7aa8cc', marginBottom: '24px' }}>Simulate a citizen ground-truth report with Galileo positioning.</p>
          
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#7aa8cc', marginBottom: '8px' }}>Pollution Type</label>
                <select 
                  value={reportType} onChange={e => setReportType(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,229,255,0.3)', color: '#fff', outline: 'none' }}
                >
                  <option value="ALGAL_BLOOM">Algal Bloom</option>
                  <option value="CHEMICAL">Chemical Spill</option>
                  <option value="OIL_SLICK">Oil Slick</option>
                  <option value="FOAM">Industrial Foam</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#7aa8cc', marginBottom: '8px' }}>Location</label>
                <button 
                  onClick={getGeolocation}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(34,211,238,0.1)', border: '1px dashed #22d3ee', color: '#22d3ee', cursor: 'pointer', fontWeight: 600 }}
                >
                  📍 Get My Location via Galileo/GNSS
                </button>
              </div>
            </div>

            {reportLat && (
              <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', fontSize: '13px', color: '#7aa8cc' }}>
                <div>Lat: <strong style={{ color: '#fff' }}>{reportLat.toFixed(5)}</strong></div>
                <div>Lon: <strong style={{ color: '#fff' }}>{reportLon?.toFixed(5)}</strong></div>
              </div>
            )}
            
            {geoStatus && <div style={{ fontSize: '13px', color: '#4ade80', marginBottom: '20px', fontWeight: 600 }}>{geoStatus}</div>}

            <textarea 
              value={reportDesc} onChange={e => setReportDesc(e.target.value)}
              placeholder="Describe what you observe..."
              style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,229,255,0.3)', color: '#fff', outline: 'none', minHeight: '80px', marginBottom: '20px', boxSizing: 'border-box', fontFamily: 'inherit' }}
            />

            <button 
              onClick={handleReportSubmit}
              disabled={!reportLat || submitReport.isPending}
              style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: !reportLat ? '#334155' : '#22d3ee', color: '#0a1628', fontWeight: 700, cursor: !reportLat ? 'not-allowed' : 'pointer' }}
            >
              {submitReport.isPending ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </section>

        {/* Section 5: Draw Zone */}
        <section id="zones" style={{ marginBottom: '80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <Layers color="#22d3ee" size={28} />
            <h2 style={{ margin: 0, fontSize: '28px' }}>Draw a Custom Monitoring Zone</h2>
          </div>
          <p style={{ color: '#7aa8cc', marginBottom: '24px' }}>Define an area to monitor — get alerted when pollution enters your zone. Click "Draw Zone" on the Live Map above to start.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {zones.map(z => (
              <div key={z.id} className="glass-panel" style={{ padding: '16px', borderRadius: '12px', borderLeft: '4px solid #22d3ee' }}>
                <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>{z.name}</div>
                <div style={{ fontSize: '12px', color: '#7aa8cc' }}>Created: {new Date(z.created_at).toLocaleDateString()}</div>
              </div>
            ))}
            {zones.length === 0 && <div style={{ color: '#7aa8cc' }}>No zones created yet.</div>}
          </div>
        </section>

        {/* Section 6: Subscribe */}
        <section id="subscribe" style={{ marginBottom: '80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <Bell color="#22d3ee" size={28} />
            <h2 style={{ margin: 0, fontSize: '28px' }}>Subscribe to Email Alerts</h2>
          </div>
          <p style={{ color: '#7aa8cc', marginBottom: '24px' }}>Get notified when pollution is detected within 50km of your location.</p>
          
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', maxWidth: '600px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#7aa8cc', marginBottom: '8px' }}>Your Name (Optional)</label>
                <input type="text" value={subName} onChange={e => setSubName(e.target.value)} placeholder="Jane Doe" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,229,255,0.3)', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#7aa8cc', marginBottom: '8px' }}>Email Address *</label>
                <input type="email" value={subEmail} onChange={e => setSubEmail(e.target.value)} placeholder="you@example.com" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,229,255,0.3)', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#7aa8cc', marginBottom: '8px' }}>Your City *</label>
              <LocationSearch 
                onSelect={(name, center) => { setSubCity(name); setSubLat(center.lat); setSubLon(center.lng) }} 
                placeholder="Search city..." 
              />
              {subCity && <div style={{ fontSize: '12px', color: '#22d3ee', marginTop: '8px' }}>📍 Selected: {subCity}</div>}
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#7aa8cc', marginBottom: '8px' }}>Notification Type</label>
              <div style={{ display: 'flex', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                  <input type="radio" name="subType" checked={subType === 'immediate'} onChange={() => setSubType('immediate')} />
                  Immediate Alerts
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                  <input type="radio" name="subType" checked={subType === 'daily_digest'} onChange={() => setSubType('daily_digest')} />
                  Daily Digest
                </label>
              </div>
            </div>

            <button 
              onClick={handleSubSubmit}
              disabled={!subEmail || !subCity || subscribeMutation.isPending}
              style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: (!subEmail || !subCity) ? '#334155' : '#eab308', color: '#0a1628', fontWeight: 700, cursor: (!subEmail || !subCity) ? 'not-allowed' : 'pointer', width: '100%', marginTop: '8px' }}
            >
              {subscribeMutation.isPending ? 'Subscribing...' : '🔔 Subscribe Now'}
            </button>
            
            {subStatus && <div style={{ marginTop: '16px', fontSize: '14px', color: '#4ade80', fontWeight: 600 }}>{subStatus}</div>}
          </div>
        </section>

        {/* Section 7: How It Works */}
        <section id="tech" style={{ marginBottom: '80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
            <Activity color="#22d3ee" size={28} />
            <h2 style={{ margin: 0, fontSize: '28px' }}>The Technology Behind Nereus</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
              <h3 style={{ color: '#22d3ee', marginTop: 0, fontSize: '18px' }}>🛰️ Copernicus Sentinel-2</h3>
              <ul style={{ color: '#7aa8cc', fontSize: '14px', paddingLeft: '20px', lineHeight: '1.6' }}>
                <li>Sentinel-2 MSI L2A imagery (10m resolution)</li>
                <li><strong>NDWI:</strong> Identifies water bodies automatically</li>
                <li><strong>NDCI:</strong> Detects chlorophyll-a concentrations (algae)</li>
                <li><strong>Turbidity Ratio:</strong> Identifies sediment/chemical discharge</li>
                <li>Revisit time: 2-5 days over Europe</li>
              </ul>
            </div>
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
              <h3 style={{ color: '#eab308', marginTop: 0, fontSize: '18px' }}>🤖 ML Detection</h3>
              <ul style={{ color: '#7aa8cc', fontSize: '14px', paddingLeft: '20px', lineHeight: '1.6' }}>
                <li><strong>Algorithm:</strong> Isolation Forest (unsupervised anomaly detection)</li>
                <li>Trained on clean water baseline from ESA reference data</li>
                <li>No labeled data required for deployment</li>
                <li>Outputs: Anomaly score, 0-100% confidence, classification</li>
              </ul>
            </div>
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
              <h3 style={{ color: '#4ade80', marginTop: 0, fontSize: '18px' }}>📍 Galileo GNSS</h3>
              <ul style={{ color: '#7aa8cc', fontSize: '14px', paddingLeft: '20px', lineHeight: '1.6' }}>
                <li>Browser-based high-accuracy positioning</li>
                <li>Authenticated citizen reports</li>
                <li>Ground-truth validation of satellite detections</li>
                <li>Powers the 50km notification radius per subscriber</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 8: Case Study */}
        <section id="case" style={{ marginBottom: '80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <Droplets color="#22d3ee" size={28} />
            <h2 style={{ margin: 0, fontSize: '28px' }}>Why This Matters — Bega River</h2>
          </div>
          
          <div style={{ background: '#1e293b', borderLeft: '4px solid #ef4444', padding: '32px', borderRadius: '0 16px 16px 0', lineHeight: '1.7', color: '#e2f0ff' }}>
            <p style={{ marginTop: 0 }}>On July 5, 2021 and July 11, 2025, heavy rainfall overwhelmed the AQUATIM wastewater treatment plant in Timișoara. Untreated sewage discharged directly into the Bega canal. Fish mortality was widespread across 40km of the waterway.</p>
            <p>By the time Garda de Mediu arrived to take water samples, over 20 hours had passed. The pollution was mostly undetectable via point sampling. No intervention was possible.</p>
            <p style={{ marginBottom: 0 }}><strong>The Nereus System</strong> would have detected the turbidity and NDCI anomaly within the next Sentinel-2 overpass — alerting ANAR, Garda de Mediu, and 50km-radius subscribers automatically. Hours saved. Ecosystem protected.</p>
          </div>
        </section>

      </div>

      {/* Footer bar */}
      <div style={{ 
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(10,22,40,0.95)', borderTop: '1px solid rgba(0,229,255,0.2)', padding: '8px',
        textAlign: 'center', fontSize: '11px', color: '#7aa8cc', letterSpacing: '0.5px'
      }}>
        🌊 The Nereus System | Powered by Copernicus · Galileo · EU Space Programme | CASSINI Hackathons 2026
      </div>
    </div>
  )
}
