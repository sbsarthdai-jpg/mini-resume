/* global React, ReactDOM */
const { useState, useEffect, useCallback } = React;

// ============================================================
// Supabase 헬퍼
// ============================================================
const getClient = () => window.supabaseClient;

async function signIn(email, password) {
  const client = getClient();
  if (!client) throw new Error('Supabase 클라이언트가 초기화되지 않았습니다. supabase-config.js를 확인하세요.');
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function signOut() {
  const client = getClient();
  if (client) await client.auth.signOut();
}

async function fetchAllComments() {
  const client = getClient();
  if (!client) return [];
  const { data } = await client
    .from('comments')
    .select('*')
    .is('parent_id', null)
    .order('created_at', { ascending: false });
  return data || [];
}

async function fetchReplies(parentId) {
  const client = getClient();
  if (!client) return [];
  const { data } = await client
    .from('comments')
    .select('*')
    .eq('parent_id', parentId)
    .order('created_at', { ascending: true });
  return data || [];
}

async function togglePrivate(id, current) {
  const client = getClient();
  if (!client) return;
  await client.from('comments').update({ is_private: !current }).eq('id', id);
}

async function toggleDelete(id, current) {
  const client = getClient();
  if (!client) return;
  await client.from('comments').update({ is_deleted: !current }).eq('id', id);
}

async function insertReply(parentId, content) {
  const client = getClient();
  if (!client) return;
  await client.from('comments').insert({
    parent_id: parentId,
    author_name: 'MINI',
    content: content.trim(),
  });
}

async function fetchPageContents() {
  const client = getClient();
  if (!client) return [];
  const { data } = await client.from('pagecontents').select('*').order('id');
  return data || [];
}

async function updatePageContent(id, content_value) {
  const client = getClient();
  if (!client) return;
  await client.from('pagecontents').update({ content_value, updated_at: new Date().toISOString() }).eq('id', id);
}

// ============================================================
// Login Screen
// ============================================================
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      onLogin();
    } catch (err) {
      setError(err.message || '로그인에 실패했습니다.');
    }
    setLoading(false);
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo">MINI</div>
        <div className="login-sub">관리자 로그인 · Admin Dashboard</div>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="field-group">
            <label>이메일</label>
            <input
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="field-group">
            <label>비밀번호</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="login-error">{error}</div>}
          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: '#8B8378' }}>
          <a href="index.html">← 포트폴리오 사이트로 돌아가기</a>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Reply Modal
