import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from './supabase'

function PublishedSite() {
  const { slug, pageSlug } = useParams()

  const [project, setProject] = useState(null)
  const [pages, setPages] = useState([])
  const [currentPage, setCurrentPage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPublishedSite()
  }, [slug, pageSlug])

  async function fetchPublishedSite() {
    setLoading(true)

    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('publish_slug', slug)
      .eq('published', true)
      .single()

    if (projectError || !projectData) {
      setProject(null)
      setPages([])
      setCurrentPage(null)
      setLoading(false)
      return
    }

    setProject(projectData)

    const { data: pagesData, error: pagesError } = await supabase
      .from('pages')
      .select('*')
      .eq('project_id', projectData.id)
      .order('created_at', { ascending: true })

    if (pagesError || !pagesData || pagesData.length === 0) {
      setPages([])
      setCurrentPage(null)
      setLoading(false)
      return
    }

    setPages(pagesData)

    let selectedPage = null

    if (pageSlug) {
      selectedPage = pagesData.find((page) => page.slug === pageSlug)
    }

    if (!selectedPage) {
      selectedPage = pagesData[0]
    }

    setCurrentPage(selectedPage)
    setLoading(false)
  }

  function renderContent(content) {
    if (!content || !content.trim()) {
      return <p style={{ color: '#6b7280', lineHeight: '1.8' }}>No content added for this page yet.</p>
    }

    const lines = content.split('\n').filter((line) => line.trim() !== '')
    const elements = []
    let listItems = []

    lines.forEach((line, index) => {
      if (line.startsWith('- ')) {
        listItems.push(
          <li key={`li-${index}`} style={{ marginBottom: '0.55rem', color: '#475569', lineHeight: '1.8' }}>
            {line.replace('- ', '')}
          </li>
        )
        return
      }

      if (listItems.length > 0) {
        elements.push(
          <ul key={`ul-${index}`} style={{ marginBottom: '1rem', paddingLeft: '1.5rem' }}>
            {listItems}
          </ul>
        )
        listItems = []
      }

      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={index} style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '1rem', color: '#0f172a', lineHeight: '1.15' }}>
            {line.replace('# ', '')}
          </h1>
        )
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={index} style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.8rem', color: '#1e293b' }}>
            {line.replace('## ', '')}
          </h2>
        )
      } else {
        elements.push(
          <p key={index} style={{ marginBottom: '1rem', color: '#475569', lineHeight: '1.9', fontSize: '1rem' }}>
            {line}
          </p>
        )
      }
    })

    if (listItems.length > 0) {
      elements.push(
        <ul key="ul-last" style={{ marginBottom: '1rem', paddingLeft: '1.5rem' }}>
          {listItems}
        </ul>
      )
    }

    return elements
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff', color: '#0f172a', fontFamily: 'Inter, sans-serif' }}>
        Loading site...
      </div>
    )
  }

  if (!project) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff', color: '#0f172a', fontFamily: 'Inter, sans-serif', padding: '2rem', textAlign: 'center' }}>
        Site not found or not published.
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', color: '#0f172a', fontFamily: project.font_family || 'Inter, sans-serif' }}>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          borderBottom: '1px solid #e5e7eb',
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(14px)',
        }}
      >
        <div
          style={{
            maxWidth: '1120px',
            margin: '0 auto',
            padding: '18px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <Link
            to={`/site/${slug}`}
            style={{
              textDecoration: 'none',
              fontWeight: 800,
              fontSize: '1.25rem',
              color: project.theme_color || '#7c3aed',
            }}
          >
            {project.site_title || project.name}
          </Link>

          <nav style={{ display: 'flex', gap: '18px', flexWrap: 'wrap' }}>
            {pages.map((page) => (
              <Link
                key={page.id}
                to={`/site/${slug}/${page.slug}`}
                style={{
                  textDecoration: 'none',
                  color: currentPage?.slug === page.slug ? project.theme_color || '#7c3aed' : '#64748b',
                  fontWeight: currentPage?.slug === page.slug ? 700 : 500,
                  paddingBottom: '4px',
                  borderBottom:
                    currentPage?.slug === page.slug
                      ? `2px solid ${project.theme_color || '#7c3aed'}`
                      : '2px solid transparent',
                }}
              >
                {page.name}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main>
        <section
          style={{
            padding: '88px 24px 52px',
            background:
              'radial-gradient(circle at top left, rgba(124,58,237,0.12), transparent 24%), #ffffff',
          }}
        >
          <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
            <div
              style={{
                display: 'inline-block',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: project.theme_color || '#7c3aed',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '16px',
              }}
            >
              /{currentPage?.slug || ''}
            </div>

            <h1
              style={{
                fontSize: 'clamp(2.7rem, 6vw, 4.8rem)',
                lineHeight: '1.02',
                margin: '0 0 16px',
                letterSpacing: '-0.04em',
                color: '#0f172a',
                maxWidth: '820px',
              }}
            >
              {currentPage?.name || project.site_title || project.name}
            </h1>

            <p
              style={{
                maxWidth: '740px',
                color: '#64748b',
                lineHeight: '1.9',
                fontSize: '1.05rem',
                margin: 0,
              }}
            >
              {project.site_description || project.description}
            </p>
          </div>
        </section>

        <section style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 24px 80px' }}>
          <div
            style={{
              maxWidth: '760px',
              background: '#ffffff',
              border: '1px solid #edf2f7',
              borderRadius: '24px',
              padding: '32px',
              boxShadow: '0 18px 40px rgba(15,23,42,0.04)',
            }}
          >
            {currentPage ? renderContent(currentPage.content) : <p style={{ color: '#64748b' }}>No page found.</p>}
          </div>
        </section>
      </main>
    </div>
  )
}

export default PublishedSite