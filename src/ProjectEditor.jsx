import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from './supabase'

function ProjectEditor() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [pagesLoading, setPagesLoading] = useState(false)
  const [savingProject, setSavingProject] = useState(false)
  const [savingPage, setSavingPage] = useState(false)
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  const [project, setProject] = useState(null)
  const [pages, setPages] = useState([])
  const [selectedPage, setSelectedPage] = useState(null)
  const [newPageName, setNewPageName] = useState('')
  const [pageContent, setPageContent] = useState('')

  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    theme_color: '#e58a1f',
    font_family: 'IBM Plex Mono',
    site_title: '',
    site_description: '',
    custom_domain: '',
    published: false,
    publish_slug: '',
    visibility: 'private',
  })

  useEffect(() => {
    fetchProject()
    fetchPages()
  }, [id])

  async function fetchProject() {
    setLoading(true)

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      navigate('/dashboard')
      return
    }

    setProject(data)
    setProjectForm({
      name: data.name || '',
      description: data.description || '',
      theme_color: data.theme_color || '#e58a1f',
      font_family: data.font_family || 'IBM Plex Mono',
      site_title: data.site_title || '',
      site_description: data.site_description || '',
      custom_domain: data.custom_domain || '',
      published: data.published || false,
      publish_slug: data.publish_slug || '',
      visibility: data.visibility || 'private',
    })

    setLoading(false)
  }

  async function fetchPages() {
    setPagesLoading(true)

    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('project_id', id)
      .order('created_at', { ascending: true })

    if (!error && data) {
      setPages(data)

      if (data.length > 0) {
        setSelectedPage(data[0])
        setPageContent(data[0].content || '')
      } else {
        setSelectedPage(null)
        setPageContent('')
      }
    }

    setPagesLoading(false)
  }

  function createSlug(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
  }

  async function handleSaveProject(customMessage = 'Project updated successfully.') {
    setSavingProject(true)
    setMessage('')

    const payload = {
      name: projectForm.name,
      description: projectForm.description,
      theme_color: projectForm.theme_color,
      font_family: projectForm.font_family,
      site_title: projectForm.site_title,
      site_description: projectForm.site_description,
      custom_domain: projectForm.custom_domain,
      published: projectForm.published,
      publish_slug: createSlug(projectForm.publish_slug),
      visibility: projectForm.visibility,
    }

    const { data, error } = await supabase
      .from('projects')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      setMessage('Failed to save project changes.')
    } else {
      setProject(data)
      setProjectForm({
        name: data.name || '',
        description: data.description || '',
        theme_color: data.theme_color || '#e58a1f',
        font_family: data.font_family || 'IBM Plex Mono',
        site_title: data.site_title || '',
        site_description: data.site_description || '',
        custom_domain: data.custom_domain || '',
        published: data.published || false,
        publish_slug: data.publish_slug || '',
        visibility: data.visibility || 'private',
      })
      setMessage(customMessage)
    }

    setSavingProject(false)
  }

  async function handleAddPage() {
    if (!newPageName.trim()) return

    const pageData = {
      project_id: id,
      name: newPageName.trim(),
      slug: createSlug(newPageName),
      content: '',
    }

    const { data, error } = await supabase
      .from('pages')
      .insert([pageData])
      .select()

    if (error || !data) {
      setMessage('Failed to create page.')
      return
    }

    const createdPage = data[0]
    setPages([...pages, createdPage])
    setSelectedPage(createdPage)
    setPageContent(createdPage.content || '')
    setNewPageName('')
    setMessage('New page created successfully.')
  }

  async function handleDeletePage(pageId) {
    const { error } = await supabase
      .from('pages')
      .delete()
      .eq('id', pageId)

    if (error) {
      setMessage('Failed to delete page.')
      return
    }

    const updatedPages = pages.filter((page) => page.id !== pageId)
    setPages(updatedPages)

    if (selectedPage?.id === pageId) {
      if (updatedPages.length > 0) {
        setSelectedPage(updatedPages[0])
        setPageContent(updatedPages[0].content || '')
      } else {
        setSelectedPage(null)
        setPageContent('')
      }
    }

    setMessage('Page deleted successfully.')
  }

  async function handleSavePage() {
    if (!selectedPage) return

    setSavingPage(true)
    setMessage('')

    const { error } = await supabase
      .from('pages')
      .update({ content: pageContent })
      .eq('id', selectedPage.id)

    if (error) {
      setMessage('Failed to save page content.')
    } else {
      const updatedPages = pages.map((page) =>
        page.id === selectedPage.id ? { ...page, content: pageContent } : page
      )
      setPages(updatedPages)
      setSelectedPage({ ...selectedPage, content: pageContent })
      setMessage('Page content saved successfully.')
    }

    setSavingPage(false)
  }

  function renderPreview(content) {
    if (!content || !content.trim()) {
      return (
        <p style={{ color: 'var(--text-muted)', lineHeight: '1.8' }}>
          Start typing content to see live preview here.
        </p>
      )
    }

    const lines = content.split('\n').filter((line) => line.trim() !== '')
    const elements = []
    let listItems = []

    lines.forEach((line, index) => {
      if (line.startsWith('- ')) {
        listItems.push(
          <li key={`li-${index}`} style={{ marginBottom: '0.5rem', color: '#33413e' }}>
            {line.replace('- ', '')}
          </li>
        )
        return
      }

      if (listItems.length > 0) {
        elements.push(
          <ul key={`ul-${index}`} style={{ marginBottom: '1rem', paddingLeft: '1.4rem' }}>
            {listItems}
          </ul>
        )
        listItems = []
      }

      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={index} style={{ fontSize: '2rem', marginBottom: '1rem', color: '#122220' }}>
            {line.replace('# ', '')}
          </h1>
        )
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={index} style={{ fontSize: '1.4rem', marginBottom: '0.75rem', color: '#1d302d' }}>
            {line.replace('## ', '')}
          </h2>
        )
      } else {
        elements.push(
          <p key={index} style={{ marginBottom: '1rem', color: '#33413e', lineHeight: '1.8' }}>
            {line}
          </p>
        )
      }
    })

    if (listItems.length > 0) {
      elements.push(
        <ul key="ul-last" style={{ marginBottom: '1rem', paddingLeft: '1.4rem' }}>
          {listItems}
        </ul>
      )
    }

    return elements
  }

  const analytics = useMemo(() => {
    const totalWords = pages.reduce((sum, page) => {
      const count = (page.content || '').trim().split(/\s+/).filter(Boolean).length
      return sum + count
    }, 0)

    return {
      totalPages: pages.length,
      totalWords,
      estimatedVisits: pages.length * 125 + 320,
      estimatedLeads: Math.max(1, Math.floor((pages.length * 125 + 320) * 0.03)),
    }
  }, [pages])

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--bg)',
          color: 'var(--text)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-sans)',
        }}
      >
        Loading editor...
      </div>
    )
  }

  const panel = {
    background: 'var(--bg-glass)',
    border: '1px solid var(--border)',
    borderRadius: '24px',
    padding: '24px',
    boxShadow: 'var(--shadow-soft)',
  }

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    background: 'var(--bg-soft)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text)',
    fontSize: '0.95rem',
    boxSizing: 'border-box',
  }

  const tabButton = (key, label) => (
    <button
      onClick={() => setActiveTab(key)}
      style={{
        background: activeTab === key ? 'var(--accent)' : 'transparent',
        color: activeTab === key ? 'var(--accent-contrast)' : 'var(--text-muted)',
        border: activeTab === key
          ? '1px solid var(--accent)'
          : '1px solid var(--border)',
        padding: '11px 16px',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '0.92rem',
      }}
    >
      {label}
    </button>
  )

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--hero-bg)',
        color: 'var(--text)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <nav
        style={{
          height: '72px',
          borderBottom: '1px solid var(--border-strong)',
          background: 'rgba(18, 34, 32, 0.86)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px',
          position: 'sticky',
          top: 0,
          zIndex: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 800 }}>
          <span style={{ fontSize: '1.2rem', color: 'var(--accent)' }}>⚡</span>
          <span>BuildEasy Editor</span>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'transparent',
            border: '1px solid var(--border-strong)',
            color: 'var(--text)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
          }}
        >
          ← Dashboard
        </button>
      </nav>

      <main style={{ maxWidth: '1360px', margin: '0 auto', padding: '32px 24px 56px' }}>
        <div style={{ marginBottom: '24px' }}>
          <div
            style={{
              color: 'var(--accent)',
              textTransform: 'uppercase',
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              marginBottom: '8px',
            }}
          >
            Project workspace
          </div>
          <h1 style={{ fontSize: '2.3rem', margin: '0 0 8px', letterSpacing: '-0.03em' }}>
            {projectForm.name || 'Untitled Project'}
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: '1.7' }}>
            Edit content, adjust styles, manage settings, and publish from one place.
          </p>
        </div>

        {message && (
          <div
            style={{
              marginBottom: '18px',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              background: message.toLowerCase().includes('failed')
                ? 'var(--error-bg)'
                : 'var(--success-bg)',
              border: message.toLowerCase().includes('failed')
                ? '1px solid var(--error-border)'
                : '1px solid var(--success-border)',
              color: message.toLowerCase().includes('failed')
                ? 'var(--error-text)'
                : 'var(--success-text)',
            }}
          >
            {message}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {tabButton('overview', 'Overview')}
          {tabButton('pages', 'Pages')}
          {tabButton('design', 'Design')}
          {tabButton('settings', 'Settings')}
          {tabButton('publish', 'Publish')}
          {tabButton('analytics', 'Analytics')}
        </div>

        {activeTab === 'overview' && (
          <div style={panel}>
            <div style={{ maxWidth: '760px', display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-soft)' }}>
                  Project Name
                </label>
                <input
                  type="text"
                  value={projectForm.name}
                  onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-soft)' }}>
                  Description
                </label>
                <textarea
                  rows="5"
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div
                  style={{
                    background: 'var(--bg-elevated)',
                    padding: '18px',
                    borderRadius: '18px',
                    border: '1px solid var(--border)',
                    minWidth: '180px',
                  }}
                >
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Status</div>
                  <div style={{ fontWeight: 800, marginTop: '6px' }}>
                    {projectForm.published ? 'Published' : 'Draft'}
                  </div>
                </div>

                <div
                  style={{
                    background: 'var(--bg-elevated)',
                    padding: '18px',
                    borderRadius: '18px',
                    border: '1px solid var(--border)',
                    minWidth: '180px',
                  }}
                >
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Visibility</div>
                  <div style={{ fontWeight: 800, marginTop: '6px' }}>{projectForm.visibility}</div>
                </div>
              </div>

              <button
                onClick={() => handleSaveProject('Overview saved successfully.')}
                disabled={savingProject}
                style={{
                  width: 'fit-content',
                  background: 'var(--accent)',
                  color: 'var(--accent-contrast)',
                  border: 'none',
                  padding: '14px 18px',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  boxShadow: 'var(--shadow-accent)',
                }}
              >
                {savingProject ? 'Saving...' : 'Save Overview'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'pages' && (
          <div style={panel}>
            <div style={{ marginBottom: '18px' }}>
              <h2 style={{ margin: '0 0 8px' }}>Pages</h2>
              <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: '1.7' }}>
                Manage pages and preview content live while editing.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 1fr', gap: '18px' }}>
              <div
                style={{
                  background: 'var(--bg-elevated)',
                  borderRadius: '20px',
                  border: '1px solid var(--border)',
                  padding: '18px',
                }}
              >
                <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                  <input
                    type="text"
                    placeholder="New page name"
                    value={newPageName}
                    onChange={(e) => setNewPageName(e.target.value)}
                    style={{ ...inputStyle, padding: '12px 14px' }}
                  />
                  <button
                    onClick={handleAddPage}
                    style={{
                      background: 'var(--accent)',
                      color: 'var(--accent-contrast)',
                      border: 'none',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      fontWeight: 700,
                    }}
                  >
                    Add
                  </button>
                </div>

                {pagesLoading ? (
                  <p style={{ color: 'var(--text-muted)' }}>Loading pages...</p>
                ) : pages.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)' }}>No pages yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {pages.map((page) => (
                      <div
                        key={page.id}
                        onClick={() => {
                          setSelectedPage(page)
                          setPageContent(page.content || '')
                        }}
                        style={{
                          padding: '14px',
                          borderRadius: '14px',
                          border:
                            selectedPage?.id === page.id
                              ? '1px solid var(--accent)'
                              : '1px solid var(--border)',
                          background:
                            selectedPage?.id === page.id
                              ? 'rgba(229, 138, 31, 0.10)'
                              : 'var(--bg-soft)',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                          <div>
                            <div style={{ fontWeight: 700 }}>{page.name}</div>
                            <div
                              style={{
                                fontSize: '0.82rem',
                                color: 'var(--text-muted)',
                                marginTop: '4px',
                              }}
                            >
                              /{page.slug}
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeletePage(page.id)
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div
                style={{
                  background: 'var(--bg-elevated)',
                  borderRadius: '20px',
                  border: '1px solid var(--border)',
                  padding: '18px',
                }}
              >
                {selectedPage ? (
                  <>
                    <div style={{ marginBottom: '14px' }}>
                      <h3 style={{ margin: '0 0 6px' }}>{selectedPage.name}</h3>
                      <p
                        style={{
                          color: 'var(--text-muted)',
                          fontSize: '0.92rem',
                          lineHeight: '1.7',
                          margin: 0,
                        }}
                      >
                        Use:
                        <br /># Heading
                        <br />## Subheading
                        <br />- Bullet item
                      </p>
                    </div>

                    <textarea
                      value={pageContent}
                      onChange={(e) => setPageContent(e.target.value)}
                      placeholder="Write your page content here..."
                      rows={18}
                      style={{
                        ...inputStyle,
                        resize: 'vertical',
                        marginBottom: '14px',
                      }}
                    />

                    <button
                      onClick={handleSavePage}
                      disabled={savingPage}
                      style={{
                        background: 'var(--accent)',
                        color: 'var(--accent-contrast)',
                        border: 'none',
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        fontWeight: 700,
                        boxShadow: 'var(--shadow-accent)',
                      }}
                    >
                      {savingPage ? 'Saving...' : 'Save Page'}
                    </button>
                  </>
                ) : (
                  <div style={{ color: 'var(--text-muted)' }}>Select a page or create a new one.</div>
                )}
              </div>

              <div
                style={{
                  background: '#f4efe6',
                  borderRadius: '20px',
                  border: '1px solid #d7c7ae',
                  padding: '20px',
                  minHeight: '520px',
                  overflow: 'auto',
                }}
              >
                <div
                  style={{
                    marginBottom: '14px',
                    paddingBottom: '12px',
                    borderBottom: '1px solid #d9cdbd',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.8rem',
                      color: '#7d776d',
                      marginBottom: '4px',
                      fontWeight: 700,
                    }}
                  >
                    LIVE PREVIEW
                  </div>
                  <div style={{ fontWeight: 800, color: '#122220' }}>
                    {selectedPage ? selectedPage.name : 'No page selected'}
                  </div>
                </div>

                {renderPreview(pageContent)}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'design' && (
          <div style={panel}>
            <div style={{ maxWidth: '760px', display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-soft)' }}>
                  Theme Color
                </label>
                <input
                  type="color"
                  value={projectForm.theme_color}
                  onChange={(e) => setProjectForm({ ...projectForm, theme_color: e.target.value })}
                  style={{ width: '100px', height: '52px', background: 'transparent', border: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-soft)' }}>
                  Font Family
                </label>
                <select
                  value={projectForm.font_family}
                  onChange={(e) => setProjectForm({ ...projectForm, font_family: e.target.value })}
                  style={inputStyle}
                >
                  <option value="IBM Plex Mono">IBM Plex Mono</option>
                  <option value="Courier New">Courier New</option>
                  <option value="monospace">Monospace</option>
                  <option value="Inter">Inter</option>
                </select>
              </div>

              <div
                style={{
                  background: 'var(--bg-elevated)',
                  borderRadius: '20px',
                  border: '1px solid var(--border)',
                  padding: '20px',
                }}
              >
                <div style={{ marginBottom: '12px', fontWeight: 800 }}>Design Preview</div>
                <button
                  style={{
                    background: projectForm.theme_color,
                    color: 'var(--accent-contrast)',
                    border: 'none',
                    padding: '12px 18px',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 700,
                    fontFamily: projectForm.font_family,
                  }}
                >
                  Sample Button
                </button>
                <p
                  style={{
                    marginTop: '14px',
                    color: 'var(--text-muted)',
                    lineHeight: '1.7',
                    fontFamily: projectForm.font_family,
                  }}
                >
                  This is how your selected color and font will feel on the published site.
                </p>
              </div>

              <button
                onClick={() => handleSaveProject('Design settings saved successfully.')}
                disabled={savingProject}
                style={{
                  width: 'fit-content',
                  background: 'var(--accent)',
                  color: 'var(--accent-contrast)',
                  border: 'none',
                  padding: '14px 18px',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  boxShadow: 'var(--shadow-accent)',
                }}
              >
                {savingProject ? 'Saving...' : 'Save Design'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div style={panel}>
            <div style={{ maxWidth: '800px', display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-soft)' }}>
                  Site Title
                </label>
                <input
                  type="text"
                  value={projectForm.site_title}
                  onChange={(e) => setProjectForm({ ...projectForm, site_title: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-soft)' }}>
                  Site Description
                </label>
                <textarea
                  rows="4"
                  value={projectForm.site_description}
                  onChange={(e) => setProjectForm({ ...projectForm, site_description: e.target.value })}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-soft)' }}>
                  Custom Domain
                </label>
                <input
                  type="text"
                  placeholder="www.example.com"
                  value={projectForm.custom_domain}
                  onChange={(e) => setProjectForm({ ...projectForm, custom_domain: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-soft)' }}>
                  Visibility
                </label>
                <select
                  value={projectForm.visibility}
                  onChange={(e) => setProjectForm({ ...projectForm, visibility: e.target.value })}
                  style={inputStyle}
                >
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>
              </div>

              <button
                onClick={() => handleSaveProject('Settings saved successfully.')}
                disabled={savingProject}
                style={{
                  width: 'fit-content',
                  background: 'var(--accent)',
                  color: 'var(--accent-contrast)',
                  border: 'none',
                  padding: '14px 18px',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  boxShadow: 'var(--shadow-accent)',
                }}
              >
                {savingProject ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'publish' && (
          <div style={panel}>
            <div style={{ maxWidth: '800px', display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-soft)' }}>
                  Publish Slug
                </label>
                <input
                  type="text"
                  placeholder="my-project"
                  value={projectForm.publish_slug}
                  onChange={(e) => setProjectForm({ ...projectForm, publish_slug: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  color: 'var(--text)',
                }}
              >
                <input
                  type="checkbox"
                  checked={projectForm.published}
                  onChange={(e) => setProjectForm({ ...projectForm, published: e.target.checked })}
                />
                <span>Mark this project as published</span>
              </label>

              <div
                style={{
                  background: 'var(--bg-elevated)',
                  borderRadius: '18px',
                  border: '1px solid var(--border)',
                  padding: '18px',
                }}
              >
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Public URL</div>
                <div style={{ marginTop: '8px', fontWeight: 800, color: 'var(--text)' }}>
                  {projectForm.publish_slug
                    ? `http://localhost:5173/site/${createSlug(projectForm.publish_slug)}`
                    : 'Set a publish slug first'}
                </div>
              </div>

              <button
                onClick={() => handleSaveProject('Publish settings saved successfully.')}
                disabled={savingProject}
                style={{
                  width: 'fit-content',
                  background: 'var(--accent)',
                  color: 'var(--accent-contrast)',
                  border: 'none',
                  padding: '14px 18px',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  boxShadow: 'var(--shadow-accent)',
                }}
              >
                {savingProject ? 'Saving...' : 'Save Publish Settings'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div style={panel}>
            <div style={{ marginBottom: '18px' }}>
              <h2 style={{ margin: '0 0 8px' }}>Analytics</h2>
              <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: '1.7' }}>
                A simple snapshot of your current project activity.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px',
              }}
            >
              {[
                { label: 'Total Pages', value: analytics.totalPages },
                { label: 'Total Words', value: analytics.totalWords },
                { label: 'Estimated Visits', value: analytics.estimatedVisits },
                { label: 'Estimated Leads', value: analytics.estimatedLeads },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: '20px',
                    padding: '20px',
                  }}
                >
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{item.label}</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px' }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default ProjectEditor