// ============================================================
function ReplyModal({ comment, onClose, onSaved }) {
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(true);

  useEffect(() => {
    fetchReplies(comment.id).then(data => {
      setReplies(data);
      setLoadingReplies(false);
    });
  }, [comment.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSaving(true);
    await insertReply(comment.id, replyText);
    setSaving(false);
    setReplyText('');
    const updated = await fetchReplies(comment.id);
    setReplies(updated);
    if (onSaved) onSaved();
  };

  return (
    <div className="reply-modal-overlay" onClick={onClose}>
      <div className="reply-modal" onClick={e => e.stopPropagation()}>
        <h3>답변 작성</h3>
        <div className="original-comment">
          <strong>{comment.author_name || '익명'}</strong>
          <p style={{ marginTop: 8 }}>{comment.content}</p>
          {comment.image_url && (
            <img src={comment.image_url} className="comment-img-thumb" alt="첨부" />
          )}
        </div>

        {loadingReplies ? (
          <div className="loading-state">답변 로딩 중...</div>
        ) : replies.length > 0 ? (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#BB1616', marginBottom: 10 }}>기존 답변</div>
            {replies.map(r => (
              <div key={r.id} style={{ background: '#F6F2EA', borderRadius: 10, padding: '12px 16px', marginBottom: 8 }}>
                <p style={{ fontSize: 14 }}>{r.content}</p>
                <div style={{ fontSize: 11, color: '#8B8378', marginTop: 6, fontFamily: 'JetBrains Mono, monospace' }}>
                  {new Date(r.created_at).toLocaleString('ko-KR')}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <form onSubmit={handleSubmit}>
          <textarea
            className="reply-textarea"
            placeholder="답변을 입력하세요..."
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            required
          />
          <div className="reply-modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>취소</button>
            <button type="submit" className="btn-submit-reply" disabled={saving || !replyText.trim()}>
              {saving ? '저장 중...' : '답변 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// Comments Tab
// ============================================================
function CommentsTab() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | active | private | deleted
  const [replyTarget, setReplyTarget] = useState(null);

  const loadComments = useCallback(async () => {
    const data = await fetchAllComments();
    setComments(data);
    setLoading(false);
  }, []);

  useEffect(() => { loadComments(); }, [loadComments]);

  const handleTogglePrivate = async (c) => {
    await togglePrivate(c.id, c.is_private);
    loadComments();
  };

  const handleToggleDelete = async (c) => {
    await toggleDelete(c.id, c.is_deleted);
    loadComments();
  };

  const filtered = comments.filter(c => {
    if (filter === 'active') return !c.is_deleted && !c.is_private;
    if (filter === 'private') return c.is_private && !c.is_deleted;
    if (filter === 'deleted') return c.is_deleted;
    return true;
  });

  const stats = {
    total: comments.length,
    active: comments.filter(c => !c.is_deleted && !c.is_private).length,
    private: comments.filter(c => c.is_private && !c.is_deleted).length,
    deleted: comments.filter(c => c.is_deleted).length,
  };

  return (
    <div>
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-num">{stats.total}</div>
          <div className="stat-label">전체 코멘트</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{stats.active}</div>
          <div className="stat-label">공개 코멘트</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{stats.private}</div>
          <div className="stat-label">비공개 코멘트</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{stats.deleted}</div>
          <div className="stat-label">삭제된 코멘트</div>
        </div>
      </div>

      <div className="filter-bar">
        {['all', 'active', 'private', 'deleted'].map(f => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? '전체' : f === 'active' ? '공개' : f === 'private' ? '비공개' : '삭제됨'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-state">코멘트 로딩 중...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">해당하는 코멘트가 없습니다.</div>
      ) : (
        <div className="comment-admin-list">
          {filtered.map(c => (
            <div
              key={c.id}
              className={`comment-admin-item${c.is_deleted ? ' deleted' : ''}${c.is_private ? ' private' : ''}`}
            >
              <div>
                <div className="c-author">{c.author_name || '익명'}</div>
                <div className="c-content">{c.content}</div>
                {c.image_url && (
                  <img src={c.image_url} className="comment-img-thumb" alt="첨부" />
                )}
                <div className="c-meta">
                  <span>{new Date(c.created_at).toLocaleString('ko-KR')}</span>
                  {c.is_private && <span className="badge private-badge">비공개</span>}
                  {c.is_deleted && <span className="badge deleted-badge">삭제됨</span>}
                </div>
              </div>
              <div className="comment-admin-actions">
                <button
                  className="action-btn reply-btn"
                  onClick={() => setReplyTarget(c)}
                  disabled={c.is_deleted}
                >
                  답변
                </button>
                <button
                  className={`action-btn private-btn${c.is_private ? ' active' : ''}`}
                  onClick={() => handleTogglePrivate(c)}
                  disabled={c.is_deleted}
                >
                  {c.is_private ? '공개하기' : '비공개'}
                </button>
                <button
                  className={`action-btn delete-btn${c.is_deleted ? ' active' : ''}`}
                  onClick={() => handleToggleDelete(c)}
                >
                  {c.is_deleted ? '복원' : '삭제'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {replyTarget && (
        <ReplyModal
          comment={replyTarget}
          onClose={() => setReplyTarget(null)}
          onSaved={loadComments}
        />
      )}
    </div>
  );
}

// ============================================================
// Content Tab
// ============================================================
function ContentTab() {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [savedId, setSavedId] = useState(null);
  const [edits, setEdits] = useState({});

  useEffect(() => {
    fetchPageContents().then(data => {
      setContents(data);
      const init = {};
      data.forEach(c => { init[c.id] = c.content_value || ''; });
      setEdits(init);
      setLoading(false);
    });
  }, []);

  const handleSave = async (item) => {
    setSavingId(item.id);
    await updatePageContent(item.id, edits[item.id]);
    setSavingId(null);
    setSavedId(item.id);
    setTimeout(() => setSavedId(null), 2000);
  };

  const sectionLabels = {
    display_name: '표시 이름 (Hero)',
    full_name: '전체 이름',
    role: '직함',
    tagline: '서브 문구',
    subtitle: 'Profile 부제목',
    footer_text: '푸터 텍스트',
  };

  if (loading) return <div className="loading-state">콘텐츠 로딩 중...</div>;

  return (
    <div>
      <p style={{ color: '#8B8378', marginBottom: 32, fontSize: 14 }}>
        각 섹션의 텍스트를 수정하고 저장 버튼을 누르세요.<br />
        변경 사항은 즉시 Supabase에 저장되며, 페이지 새로고침 시 반영됩니다.
      </p>
      <div className="content-editor-list">
        {contents.filter(c => c.content_type === 'text').map(item => (
          <div key={item.id} className="content-editor-item">
            <div className="key-label">
              {sectionLabels[item.section_key] || item.section_key}
              <span style={{ marginLeft: 10, opacity: 0.6 }}>({item.page_name})</span>
            </div>
            <input
              className="edit-input"
              type="text"
              value={edits[item.id] || ''}
              onChange={e => setEdits(prev => ({ ...prev, [item.id]: e.target.value }))}
            />
            <button
              className={`btn-save${savedId === item.id ? ' saved' : ''}`}
              onClick={() => handleSave(item)}
              disabled={savingId === item.id}
            >
              {savingId === item.id ? '저장 중...' : savedId === item.id ? '저장됨 ✓' : '저장'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Admin Dashboard
// ============================================================
function AdminDashboard({ onLogout }) {
  const [tab, setTab] = useState('comments');
  const publicUrl = window.location.href.replace('admin.html', 'index.html');

  const handleLogout = async () => {
    await signOut();
    onLogout();
  };

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="admin-logo">
          MINI
          <span>관리자 대시보드</span>
        </div>
        <div className="admin-actions">
          <a href="index.html" target="_blank" style={{ fontSize: 13, color: '#BB1616', fontWeight: 600 }}>
            사이트 보기 →
          </a>
          <button className="btn-logout" onClick={handleLogout}>로그아웃</button>
        </div>
      </header>

      <nav className="admin-tabs">
        <button
          className={`tab-btn ${tab === 'comments' ? 'active' : ''}`}
          onClick={() => setTab('comments')}
        >
          코멘트 관리
        </button>
        <button
          className={`tab-btn ${tab === 'content' ? 'active' : ''}`}
          onClick={() => setTab('content')}
        >
          콘텐츠 수정
        </button>
      </nav>

      <main className="admin-main">
        <div className="public-link-bar">
          <span className="link-label">게시용 URL (제출용)</span>
          <a href="index.html" target="_blank">{publicUrl}</a>
          <span className="link-label" style={{ marginLeft: 24 }}>관리용 URL</span>
          <a href="admin.html" target="_blank">{window.location.href}</a>
        </div>

        <h2 className="section-heading">
          {tab === 'comments' ? '코멘트 관리' : '콘텐츠 수정'}
        </h2>
        {tab === 'comments' ? <CommentsTab /> : <ContentTab />}
      </main>
    </div>
  );
}

// ============================================================
// Root App
// ============================================================
function AdminApp() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const client = getClient();
    if (!client) { setChecking(false); return; }
    client.auth.getSession().then(({ data: { session } }) => {
      setLoggedIn(!!session);
      setChecking(false);
    });

    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (checking) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'Roboto, sans-serif', color: '#8B8378' }}>
        로딩 중...
      </div>
    );
  }

  if (!loggedIn) {
    return <LoginScreen onLogin={() => setLoggedIn(true)} />;
  }

  return <AdminDashboard onLogout={() => setLoggedIn(false)} />;
}

ReactDOM.createRoot(document.getElementById('admin-root')).render(<AdminApp />);
