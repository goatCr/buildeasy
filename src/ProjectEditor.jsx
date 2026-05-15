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
    theme_color: '#7c3aed',
    font_family: 'Inter',
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
      theme_color: data.theme_color || '#7c3aed',
      font_family: data.font_family || 'Inter',
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

  async function handleSaveProject(customMessage = 'Project changes saved successfully!') {
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
        theme_color: data.theme_color || '#7c3aed',
        font_family: data.font_family || 'Inter',
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
    const updatedPages = [...pages, createdPage]

    setPages(updatedPages)
    setSelectedPage(createdPage)
    setPageContent(createdPage.content || '')
    setNewPageName('')
    setMessage('New page created successfully!')
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

    setMessage('Page deleted successfully!')
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
        page.id === selectedPage.id
          ? { ...page, content: pageContent }
          : page
      )

      setPages(updatedPages)
      setSelectedPage({ ...selectedPage, content: pageContent })
      setMessage('Page content saved successfully!')
    }

    setSavingPage(false)
  }

  function renderPreview(content) {
    if (!content || !content.trim()) {
      return (
        <p style={{ color: '#6b7280', lineHeight: '1.8' }}>
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
          <li key={`li-${index}`} style={{ marginBottom: '0.5rem', color: '#374151' }}>
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
          <h1 key={index} style={{ fontSize: '2rem', marginBottom: '1rem', color: '#111827' }}>
            {line.replace('# ', '')}
          </h1>
        )
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={index} style={{ fontSize: '1.4rem', marginBottom: '0.75rem', color: '#1f2937' }}>
            {line.replace('## ', '')}
          </h2>
        )
      } else {
        elements.push(
          <p key={index} style={{ marginBottom: '1rem', color: '#374151', lineHeight: '1.8' }}>
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
          background: '#0a0a0a',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, sans-serif'
        }}
      >
        Loading project editor...
      </div>
    )
  }

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    background: '#1a1a1a',
    border: '1px solid #2a2a2a',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '0.95rem',
    boxSizing: 'border-box',
  }

  const tabButton = (key, label) => (
    <button
      onClick={() => setActiveTab(key)}
      style={{
        background: activeTab === key ? projectForm.theme_color : 'transparent',
        color: activeTab === key ? '#fff' : '#999',
        border: activeTab === key ? `1px solid ${projectForm.theme_color}` : '1px solid #2a2a2a',
        padding: '10px 16px',
        borderRadius: '10px',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '0.9rem',
      }}
    >
      {label}
    </button>
  )

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        color: '#fff',
        fontFamily: projectForm.font_family || 'Inter, sans-serif'
      }}
    >
      <nav
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 2rem',
          height: '64px',
          borderBottom: '1px solid #1f1f1f',
          background: '#0d0d0d',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.2rem' }}>⚡</span>
          <span style={{ fontWeight: 700 }}>BuildEasy Editor</span>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'transparent',
            border: '1px solid #333',
            color: '#ccc',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          ← Back to Dashboard
        </button>
      </nav>

      <main style={{ maxWidth: '1360px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.9rem', marginBottom: '0.4rem' }}>
            {projectForm.name || 'Untitled Project'}
          </h1>
          <p style={{ color: '#777' }}>
            Manage content, style, publishing, and project settings in one place.
          </p>
        </div>

        {message && (
          <div
            style={{
              marginBottom: '1.25rem',
              padding: '12px 14px',
              borderRadius: '10px',
              background: message.includes('Failed') ? '#2a1010' : '#0f2a1a',
              border: message.includes('Failed') ? '1px solid #5a2020' : '1px solid #1a5a30',
              color: message.includes('Failed') ? '#ff6b6b' : '#7ee787',
            }}
          >
            {message}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {tabButton('overview', 'Overview')}
          {tabButton('pages', 'Pages')}
          {tabButton('design', 'Design')}
          {tabButton('settings', 'Settings')}
          {tabButton('publish', 'Publish')}
          {tabButton('analytics', 'Analytics')}
        </div>

        <div
          style={{
            background: '#111',
            border: '1px solid #1f1f1f',
            borderRadius: '20px',
            padding: '2rem',
          }}
        >
          {activeTab === 'overview' && (
            <div style={{ maxWidth: '760px' }}>
              <h2 style={{ marginBottom: '1rem' }}>Overview</h2>

              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#bbb' }}>
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
                  <label style={{ display: 'block', marginBottom: '8px', color: '#bbb' }}>
                    Description
                  </label>
                  <textarea
                    rows="5"
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ background: '#0d0d0d', padding: '1rem', borderRadius: '14px', border: '1px solid #1f1f1f', minWidth: '180px' }}>
                    <div style={{ color: '#777', fontSize: '0.85rem' }}>Status</div>
                    <div style={{ fontWeight: 700, marginTop: '0.25rem' }}>
                      {projectForm.published ? 'Published' : 'Draft'}
                    </div>
                  </div>

                  <div style={{ background: '#0d0d0d', padding: '1rem', borderRadius: '14px', border: '1px solid #1f1f1f', minWidth: '180px' }}>
                    <div style={{ color: '#777', fontSize: '0.85rem' }}>Visibility</div>
                    <div style={{ fontWeight: 700, marginTop: '0.25rem' }}>
                      {projectForm.visibility}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleSaveProject('Overview saved successfully!')}
                  disabled={savingProject}
                  style={{
                    background: projectForm.theme_color,
                    color: '#fff',
                    border: 'none',
                    padding: '14px 20px',
                    borderRadius: '10px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    width: 'fit-content',
                  }}
                >
                  {savingProject ? 'Saving...' : 'Save Overview'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'pages' && (
            <div>
              <h2 style={{ marginBottom: '1rem' }}>Pages</h2>
              <p style={{ color: '#888', marginBottom: '1.5rem' }}>
                Create and manage pages with live content preview.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '280px 1fr 1fr',
                  gap: '1.25rem'
                }}
              >
                <div
                  style={{
                    background: '#0d0d0d',
                    border: '1px solid #1f1f1f',
                    borderRadius: '16px',
                    padding: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    <input
                      type="text"
                      placeholder="New page name"
                      value={newPageName}
                      onChange={(e) => setNewPageName(e.target.value)}
                      style={{ ...inputStyle, padding: '10px 12px' }}
                    />
                    <button
                      onClick={handleAddPage}
                      style={{
                        background: projectForm.theme_color,
                        color: '#fff',
                        border: 'none',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      Add
                    </button>
                  </div>

                  {pagesLoading ? (
                    <p style={{ color: '#666' }}>Loading pages...</p>
                  ) : pages.length === 0 ? (
                    <p style={{ color: '#666' }}>No pages yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {pages.map((page) => (
                        <div
                          key={page.id}
                          onClick={() => {
                            setSelectedPage(page)
                            setPageContent(page.content || '')
                          }}
                          style={{
                            padding: '12px',
                            borderRadius: '12px',
                            border: selectedPage?.id === page.id
                              ? `1px solid ${projectForm.theme_color}`
                              : '1px solid #2a2a2a',
                            background: selectedPage?.id === page.id ? '#1a0a2e' : '#111',
                            cursor: 'pointer',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                            <div>
                              <div style={{ fontWeight: 600 }}>{page.name}</div>
                              <div style={{ fontSize: '0.8rem', color: '#777' }}>
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
                                color: '#777',
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
                    background: '#0d0d0d',
                    border: '1px solid #1f1f1f',
                    borderRadius: '16px',
                    padding: '1rem'
                  }}
                >
                  {selectedPage ? (
                    <>
                      <div style={{ marginBottom: '1rem' }}>
                        <h3 style={{ marginBottom: '0.25rem' }}>{selectedPage.name}</h3>
                        <p style={{ color: '#777', fontSize: '0.9rem' }}>
                          Use simple formatting:
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
                          marginBottom: '1rem',
                          background: '#111'
                        }}
                      />

                      <button
                        onClick={handleSavePage}
                        disabled={savingPage}
                        style={{
                          background: projectForm.theme_color,
                          color: '#fff',
                          border: 'none',
                          padding: '12px 18px',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          fontWeight: 600,
                        }}
                      >
                        {savingPage ? 'Saving...' : 'Save Page'}
                      </button>
                    </>
                  ) : (
                    <div style={{ color: '#666' }}>
                      Select a page from the left or create a new one.
                    </div>
                  )}
                </div>

                <div
                  style={{
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    minHeight: '520px',
                    overflow: 'auto'
                  }}
                >
                  <div
                    style={{
                      marginBottom: '1rem',
                      paddingBottom: '0.75rem',
                      borderBottom: '1px solid #e5e7eb'
                    }}
                  >
                    <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                      LIVE PREVIEW
                    </div>
                    <div style={{ fontWeight: 700, color: '#111827' }}>
                      {selectedPage ? selectedPage.name : 'No page selected'}
                    </div>
                  </div>

                  {renderPreview(pageContent)}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'design' && (
            <div style={{ maxWidth: '760px' }}>
              <h2 style={{ marginBottom: '1rem' }}>Design</h2>

              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#bbb' }}>
                    Theme Color
                  </label>
                  <input
                    type="color"
                    value={projectForm.theme_color}
                    onChange={(e) => setProjectForm({ ...projectForm, theme_color: e.target.value })}
                    style={{ width: '100px', height: '50px', background: 'transparent', border: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#bbb' }}>
                    Font Family
                  </label>
                  <select
                    value={projectForm.font_family}
                    onChange={(e) => setProjectForm({ ...projectForm, font_family: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="Inter">Inter</option>
                    <option value="Arial">Arial</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Poppins">Poppins</option>
                  </select>
                </div>

                <div
                  style={{
                    background: '#0d0d0d',
                    border: '1px solid #1f1f1f',
                    borderRadius: '16px',
                    padding: '1.5rem'
                  }}
                >
                  <div style={{ marginBottom: '1rem', fontWeight: 700 }}>
                    Design Preview
                  </div>

                  <button
                    style={{
                      background: projectForm.theme_color,
                      color: '#fff',
                      border: 'none',
                      padding: '12px 18px',
                      borderRadius: '10px',
                      fontWeight: 600,
                      fontFamily: projectForm.font_family,
                    }}
                  >
                    Sample Button
                  </button>

                  <p
                    style={{
                      marginTop: '1rem',
                      color: '#aaa',
                      fontFamily: projectForm.font_family
                    }}
                  >
                    This is how your project styling will appear on the published site.
                  </p>
                </div>

                <button
                  onClick={() => handleSaveProject('Design settings saved successfully!')}
                  disabled={savingProject}
                  style={{
                    background: projectForm.theme_color,
                    color: '#fff',
                    border: 'none',
                    padding: '14px 20px',
                    borderRadius: '10px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    width: 'fit-content',
                  }}
                >
                  {savingProject ? 'Saving...' : 'Save Design'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div style={{ maxWidth: '800px' }}>
              <h2 style={{ marginBottom: '1rem' }}>Settings</h2>

              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#bbb' }}>
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
                  <label style={{ display: 'block', marginBottom: '8px', color: '#bbb' }}>
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
                  <label style={{ display: 'block', marginBottom: '8px', color: '#bbb' }}>
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
                  <label style={{ display: 'block', marginBottom: '8px', color: '#bbb' }}>
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
                  onClick={() => handleSaveProject('Settings saved successfully!')}
                  disabled={savingProject}
                  style={{
                    background: projectForm.theme_color,
                    color: '#fff',
                    border: 'none',
                    padding: '14px 20px',
                    borderRadius: '10px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    width: 'fit-content',
                  }}
                >
                  {savingProject ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'publish' && (
            <div style={{ maxWidth: '800px' }}>
              <h2 style={{ marginBottom: '1rem' }}>Publish</h2>

              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#bbb' }}>
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

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={projectForm.published}
                    onChange={(e) => setProjectForm({ ...projectForm, published: e.target.checked })}
                  />
                  <span>Mark this project as published</span>
                </label>

                <div
                  style={{
                    background: '#0d0d0d',
                    border: '1px solid #1f1f1f',
                    borderRadius: '14px',
                    padding: '1rem'
                  }}
                >
                  <div style={{ color: '#777', fontSize: '0.85rem' }}>Public URL</div>
                  <div style={{ marginTop: '0.35rem', fontWeight: 700 }}>
                    {projectForm.publish_slug
                      ? `http://localhost:5173/site/${createSlug(projectForm.publish_slug)}`
                      : 'Set a publish slug first'}
                  </div>
                </div>

                <button
                  onClick={() => handleSaveProject('Publish settings saved successfully!')}
                  disabled={savingProject}
                  style={{
                    background: projectForm.theme_color,
                    color: '#fff',
                    border: 'none',
                    padding: '14px 20px',
                    borderRadius: '10px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    width: 'fit-content',
                  }}
                >
                  {savingProject ? 'Saving...' : 'Save Publish Settings'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div>
              <h2 style={{ marginBottom: '1rem' }}>Analytics</h2>
              <p style={{ color: '#888', marginBottom: '1.5rem' }}>
                This gives your project a simple analytics snapshot inside the editor workspace, which matches the common builder pattern of keeping content and metrics close together. [web:121][web:126]
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '1rem'
                }}
              >
                <div style={{ background: '#0d0d0d', border: '1px solid #1f1f1f', borderRadius: '16px', padding: '1rem' }}>
                  <div style={{ color: '#777', fontSize: '0.85rem' }}>Total Pages</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '0.3rem' }}>
                    {analytics.totalPages}
                  </div>
                </div>

                <div style={{ background: '#0d0d0d', border: '1px solid #1f1f1f', borderRadius: '16px', padding: '1rem' }}>
                  <div style={{ color: '#777', fontSize: '0.85rem' }}>Total Words</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '0.3rem' }}>
                    {analytics.totalWords}
                  </div>
                </div>

                <div style={{ background: '#0d0d0d', border: '1px solid #1f1f1f', borderRadius: '16px', padding: '1rem' }}>
                  <div style={{ color: '#777', fontSize: '0.85rem' }}>Estimated Visits</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '0.3rem' }}>
                    {analytics.estimatedVisits}
                  </div>
                </div>

                <div style={{ background: '#0d0d0d', border: '1px solid #1f1f1f', borderRadius: '16px', padding: '1rem' }}>
                  <div style={{ color: '#777', fontSize: '0.85rem' }}>Estimated Leads</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '0.3rem' }}>
                    {analytics.estimatedLeads}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default ProjectEditor