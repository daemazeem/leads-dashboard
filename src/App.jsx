import React, { useState, useEffect } from 'react';
import './index.css';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, ComposedChart, Area, LabelList
} from 'recharts';

const ReasonTooltip = ({ reasons }) => {
  if (!reasons || reasons.length === 0) return null;
  return (
    <div className="reason-tooltip">
      <div className="reason-header">ICP Match Profile</div>
      {reasons.map((reason, i) => (
        <div key={i} className="reason-item">
          <span className="reason-bullet">✦</span> {reason}
        </div>
      ))}
    </div>
  );
};

const LeadRow = ({ lead, index, onSelect }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const probPercentage = (lead.conversion_probability * 100).toFixed(0);
  const probClass = probPercentage > 70 ? 'prob-high' : probPercentage > 40 ? 'prob-medium' : 'prob-low';

  return (
    <div className="lead-row animate-row"
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={() => onSelect(lead)}>
      <div className="lead-main">
        <span className="lead-id">Lead #{lead.lead_id.split('-')[0].toUpperCase()}</span>
        <div className="lead-metadata">
          <span className="platform-tag">{lead.platform}</span>
          <span>•</span>
          <span>{lead.utm_source}</span>
        </div>
      </div>
      <div
        className={`prob-cell ${probClass}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        style={{ position: 'relative' }}
      >
        {probPercentage}% Probability
        {showTooltip && lead.icp_reasons?.length > 0 && <ReasonTooltip reasons={lead.icp_reasons} />}
      </div>
      <div className="status-cell"><span className="status-badge">{lead.status}</span></div>
      <div className="city-cell">{lead.lead_created_city}</div>
      <div className="age-cell">{lead.age}y</div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label, suffix = "%" }) => {
  if (active && payload && payload.length) {
    const mainEntry = payload[0];
    const isRate = mainEntry.dataKey.includes('rate');
    const formattedValue = isRate
      ? `${(mainEntry.value * 100).toFixed(1)}${suffix}`
      : mainEntry.value.toLocaleString();

    return (
      <div className="custom-tooltip">
        <p className="tooltip-title">{label}</p>
        <div className="tooltip-item">
          <span className="tooltip-label">{mainEntry.name}:</span>
          <span className="tooltip-value" style={{ color: mainEntry.color }}>
            {formattedValue}
          </span>
        </div>
        {mainEntry.payload.total && (
          <div className="tooltip-item" style={{ marginTop: 8, borderTop: '1px solid var(--zinc-800)', paddingTop: 8 }}>
            <span className="tooltip-label" style={{ fontSize: 11 }}>Sample Size:</span>
            <span className="tooltip-value" style={{ fontSize: 11, color: 'var(--zinc-400)' }}>
              {mainEntry.payload.total} leads
            </span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

const AnalyticsView = ({ data }) => {
  const [platformMetric, setPlatformMetric] = useState('reply_rate');
  const [deviceMetric, setDeviceMetric] = useState('conv_rate');
  const [ageMetric, setAgeMetric] = useState('reply_rate');
  const [cityMetric, setCityMetric] = useState('conv_rate');

  if (!data) return <div className="loading-state">Initialising visual intelligence...</div>;

  const MetricSelector = ({ value, onChange }) => (
    <select className="metric-select" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="reply_rate">New → Engaged</option>
      <option value="call_rate">Engaged → Booked</option>
      <option value="conv_rate">Booked → Converted</option>
    </select>
  );

  const getMetricLabel = (m) => {
    if (m === 'reply_rate') return 'Reply Rate';
    if (m === 'call_rate') return 'Booking Rate';
    return 'Conversion Rate';
  };

  const getMetricColor = (m) => {
    if (m === 'reply_rate') return '#3b82f6';
    if (m === 'call_rate') return '#8b5cf6';
    return '#ec4899';
  };

  const getMetricDesc = (m) => {
    if (m === 'reply_rate') return 'Measures the percentage of new leads that successfully engaged in conversation.';
    if (m === 'call_rate') return 'Tracks how effectively engaged leads are transitioned into confirmed bookings.';
    return 'The ultimate efficiency benchmark: percentage of booked calls resulting in closed sales.';
  };

  return (
    <div className="analytics-grid">
      <div className="chart-card full-width">
        <div className="chart-header">
          <h2>Global Conversion Funnel</h2>
        </div>
        <p className="chart-description">High-fidelity visualization of lead volume decay through each stage of the sales pipeline.</p>
        <div style={{ height: 320, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.funnel} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
              <XAxis type="number" stroke="#71717a" hide />
              <YAxis dataKey="stage" type="category" stroke="#e4e4e7" width={140} fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46' }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={40}>
                <LabelList dataKey="count" position="right" fill="#94a3b8" fontSize={11} offset={10} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-header">
          <h2>Platform Efficiency</h2>
          <MetricSelector value={platformMetric} onChange={setPlatformMetric} />
        </div>
        <p className="chart-description">{getMetricDesc(platformMetric)}</p>
        <div style={{ height: 300, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.by_platform}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="name" stroke="#71717a" tickLine={false} axisLine={false} />
              <YAxis stroke="#71717a" tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey={platformMetric}
                name={getMetricLabel(platformMetric)}
                fill={getMetricColor(platformMetric)}
                radius={[4, 4, 0, 0]}
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-header">
          <h2>Device Segment Performance</h2>
          <MetricSelector value={deviceMetric} onChange={setDeviceMetric} />
        </div>
        <p className="chart-description">{getMetricDesc(deviceMetric)}</p>
        <div style={{ height: 300, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.by_device}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="name" stroke="#71717a" tickLine={false} axisLine={false} />
              <YAxis stroke="#71717a" tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey={deviceMetric}
                name={getMetricLabel(deviceMetric)}
                fill={getMetricColor(deviceMetric)}
                radius={[4, 4, 0, 0]}
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-header">
          <h2>Age Demographics Velocity</h2>
          <MetricSelector value={ageMetric} onChange={setAgeMetric} />
        </div>
        <p className="chart-description">{getMetricDesc(ageMetric)}</p>
        <div style={{ height: 300, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.by_age}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="name" stroke="#71717a" tickLine={false} axisLine={false} />
              <YAxis stroke="#71717a" tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey={ageMetric}
                name={getMetricLabel(ageMetric)}
                stroke={getMetricColor(ageMetric)}
                strokeWidth={4}
                dot={{ r: 6, fill: getMetricColor(ageMetric), strokeWidth: 2, stroke: '#18181b' }}
                activeDot={{ r: 8, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-header">
          <h2>Geographic Market Intelligence</h2>
          <MetricSelector value={cityMetric} onChange={setCityMetric} />
        </div>
        <p className="chart-description">Deep-dive analysis of conversion and engagement efficiency across the top 15 service markets.</p>
        <div style={{ height: 480, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.by_city} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
              <XAxis type="number" stroke="#71717a" tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} tickLine={false} axisLine={false} />
              <YAxis dataKey="name" type="category" stroke="#e4e4e7" width={110} fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey={cityMetric}
                name={getMetricLabel(cityMetric)}
                fill={getMetricColor(cityMetric)}
                radius={[0, 4, 4, 0]}
                barSize={18}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const LeadModal = ({ lead, onClose }) => {
  if (!lead) return null;

  // CRM-relevant attributes to display
  const allowedAttributes = {
    'platform': 'Platform',
    'utm_source': 'Source',
    'utm_campaign': 'Campaign',
    'lead_created_city': 'City',
    'device_type': 'Device',
    'operating_system': 'OS',
    'browser': 'Browser',
    'age': 'Age',
    'gender': 'Gender',
    'language': 'Language',
    'lead_created_at': 'Created At',
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Lead Details: #{lead.lead_id.split('-')[0].toUpperCase()}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <div className="section-title">Lead Performance</div>
          <div className="duration-stage" style={{ marginBottom: 24, background: 'var(--zinc-950)' }}>
            <span className="stage-name" style={{ color: 'var(--success)' }}>Current Status</span>
            <span className="status-badge" style={{ fontSize: 13, padding: '6px 14px' }}>{lead.status}</span>
          </div>

          {lead.icp_reasons?.length > 0 && (
            <>
              <div className="section-title">Winning Traits (ICP Match)</div>
              <div className="reason-pills">
                {lead.icp_reasons.map((reason, i) => (
                  <span key={i} className="reason-pill">{reason}</span>
                ))}
              </div>
            </>
          )}

          <div className="section-title">Status Duration Analysis</div>
          <div className="duration-list">
            {lead.status_durations?.new_to_engaged && (
              <div className="duration-stage">
                <span className="stage-name">New → Engaged</span>
                <span className="stage-time">{lead.status_durations.new_to_engaged}</span>
              </div>
            )}
            {lead.status_durations?.engaged_to_booked && (
              <div className="duration-stage">
                <span className="stage-name">Engaged → Booked</span>
                <span className="stage-time">{lead.status_durations.engaged_to_booked}</span>
              </div>
            )}
            {lead.status_durations?.booked_to_converted && (
              <div className="duration-stage">
                <span className="stage-name">Booked → Converted</span>
                <span className="stage-time">{lead.status_durations.booked_to_converted}</span>
              </div>
            )}
            {(!lead.status_durations || Object.keys(lead.status_durations).length === 0) && (
              <div className="loading-state" style={{ padding: 20, background: 'var(--zinc-950)', borderRadius: 12 }}>
                Initial lead phase (no transitions yet)
              </div>
            )}
          </div>

          <div className="section-title">CRM Contextual Data</div>
          <div className="info-grid">
            {Object.entries(allowedAttributes).map(([key, label]) => {
              const value = lead[key];
              return (
                <div key={key} className="info-item">
                  <span className="info-label">{label}</span>
                  <span className="info-value">{value?.toString() || 'N/A'}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [view, setView] = useState('leads'); // 'leads' or 'analytics'
  const [leads, setLeads] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, high: 0 });
  const [selectedLead, setSelectedLead] = useState(null);

  useEffect(() => {
    // Fetch Leads
    const fetchLeads = fetch('http://localhost:8000/api/leads').then(res => res.json());
    // Fetch Analytics
    const fetchAnalytics = fetch('http://localhost:8000/api/analytics').then(res => res.json());

    Promise.all([fetchLeads, fetchAnalytics])
      .then(([leadsData, analyticsData]) => {
        const fetchedLeads = leadsData.leads || [];
        setLeads(fetchedLeads);
        setAnalytics(analyticsData);

        const highProbCount = fetchedLeads.filter(l => l.conversion_probability > 0.7).length;
        setStats({ total: fetchedLeads.length, high: highProbCount });
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching data:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="app-container">
      <nav className="top-nav">
        <div className={`nav-link ${view === 'leads' ? 'active' : ''}`} onClick={() => setView('leads')}>
          Leads Pipeline
        </div>
        <div className={`nav-link ${view === 'analytics' ? 'active' : ''}`} onClick={() => setView('analytics')}>
          Funnel Insights
        </div>
      </nav>

      <header className="dashboard-header">
        <div className="header-meta">
          <h1>{view === 'leads' ? 'Lead Command Center' : 'Funnel Analytics'}</h1>
          <p>{view === 'leads' ? 'AI-Prioritized Conversion Pipeline' : 'Macro Performance & Behavioral Sentiment'}</p>
        </div>

        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Active Leads</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" style={{ color: 'var(--success)' }}>{stats.high}</span>
            <span className="stat-label">High Priority</span>
          </div>
        </div>
      </header>

      {view === 'leads' ? (
        <main className="leads-container">
          <div className="table-header">
            <span>Lead Identity</span>
            <span>Conversion Logic</span>
            <span>Current Stage</span>
            <span>Location</span>
            <span style={{ textAlign: 'right' }}>Age</span>
          </div>

          {loading ? (
            <div className="loading-state">Initialising secure lead connection...</div>
          ) : (
            <div className="leads-list">
              {leads.map((lead, index) => (
                <LeadRow
                  key={lead.lead_id}
                  lead={lead}
                  index={index}
                  onSelect={setSelectedLead}
                />
              ))}
            </div>
          )}
        </main>
      ) : (
        <AnalyticsView data={analytics} />
      )}

      {selectedLead && (
        <LeadModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </div>
  );
}

export default App;
