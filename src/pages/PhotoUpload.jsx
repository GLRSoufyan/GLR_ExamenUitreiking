import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

export default function PhotoUpload() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const fileRef = useRef(null);

  const [preview, setPreview] = useState(null);
  const [titel, setTitel] = useState('');
  const [klas, setKlas] = useState('BEROEPS2');
  const [uploaded, setUploaded] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect non-admins
  if (!isAdmin) {
    return (
      <Layout>
        <Header showBack />
        <div style={{ padding: 32, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-dim)', fontSize: 16 }}>
            Geen toegang. Dit gedeelte is alleen voor admins.
          </p>
        </div>
      </Layout>
    );
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
    setUploaded(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
    setUploaded(false);
  }

  function handleSubmit() {
    if (!preview || !titel.trim()) return;
    setLoading(true);
    // Simulate upload (replace with real fetch to your PHP backend)
    setTimeout(() => {
      setLoading(false);
      setUploaded(true);
      setPreview(null);
      setTitel('');
    }, 1500);
  }

  return (
    <Layout>
      <Header
        showBack
        rightLabel="Bevestigen"
        rightAction={handleSubmit}
      />

      <div style={{ padding: '8px 16px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Upload zone */}
        <div
          className="card"
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          style={{
            minHeight: 220,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
            animation: 'fadeUp 0.4s ease both',
          }}
        >
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: 24 }}>
              <p style={{ fontSize: 48, marginBottom: 8 }}>📷</p>
              <p style={{ color: 'var(--text-dim)', fontSize: 15 }}>
                Tik om foto te selecteren<br />
                <span style={{ fontSize: 13 }}>of sleep een foto hierheen</span>
              </p>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>

        {/* Titel field */}
        <div style={{ animation: 'fadeUp 0.4s ease 0.1s both' }}>
          <label style={{ display: 'block', color: 'var(--green)', fontWeight: 600, marginBottom: 8, fontSize: 15 }}>
            Upload
          </label>
          <input
            type="text"
            placeholder="Titel"
            value={titel}
            onChange={(e) => setTitel(e.target.value)}
          />
        </div>

        {/* Klas selector */}
        <div style={{ animation: 'fadeUp 0.4s ease 0.15s both' }}>
          <label style={{ display: 'block', color: 'var(--green)', fontWeight: 600, marginBottom: 8, fontSize: 15 }}>
            Examenklas
          </label>
          <select
            value={klas}
            onChange={(e) => setKlas(e.target.value)}
            style={{
              background: 'rgba(0,60,0,0.4)',
              border: '1.5px solid var(--green-border)',
              borderRadius: 8,
              color: 'var(--green)',
              fontFamily: 'var(--font-main)',
              fontSize: 16,
              padding: '12px 16px',
              width: '100%',
              outline: 'none',
            }}
          >
            {['BEROEPS2', 'BEROEPS3', 'BEROEPS4', 'BEROEPS5'].map(k => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!preview || !titel.trim() || loading}
          className="btn btn-green"
          style={{
            animation: 'fadeUp 0.4s ease 0.2s both',
            opacity: (!preview || !titel.trim()) ? 0.5 : 1,
          }}
        >
          {loading ? 'Uploaden...' : "Foto Uploaden"}
        </button>

        {/* Success */}
        {uploaded && (
          <div style={{
            background: 'rgba(0,80,0,0.6)',
            border: '1.5px solid var(--green)',
            borderRadius: 12,
            padding: '16px',
            textAlign: 'center',
            animation: 'fadeUp 0.3s ease both',
          }}>
            <p style={{ fontWeight: 600 }}>✅ Foto succesvol geüpload!</p>
          </div>
        )}
      </div>
    </Layout>
  );
}