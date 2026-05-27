/* global React, ReactDOM */
const { useState, useEffect, useCallback, useRef } = React;

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

async function upsertContent(page_name, section_key, content_type, value) {
  const client = getClient();
  if (!client) return;
  const field = content_type === 'image' ? 'image_url' : 'content_value';
  const existing = await client.from('pagecontents').select('id').eq('section_key', section_key);
  if (existing.data && existing.data.length > 0) {
    await client.from('pagecontents').update({ [field]: value, updated_at: new Date().toISOString() }).eq('section_key', section_key);
  } else {
    await client.from('pagecontents').insert({ page_name, section_key, content_type, [field]: value });
  }
}

async function uploadImage(file) {
  const client = getClient();
  if (!client) return null;
  const ext = file.name.split('.').pop().toLowerCase();
  const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await client.storage.from('comment-images').upload(filename, file, { upsert: false });
  if (error) return null;
  const { data } = client.storage.from('comment-images').getPublicUrl(filename);
  return data.publicUrl;
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
// ============================================================
// Profile Tab
// ============================================================
function ProfileTab() {
  const [subtitle, setSubtitle] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [saving, setSaving] = useState('');
  const [saved, setSaved] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    fetchPageContents().then(data => {
      data.forEach(row => {
        if (row.section_key === 'subtitle') setSubtitle(row.content_value || '');
        if (row.section_key === 'profile_photo') setPhotoUrl(row.image_url || '');
      });
    });
  }, []);

  const save = async (key) => {
    setSaving(key);
    if (key === 'subtitle') await upsertContent('profile', 'subtitle', 'text', subtitle);
    setSaving('');
    setSaved(key);
    setTimeout(() => setSaved(''), 2000);
  };

  const onPhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSaving('photo');
    const url = await uploadImage(file);
    if (url) {
      setPhotoUrl(url);
      await upsertContent('profile', 'profile_photo', 'image', url);
      setSaved('photo');
      setTimeout(() => setSaved(''), 2000);
    }
    setSaving('');
  };

  return (
    <div className="content-editor-list">
      <div className="content-editor-item">
        <div className="key-label">Profile 부제목</div>
        <input className="edit-input" type="text" value={subtitle} onChange={e => setSubtitle(e.target.value)} />
        <button className={`btn-save${saved === 'subtitle' ? ' saved' : ''}`} onClick={() => save('subtitle')} disabled={saving === 'subtitle'}>
          {saving === 'subtitle' ? '저장 중...' : saved === 'subtitle' ? '저장됨 ✓' : '저장'}
        </button>
      </div>
      <div className="content-editor-item">
        <div className="key-label">프로필 사진</div>
        {photoUrl && <img src={photoUrl} alt="프로필" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 12, marginBottom: 8 }} />}
        <input type="file" accept="image/*" ref={fileRef} onChange={onPhotoUpload} style={{ display: 'none' }} />
        <button className={`btn-save${saved === 'photo' ? ' saved' : ''}`} onClick={() => fileRef.current.click()} disabled={saving === 'photo'}>
          {saving === 'photo' ? '업로드 중...' : saved === 'photo' ? '저장됨 ✓' : '사진 변경'}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// About Me Tab
// ============================================================
const ABOUT_DEFAULTS = [
  { num: '01', ko: '단단함' },
  { num: '02', ko: '빠른 아이디어' },
  { num: '03', ko: '친화력 & 밝음' },
  { num: '04', ko: '꾸준함' },
];

