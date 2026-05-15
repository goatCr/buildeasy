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
      return (
        <p style={{ color: '#6b7280', lineHeight: '1.8' }}>
          No content added for this page yet.
        </p>
      )
    }

    const lines = content.split('\n').filter((line) => line.trim() !== '')
    const elements = []
    let listItems = []

    lines.forEach((line, index) => {
      if (line.startsWith('- ')) {
        listItems.push(
          <li
            key={`li-${index}`}
            style={{
              marginBottom: '0.5rem',
              color: '#374151',
              lineHeight: '1.8'
            }}
          >
            {line.replace('- ', '')}
          </li>
        )
        return
      }

      if (listItems.length > 0) {
        elements.push(
          <ul
            key={`ul-${index}`}
            style={{
              marginBottom: '1rem',
              paddingLeft: '1.5rem'
            }}
          >
            {listItems}
          </ul>
        )
        listItems = []
      }

      if (line.startsWith('# ')) {
        elements.push(
          <h1
            key={index}
            style={{
              fontSize: '2.4rem',
              fontWeight: 800,
              marginBottom: '1rem',
              color: '#111827',
              lineHeight: '1.2'
            }}
          >
            {line.replace('# ', '')}
          </h1>
        )
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2
            key={index}
            style={{
              fontSize: '1.6rem',
              fontWeight: 700,
              marginBottom: '0.8rem',
              color: '#1f2937',
              lineHeight: '1.3'
            }}
          >
            {line.replace('## ', '')}
          </h2>
        )
      } else {
        elements.push(
          <p
            key={index}
            style={{
              marginBottom: '1rem',
              color: '#374151',
              lineHeight: '1.8',
              fontSize: '1rem'
            }}
          >
            {line}
          </p>
        )
      }
    })

    if (listItems.length > 0) {
      elements.push(
        <ul
          key="ul-last"
          style={{
            marginBottom: '1rem',
            paddingLeft: '1.5rem'
          }}
        >
          {listItems}
        </ul>
      )
    }

    return elements
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ffffff',
          color: '#111827',
          fontFamily: 'Inter, sans-serif',
          fontSize: '1.1rem'
        }}
      >
        Loading site...
      </div>
    )
  }

  if (!project) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ffffff',
          color: '#111827',
          fontFamily: 'Inter, sans-serif',
          fontSize: '1.1rem',
          padding: '2rem',
          textAlign: 'center'
        }}
      >
        Site not found or not published.
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#ffffff',
        color: '#111827',
        fontFamily: project.font_family || 'Inter, sans-serif'
      }}
    >
      <header
        style={{
          borderBottom: '1px solid #e5e7eb',
          padding: '1rem 2rem',
          position: 'sticky',
          top: 0,
          background: '#ffffff',
          zIndex: 10
        }}
      >
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}
        >
          <Link
            to={`/site/${slug}`}
            style={{
              textDecoration: 'none',
              fontWeight: 800,
              fontSize: '1.25rem',
              color: project.theme_color || '#7c3aed'
            }}
          >
            {project.site_title || project.name}
          </Link>

          <nav
            style={{
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap'
            }}
          >
            {pages.map((page) => (
              <Link
                key={page.id}
                to={`/site/${slug}/${page.slug}`}
                style={{
                  textDecoration: 'none',
                  color:
                    currentPage?.slug === page.slug
                      ? project.theme_color || '#7c3aed'
                      : '#6b7280',
                  fontWeight: currentPage?.slug === page.slug ? 700 : 500,
                  padding: '0.4rem 0.2rem',
                  borderBottom:
                    currentPage?.slug === page.slug
                      ? `2px solid ${project.theme_color || '#7c3aed'}`
                      : '2px solid transparent'
                }}
              >
                {page.name}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '4rem 2rem'
        }}
      >
        <section style={{ marginBottom: '2.5rem' }}>
          <div
            style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: project.theme_color || '#7c3aed',
              marginBottom: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em'
            }}
          >
            /{currentPage?.slug || ''}
          </div>

          <h1
            style={{
              fontSize: '3rem',
              fontWeight: 800,
              marginBottom: '1rem',
              color: project.theme_color || '#7c3aed',
              lineHeight: '1.1'
            }}
          >
            {currentPage?.name || project.site_title || project.name}
          </h1>

          <p
            style={{
              fontSize: '1.05rem',
              color: '#6b7280',
              maxWidth: '700px',
              lineHeight: '1.8'
            }}
          >
            {project.site_description || project.description}
          </p>
        </section>

        <section
          style={{
            maxWidth: '760px'
          }}
        >
          {currentPage ? renderContent(currentPage.content) : (
            <p style={{ color: '#6b7280' }}>No page found.</p>
          )}
        </section>
      </main>
    </div>
  )
}

export default PublishedSite