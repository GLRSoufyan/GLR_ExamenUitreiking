import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Header from '../components/Header';
import { students } from '../data/mockData';

export default function Yearbook() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return students;
    const q = query.toLowerCase();
    return students.filter(s =>
      s.naam.toLowerCase().includes(q) || s.klas.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <Layout>
      <Header showBack={false} />

      <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Search bar */}
        <div style={{
          display: 'flex',
          gap: 8,
          animation: 'fadeUp 0.4s ease both',
        }}>
          <input
            type="search"
            placeholder="zoek leerling op...."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ flex: 1 }}
          />
          <button
            style={{
              background: 'rgba(0,60,0,0.5)',
              border: '1.5px solid var(--green-border)',
              borderRadius: 8,
              width: 48, height: 48,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--green)',
              fontSize: 18,
              flexShrink: 0,
            }}
            aria-label="Zoeken"
          >
            🔍
          </button>
        </div>

        {/* Student cards */}
        {filtered.length === 0 ? (
          <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '40px 0' }}>
            Geen leerlingen gevonden voor "{query}"
          </p>
        ) : (
          filtered.map((student, i) => (
            <button
              key={student.id}
              onClick={() => navigate(`/jaarboek/${student.id}`)}
              className="card"
              style={{
                display: 'block',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                width: '100%',
                textAlign: 'left',
                animation: `fadeUp 0.4s ease ${i * 0.06}s both`,
              }}
            >
              <img
                src={student.foto}
                alt={student.naam}
                style={{
                  width: '100%',
                  height: 220,
                  objectFit: 'cover',
                  display: 'block',
                  filter: 'brightness(0.85)',
                }}
                loading="lazy"
              />
              <div style={{
                position: 'absolute',
                bottom: 0, left: 0, right: 0,
                background: 'rgba(0,20,0,0.75)',
                padding: '10px 16px',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--green)' }}>
                  {student.naam}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 500 }}>
                  {student.klas}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </Layout>
  );
}