function AboutTab() {
  const [cards, setCards] = useState(ABOUT_DEFAULTS.map(() => ({ lead: '', body: '', imgUrl: '' })));
  const [saving, setSaving] = useState(null);
  const [saved, setSaved] = useState(null);
  const fileRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    fetchPageContents().then(data => {
      setCards(prev => prev.map((c, i) => {
        const n = String(i + 1).padStart(2, '0');
        const lead = data.find(r => r.section_key === `about_${n}_lead`);
        const body = data.find(r => r.section_key === `about_${n}_body`);
        const img = data.find(r => r.section_key === `about_${n}_img`);
        return {
          lead: lead ? lead.content_value || '' : c.lead,
          body: body ? body.content_value || '' : c.body,
          imgUrl: img ? img.image_url || '' : c.imgUrl,
        };
      }));
    });
  }, []);

  const saveText = async (i, field) => {
    const key = `${i}_${field}`;
    setSaving(key);
    const n = String(i + 1).padStart(2, '0');
    await upsertContent('about', `about_${n}_${field}`, 'text', cards[i][field]);
    setSaving(null);
    setSaved(key);
    setTimeout(() => setSaved(null), 2000);
  };

  const onImgUpload = async (i, e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSaving(`${i}_img`);
    const url = await uploadImage(file);
    if (url) {
      const n = String(i + 1).padStart(2, '0');
      setCards(prev => prev.map((c, idx) => idx === i ? { ...c, imgUrl: url } : c));
      await upsertContent('about', `about_${n}_img`, 'image', url);
      setSaved(`${i}_img`);
      setTimeout(() => setSaved(null), 2000);
    }
    setSaving(null);
  };

  return (
    <div>
      {ABOUT_DEFAULTS.map((def, i) => (
        <div key={i} style={{ marginBottom: 40, paddingBottom: 32, borderBottom: '1px dashed #ddd' }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#BB1616', marginBottom: 16 }}>
            {def.num} · {def.ko}
          </div>
          <div className="content-editor-list">
            <div className="content-editor-item">
              <div className="key-label">한 줄 소개 (lead)</div>
              <input className="edit-input" type="text" value={cards[i].lead}
                onChange={e => setCards(prev => prev.map((c, idx) => idx === i ? { ...c, lead: e.target.value } : c))} />
              <button className={`btn-save${saved === `${i}_lead` ? ' saved' : ''}`}
                onClick={() => saveText(i, 'lead')} disabled={saving === `${i}_lead`}>
                {saving === `${i}_lead` ? '저장 중...' : saved === `${i}_lead` ? '저장됨 ✓' : '저장'}
              </button>
            </div>
            <div className="content-editor-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
              <div className="key-label">본문 (body)</div>
              <textarea className="edit-input" rows={3} value={cards[i].body}
                style={{ resize: 'vertical', padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', width: '100%' }}
                onChange={e => setCards(prev => prev.map((c, idx) => idx === i ? { ...c, body: e.target.value } : c))} />
              <button className={`btn-save${saved === `${i}_body` ? ' saved' : ''}`}
                onClick={() => saveText(i, 'body')} disabled={saving === `${i}_body`}>
                {saving === `${i}_body` ? '저장 중...' : saved === `${i}_body` ? '저장됨 ✓' : '저장'}
              </button>
            </div>
            <div className="content-editor-item">
              <div className="key-label">이미지</div>
              {cards[i].imgUrl && <img src={cards[i].imgUrl} alt={def.ko} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, marginRight: 12 }} />}
              <input type="file" accept="image/*" ref={fileRefs[i]} onChange={e => onImgUpload(i, e)} style={{ display: 'none' }} />
              <button className={`btn-save${saved === `${i}_img` ? ' saved' : ''}`}
                onClick={() => fileRefs[i].current.click()} disabled={saving === `${i}_img`}>
                {saving === `${i}_img` ? '업로드 중...' : saved === `${i}_img` ? '저장됨 ✓' : '이미지 변경'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// QnA Tab
// ============================================================
function QnATab() {
  const [items, setItems] = useState(Array.from({ length: 6 }, () => ({ q: '', a: '' })));
  const [saving, setSaving] = useState(null);
  const [saved, setSaved] = useState(null);

  useEffect(() => {
    fetchPageContents().then(data => {
      setItems(prev => prev.map((item, i) => {
        const n = String(i + 1).padStart(2, '0');
        const q = data.find(r => r.section_key === `qna_${n}_q`);
        const a = data.find(r => r.section_key === `qna_${n}_a`);
        return {
          q: q ? q.content_value || '' : item.q,
          a: a ? a.content_value || '' : item.a,
        };
      }));
    });
  }, []);

  const saveField = async (i, field) => {
    const key = `${i}_${field}`;
    setSaving(key);
    const n = String(i + 1).padStart(2, '0');
    await upsertContent('qna', `qna_${n}_${field}`, 'text', items[i][field]);
    setSaving(null);
    setSaved(key);
    setTimeout(() => setSaved(null), 2000);
  };

  return (
    <div>
      {items.map((item, i) => (
        <div key={i} style={{ marginBottom: 36, paddingBottom: 28, borderBottom: '1px dashed #ddd' }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#BB1616', marginBottom: 12 }}>Q{i + 1}</div>
          <div className="content-editor-list">
            <div className="content-editor-item">
              <div className="key-label">질문</div>
              <input className="edit-input" type="text" value={item.q}
                onChange={e => setItems(prev => prev.map((it, idx) => idx === i ? { ...it, q: e.target.value } : it))} />
              <button className={`btn-save${saved === `${i}_q` ? ' saved' : ''}`}
                onClick={() => saveField(i, 'q')} disabled={saving === `${i}_q`}>
                {saving === `${i}_q` ? '저장 중...' : saved === `${i}_q` ? '저장됨 ✓' : '저장'}
              </button>
            </div>
            <div className="content-editor-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
              <div className="key-label">답변</div>
              <textarea className="edit-input" rows={3} value={item.a}
                style={{ resize: 'vertical', padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', width: '100%' }}
                onChange={e => setItems(prev => prev.map((it, idx) => idx === i ? { ...it, a: e.target.value } : it))} />
              <button className={`btn-save${saved === `${i}_a` ? ' saved' : ''}`}
                onClick={() => saveField(i, 'a')} disabled={saving === `${i}_a`}>
                {saving === `${i}_a` ? '저장 중...' : saved === `${i}_a` ? '저장됨 ✓' : '저장'}
              </button>
            </div>
          </div>
        </div>
      ))}
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
        {[
          { key: 'comments', label: '코멘트 관리' },
          { key: 'profile', label: '프로필' },
          { key: 'about', label: 'About Me' },
          { key: 'qna', label: 'QnA' },
        ].map(({ key, label }) => (
          <button key={key} className={`tab-btn ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </nav>

      <main className="admin-main">
        <div className="public-link-bar">
          <span className="link-label">게시용 URL (제출용)</span>
          <a href="index.html" target="_blank">{publicUrl}</a>
          <span className="link-label" style={{ marginLeft: 24 }}>관리용 URL</span>
          <a href="admin.html" target="_blank">{window.location.href}</a>
        </div>

        <h2 className="section-heading">
          {{ comments: '코멘트 관리', profile: '프로필 수정', about: 'About Me 수정', qna: 'QnA 수정' }[tab]}
        </h2>
        {tab === 'comments' && <CommentsTab />}
        {tab === 'profile' && <ProfileTab />}
        {tab === 'about' && <AboutTab />}
        {tab === 'qna' && <QnATab />}
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
