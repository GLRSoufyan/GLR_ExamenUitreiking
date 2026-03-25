import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Header from '../components/Header';
import { students } from '../data/mockData';

export default function YearbookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const student = students.find(s => s.id === Number(id));

  if (!student) {
    return (
      <Layout>
        <Header showBack />
        <div style={{ padding: 32, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-dim)' }}>Leerling niet gevonden.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header showBack />

      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div
          className="card"
          style={{
            overflow: 'visible',
            animation: 'fadeUp 0.4s ease both',
          }}
        >
          {/* Name header */}
          <div style={{
            background: 'rgba(0,40,0,0.8)',
            borderBottom: '1.5px solid var(--green-border)',
            padding: '14px 18px',
            textAlign: 'center',
          }}>
            <h1 style={{ fontWeight: 700, fontSize: 22, color: 'var(--green)' }}>
              {student.naam}
            </h1>
            <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 2 }}>
              {student.klas}
            </p>
          </div>

          {/* Photo */}
          <img
            src={student.foto}
            alt={student.naam}
            style={{
              width: '100%',
              height: 320,
              objectFit: 'cover',
              objectPosition: 'top',
              display: 'block',
            }}
          />

          {/* Bio */}
          <div style={{
            background: 'rgba(0,30,0,0.7)',
            margin: 12,
            borderRadius: 10,
            border: '1px solid rgba(127,255,0,0.2)',
            padding: '16px',
          }}>
            <p style={{
              color: 'var(--green)',
              fontSize: 15,
              lineHeight: 1.65,
            }}>
              {student.bio}
            </p>
          </div>
        </div>

        {/* Back button */}
        <button
          onClick={() => navigate('/jaarboek')}
          className="btn btn-primary"
          style={{ animation: 'fadeUp 0.4s ease 0.1s both' }}
        >
          ← Terug naar Jaarboek
        </button>
      </div>
    </Layout>
  );
}