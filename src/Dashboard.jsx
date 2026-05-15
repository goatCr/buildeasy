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
      theme_color: '#7c3aed',
      font_family: 'Inter',
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
    setMessage('Project created successfully!')
    navigate(`/project/${data.id}`)
  }

  async function handleDeleteProject(projectId) {
    const confirmed = window.confirm('Are you sure you want to delete this project?')

    if (!confirmed) return

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)

    if (error) {
      setMessage('Failed to delete project.')
      return
    }

    setProjects(projects.filter((project) => project.id !== projectId))
    setMessage('Project deleted successfully!')
  }

  const stats = useMemo(() => {
    const publishedCount = projects.filter((project) => project.published).length
    const draftCount = projects.length - publishedCount

    return {
      total: projects.length,
      published: publishedCount,
      drafts: draftCount,
    }
  }, [projects])

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
          fontFamily: 'Inter, sans-serif',
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
        background: '#0a0a0a',
        color: '#fff',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <nav
        style={{
          height: '64px',
          borderBottom: '1px solid #1f1f1f',
          background: '#0d0d0d',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.2rem' }}>⚡</span>
          <span style={{ fontWeight: 700 }}>BuildEasy Dashboard</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#888', fontSize: '0.9rem' }}>
            {user?.email}
          </span>

          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              border: '1px solid #333',
              color: '#ccc',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
            alignItems: 'center',
            marginBottom: '2rem',
          }}
        >
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>
              Welcome back
            </h1>
            <p style={{ color: '#777' }}>
              Manage your projects, publish pages, and continue building.
            </p>
          </div>

          <button
            onClick={openModal}
            style={{
              background: '#7c3aed',
              color: '#fff',
              border: 'none',
              padding: '0.85rem 1.2rem',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            + New Project
          </button>
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

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <div
            style={{
              background: '#111',
              border: '1px solid #1f1f1f',
              borderRadius: '16px',
              padding: '1.2rem',
            }}
          >
            <div style={{ color: '#777', fontSize: '0.85rem' }}>Total Projects</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '0.35rem' }}>
              {stats.total}
            </div>
          </div>

          <div
            style={{
              background: '#111',
              border: '1px solid #1f1f1f',
              borderRadius: '16px',
              padding: '1.2rem',
            }}
          >
            <div style={{ color: '#777', fontSize: '0.85rem' }}>Published</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '0.35rem' }}>
              {stats.published}
            </div>
          </div>

          <div
            style={{
              background: '#111',
              border: '1px solid #1f1f1f',
              borderRadius: '16px',
              padding: '1.2rem',
            }}
          >
            <div style={{ color: '#777', fontSize: '0.85rem' }}>Drafts</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: '0.35rem' }}>
              {stats.drafts}
            </div>
          </div>
        </div>

        <section
          style={{
            background: '#111',
            border: '1px solid #1f1f1f',
            borderRadius: '20px',
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '1rem',
              alignItems: 'center',
              marginBottom: '1.25rem',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <h2 style={{ marginBottom: '0.35rem' }}>Your Projects</h2>
              <p style={{ color: '#777', fontSize: '0.95rem' }}>
                Open, edit, publish, or remove your existing projects.
              </p>
            </div>

            <button
              onClick={openModal}
              style={{
                background: 'transparent',
                border: '1px solid #333',
                color: '#fff',
                padding: '0.7rem 1rem',
                borderRadius: '10px',
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
                border: '1px dashed #2a2a2a',
                borderRadius: '16px',
                padding: '3rem 1.5rem',
                textAlign: 'center',
                background: '#0d0d0d',
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📂</div>
              <h3 style={{ marginBottom: '0.5rem' }}>No projects yet</h3>
              <p style={{ color: '#777', maxWidth: '520px', margin: '0 auto 1.25rem' }}>
                Create your first project to start building pages, customizing design, and publishing to a live URL.
              </p>
              <button
                onClick={openModal}
                style={{
                  background: '#7c3aed',
                  color: '#fff',
                  border: 'none',
                  padding: '0.85rem 1.2rem',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Create Your First Project
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1rem',
              }}
            >
              {projects.map((project) => (
                <div
                  key={project.id}
                  style={{
                    background: '#0d0d0d',
                    border: '1px solid #1f1f1f',
                    borderRadius: '16px',
                    padding: '1.2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '220px',
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                        alignItems: 'flex-start',
                        marginBottom: '1rem',
                      }}
                    >
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '12px',
                          background: project.theme_color || '#7c3aed',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '1rem',
                        }}
                      >
                        {(project.name || 'P').charAt(0).toUpperCase()}
                      </div>

                      <span
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.3rem 0.6rem',
                          borderRadius: '999px',
                          background: project.published ? '#0f2a1a' : '#2a210f',
                          color: project.published ? '#7ee787' : '#fbbf24',
                          border: project.published ? '1px solid #1a5a30' : '1px solid #5a4a1a',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {project.published ? 'Published' : 'Draft'}
                      </span>
                    </div>

                    <h3 style={{ marginBottom: '0.45rem', fontSize: '1.1rem' }}>
                      {project.name}
                    </h3>

                    <p
                      style={{
                        color: '#777',
                        fontSize: '0.92rem',
                        lineHeight: '1.6',
                        marginBottom: '1rem',
                      }}
                    >
                      {project.description || 'No description added yet.'}
                    </p>
                  </div>

                  <div>
                    <div
                      style={{
                        color: '#666',
                        fontSize: '0.8rem',
                        marginBottom: '1rem',
                      }}
                    >
                      {project.publish_slug
                        ? `Public URL: /site/${project.publish_slug}`
                        : 'Not published yet'}
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <Link
                        to={`/project/${project.id}`}
                        style={{
                          textDecoration: 'none',
                          background: '#7c3aed',
                          color: '#fff',
                          padding: '0.7rem 1rem',
                          borderRadius: '10px',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        Open Editor
                      </Link>

                      {project.published && project.publish_slug ? (
                        <Link
                          to={`/site/${project.publish_slug}`}
                          style={{
                            textDecoration: 'none',
                            background: 'transparent',
                            color: '#fff',
                            padding: '0.7rem 1rem',
                            borderRadius: '10px',
                            fontWeight: 600,
                            border: '1px solid #333',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          View Site
                        </Link>
                      ) : null}

                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        style={{
                          background: 'transparent',
                          color: '#ff6b6b',
                          padding: '0.7rem 1rem',
                          borderRadius: '10px',
                          fontWeight: 600,
                          border: '1px solid #5a2020',
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
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 50,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '520px',
              background: '#111',
              border: '1px solid #1f1f1f',
              borderRadius: '20px',
              padding: '1.5rem',
            }}
          >
            <div style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ marginBottom: '0.4rem' }}>Create New Project</h2>
              <p style={{ color: '#777' }}>
                Start with a project name and optional description.
              </p>
            </div>

            <form onSubmit={handleCreateProject}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#bbb' }}>
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="My startup landing page"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: '#1a1a1a',
                      border: '1px solid #2a2a2a',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '0.95rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#bbb' }}>
                    Description
                  </label>
                  <textarea
                    rows="4"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe what you want to build"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: '#1a1a1a',
                      border: '1px solid #2a2a2a',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '0.95rem',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  marginTop: '1.5rem',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  flexWrap: 'wrap',
                }}
              >
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    background: 'transparent',
                    border: '1px solid #333',
                    color: '#ccc',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  style={{
                    background: '#7c3aed',
                    color: '#fff',
                    border: 'none',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: 600,
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