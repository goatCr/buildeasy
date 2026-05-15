import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from './supabase'

function Dashboard() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [user, setUser] = useState(null)
  const [projects, setProjects] = useState([])
  const [message, setMessage] = useState('')
  const [showModal, setShowModal] = useState(false)

  const [form, setForm] = useState({
    name: '',
    description: '',
  })

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    setLoading(true)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      navigate('/auth')
      return
    }

    setUser(user)

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setProjects(data)
    }

    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/auth')
  }

  function openModal() {
    setForm({ name: '', description: '' })
    setShowModal(true)
    setMessage('')
  }

  function closeModal() {
    setShowModal(false)
  }

  async function handleCreateProject(e) {
    e.preventDefault()

    if (!form.name.trim()) {
      setMessage('Project name is required.')
      return
    }

    setCreating(true)
    setMessage('')

    const payload = {
      user_id: user.id,
      name: form.name.trim(),
      description: form.description.trim(),
      theme_color: 'var(--accent)',
      font_family: 'IBM Plex Mono',
      site_title: form.name.trim(),
      site_description: form.description.trim(),
      custom_domain: '',
      published: false,
      publish_slug: '',
      visibility: 'private',
    }

    const { data, error } = await supabase
      .from('projects')
      .insert([payload])
      .select()
      .single()

    if (error || !data) {
      setMessage('Failed to create project.')
      setCreating(false)
      return
    }

    setProjects([data, ...projects])
    setCreating(false)
    setShowModal(false)
    navigate(`/project/${data.id}`)
  }

  async function handleDeleteProject(projectId) {
    const confirmed = window.confirm('Are you sure you want to delete this project?')
    if (!confirmed) return

    const { error } = await supabase.from('projects').delete().eq('id', projectId)

    if (error) {
      setMessage('Failed to delete project.')
      return
    }

    setProjects(projects.filter((project) => project.id !== projectId))
    setMessage('Project deleted successfully.')
  }

  const stats = useMemo(() => {
    const publishedCount = projects.filter((project) => project.published).length
    return {
      total: projects.length,
      published: publishedCount,
      drafts: projects.length - publishedCount,
    }
  }, [projects])

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
        Loading dashboard...
      </div>
    )
  }

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
          <span>BuildEasy</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>{user?.email}</span>
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-strong)',
              color: 'var(--text)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px 56px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
            alignItems: 'center',
            marginBottom: '28px',
          }}
        >
          <div>
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
              Workspace
            </div>
            <h1 style={{ fontSize: '2.4rem', margin: '0 0 8px', letterSpacing: '-0.03em' }}>
              Your projects
            </h1>
            <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: '1.7' }}>
              Create, manage, and publish from one clean dashboard.
            </p>
          </div>

          <button
            onClick={openModal}
            style={{
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
            + New Project
          </button>
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

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '28px',
          }}
        >
          {[
            { label: 'Total Projects', value: stats.total },
            { label: 'Published', value: stats.published },
            { label: 'Drafts', value: stats.drafts },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                background: 'var(--bg-glass)',
                border: '1px solid var(--border)',
                borderRadius: '20px',
                padding: '20px',
                boxShadow: 'var(--shadow-soft)',
              }}
            >
              <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{item.label}</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px' }}>{item.value}</div>
            </div>
          ))}
        </div>

        <section
          style={{
            background: 'var(--bg-glass)',
            border: '1px solid var(--border)',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: 'var(--shadow-soft)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <div>
              <h2 style={{ margin: '0 0 6px', fontSize: '1.35rem' }}>Recent projects</h2>
              <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: '1.7' }}>
                Open the editor, preview the live site, or start something new.
              </p>
            </div>

            <button
              onClick={openModal}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-strong)',
                color: 'var(--text)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Create Project
            </button>
          </div>

          {projects.length === 0 ? (
            <div
              style={{
                border: '1px dashed var(--border)',
                borderRadius: '20px',
                padding: '54px 24px',
                textAlign: 'center',
                background: 'var(--bg-elevated)',
              }}
            >
              <div style={{ fontSize: '2.6rem', marginBottom: '12px' }}>📂</div>
              <h3 style={{ margin: '0 0 10px' }}>No projects yet</h3>
              <p
                style={{
                  color: 'var(--text-muted)',
                  maxWidth: '520px',
                  margin: '0 auto 20px',
                  lineHeight: '1.8',
                }}
              >
                Create your first project to start editing pages, customizing the design, and publishing a live site.
              </p>
              <button
                onClick={openModal}
                style={{
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
                Create Your First Project
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
                gap: '18px',
              }}
            >
              {projects.map((project) => (
                <div
                  key={project.id}
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: '20px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '235px',
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '12px',
                        marginBottom: '16px',
                      }}
                    >
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '16px',
                          background: project.theme_color || 'var(--accent)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          color: 'var(--accent-contrast)',
                        }}
                      >
                        {(project.name || 'P').charAt(0).toUpperCase()}
                      </div>

                      <span
                        style={{
                          fontSize: '0.76rem',
                          padding: '6px 10px',
                          borderRadius: '999px',
                          background: project.published ? 'var(--success-bg)' : 'rgba(229,138,31,0.10)',
                          color: project.published ? 'var(--success-text)' : 'var(--accent-strong)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        {project.published ? 'Published' : 'Draft'}
                      </span>
                    </div>

                    <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem' }}>{project.name}</h3>
                    <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: '1.7' }}>
                      {project.description || 'No description added yet.'}
                    </p>
                  </div>

                  <div style={{ marginTop: '20px' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '14px' }}>
                      {project.publish_slug
                        ? `Public URL: /site/${project.publish_slug}`
                        : 'Not published yet'}
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <Link
                        to={`/project/${project.id}`}
                        style={{
                          background: 'var(--accent)',
                          color: 'var(--accent-contrast)',
                          padding: '11px 14px',
                          borderRadius: 'var(--radius-md)',
                          fontWeight: 700,
                          textDecoration: 'none',
                        }}
                      >
                        Open Editor
                      </Link>

                      {project.published && project.publish_slug ? (
                        <Link
                          to={`/site/${project.publish_slug}`}
                          style={{
                            background: 'transparent',
                            border: '1px solid var(--border-strong)',
                            color: 'var(--text)',
                            padding: '11px 14px',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: 600,
                            textDecoration: 'none',
                          }}
                        >
                          View Site
                        </Link>
                      ) : null}

                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        style={{
                          background: 'transparent',
                          border: '1px solid var(--error-border)',
                          color: 'var(--error-text)',
                          padding: '11px 14px',
                          borderRadius: 'var(--radius-md)',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {showModal && (
        <div
          onClick={closeModal}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 50,
            backdropFilter: 'blur(6px)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '540px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: '24px',
              padding: '24px',
            }}
          >
            <div style={{ marginBottom: '18px' }}>
              <h2 style={{ margin: '0 0 8px' }}>Create New Project</h2>
              <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: '1.7' }}>
                Start with a name and optional description.
              </p>
            </div>

            <form onSubmit={handleCreateProject}>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-soft)' }}>
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="My startup landing page"
                    style={{
                      width: '100%',
                      padding: '15px 16px',
                      background: 'var(--bg-soft)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text)',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-soft)' }}>
                    Description
                  </label>
                  <textarea
                    rows="4"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe what you want to build"
                    style={{
                      width: '100%',
                      padding: '15px 16px',
                      background: 'var(--bg-soft)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text)',
                      resize: 'vertical',
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  marginTop: '20px',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  flexWrap: 'wrap',
                }}
              >
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border-strong)',
                    color: 'var(--text)',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating}
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
                  {creating ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard