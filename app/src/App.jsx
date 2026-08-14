import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useParams, Navigate } from 'react-router-dom'
import { noticias } from './data/noticias'
import './App.css'

function Header() {
  return (
    <header className="header">
      <div className="container header-content">
        <Link to="/" className="brand">
          <span className="brand-mark">T</span>
          <div>
            <h1>TechPulse</h1>
            <p>Portal de Noticias Tecnológicas</p>
          </div>
        </Link>

        <nav className="nav">
          <Link to="/">Inicio</Link>
          <Link to="/noticias">Noticias</Link>
        </nav>
      </div>
    </header>
  )
}

function InstanceStatus() {
  const [instancia, setInstancia] = useState('Consultando...')

  useEffect(() => {
    fetch('/instancia', { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error('No disponible')
        return response.text()
      })
      .then((data) => setInstancia(data.trim().toUpperCase()))
      .catch(() => setInstancia('NO DISPONIBLE'))
  }, [])

  return (
    <div className="instance-status">
      <span className="instance-dot"></span>
      <div>
        <strong>Balanceador activo</strong>
        <p>
          Instancia que respondió: <b>{instancia}</b>
        </p>
      </div>
    </div>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div>
          <strong>TechPulse</strong>
          <p>Proyecto académico de Software Avanzado.</p>
        </div>

        <div className="footer-warning">
          <strong>Contenido asistido por IA</strong>
          <p>
            Las publicaciones fueron generadas o asistidas con ChatGPT y se presentan
            exclusivamente con fines académicos. No constituyen información periodística verificada.
          </p>
        </div>

        <InstanceStatus />
      </div>
    </footer>
  )
}

function NewsCard({ noticia }) {
  return (
    <article className="news-card">
      <img src={noticia.imagen} alt={noticia.titulo} />

      <div className="news-card-content">
        <div className="news-meta">
          <span>{noticia.categoria}</span>
          <time>{noticia.fecha}</time>
        </div>

        <h3>{noticia.titulo}</h3>
        <p>{noticia.resumen}</p>

        <Link className="read-more" to={`/noticias/${noticia.id}`}>
          Leer noticia
        </Link>
      </div>
    </article>
  )
}

function NewsList() {
  return (
    <section className="news-section" id="noticias">
      <div className="container">
        <div className="section-heading">
          <span>Actualidad tecnológica</span>
          <h2>Últimas noticias</h2>
          <p>
            Contenido académico sobre tecnología e innovación creado con asistencia
            de inteligencia artificial.
          </p>
        </div>

        <div className="news-grid">
          {noticias.map((noticia) => (
            <NewsCard key={noticia.id} noticia={noticia} />
          ))}
        </div>
      </div>
    </section>
  )
}

function Home() {
  return (
    <>
      <section className="hero">
        <div className="container hero-content">
          <span className="hero-badge">Proyecto académico</span>
          <h2>Noticias sobre tecnología e innovación</h2>
          <p>
            Portal informativo desarrollado con fines académicos. El contenido presentado
            ha sido generado o asistido mediante inteligencia artificial.
          </p>

          <Link className="hero-button" to="/noticias">
            Ver noticias
          </Link>
        </div>
      </section>

      <NewsList />
    </>
  )
}

function NoticiasPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span>TechPulse</span>
          <h2>Noticias</h2>
          <p>Explora las publicaciones disponibles en nuestro portal académico de tecnología.</p>
        </div>
      </section>

      <NewsList />
    </>
  )
}

function NewsDetail() {
  const { id } = useParams()
  const noticia = noticias.find((item) => item.id === Number(id))

  if (!noticia) return <Navigate to="/noticias" replace />

  return (
    <main className="detail-page">
      <div className="container detail-container">
        <Link className="back-link" to="/noticias">
          ← Volver a noticias
        </Link>

        <article className="detail-article">
          <div className="detail-meta">
            <span>{noticia.categoria}</span>
            <time>{noticia.fecha}</time>
          </div>

          <h2>{noticia.titulo}</h2>
          <p className="detail-summary">{noticia.resumen}</p>

          <img className="detail-image" src={noticia.imagen} alt={noticia.titulo} />

          <div className="detail-content">
            {noticia.contenido.map((parrafo, index) => (
              <p key={index}>{parrafo}</p>
            ))}
          </div>

          <aside className="ai-source">
            <div className="ai-icon">AI</div>
            <div>
              <strong>Fuente del texto</strong>
              <p>{noticia.fuente}</p>
            </div>
          </aside>
        </article>
      </div>
    </main>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Header />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/noticias" element={<NoticiasPage />} />
          <Route path="/noticias/:id" element={<NewsDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App