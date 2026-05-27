/* global React, Magnet, FadeIn, ScrollFadeText, StickyCard, ImgPh, Marquee */
const { useState, useEffect, useRef } = React;

/* ============================================================
   Supabase 콘텐츠 로더
============================================================ */
function useSiteContent() {
  const [content, setContent] = useState({});
  useEffect(() => {
    const client = window.supabaseClient;
    if (!client) return;
    client.from('pagecontents').select('*').then(({ data }) => {
      if (!data) return;
      const map = {};
      data.forEach(row => {
        map[row.section_key] = row.content_type === 'image' ? row.image_url : row.content_value;
      });
      setContent(map);
    });
  }, []);
  return content;
}

/* ============================================================
   PROFILE DATA
============================================================ */
const PROFILE = {
  basic: [
    { k: '이름', v: '김미니 (MINI)' },
    { k: '생년월일', v: '1998.07.22' },
    { k: '거주지', v: '서울 마포구' },
    { k: '이메일', v: 'mini@studio.com' },
    { k: '인스타', v: '@mini.motion' },
    { k: '취미', v: '필름카메라, 베이킹' },
  ],
  career: [
    { yr: '2019', t: '(주)뉴타입스튜디오', s: '주니어 모션디자이너 — 브랜드 영상' },
    { yr: '2021', t: 'tvN 콘텐츠본부', s: '드라마 타이틀 시퀀스 / 예능 그래픽' },
    { yr: '2024', t: 'FREELANCE', s: '광고·드라마·영화 자유 작업' },
    { yr: '—', t: '경력 5년차', s: '에이전시 2년 + 방송사 3년' },
  ],
  awards: [
    { yr: '2024', t: 'K-DESIGN AWARD', s: '본상 · Motion Identity 부문' },
    { yr: '2023', t: '서울 모션 페스티벌', s: '우수상 · Title Sequence' },
    { yr: '2022', t: '한국디자인진흥원', s: '올해의 신진디자이너 선정' },
    { yr: '2021', t: '대한민국광고대상', s: '동상 · Digital Craft' },
  ],
  skills: [
    { n: 'After Effects', v: 96 },
    { n: 'Cinema 4D', v: 82 },
    { n: 'Photoshop', v: 94 },
    { n: 'Illustrator', v: 90 },
    { n: 'Premiere Pro', v: 80 },
    { n: 'Blender', v: 62 },
    { n: 'Figma', v: 86 },
  ],
};

/* ============================================================
   HERO
============================================================ */
function Hero({ displayName = 'MINI' }) {
  return (
    <section className="hero" data-screen-label="01 Hero">
      <div className="topbar">
        <span>Motion Graphic</span>
        <span className="center">Design Resume</span>
        <span className="date">2025.05.05</span>
      </div>

      <div className="apple-img" style={{ left: '3%', top: '300px', width: 280, height: 280, transform: 'rotate(-15deg)' }} />
      <div className="apple-img" style={{ right: '-6%', top: '140px', width: 520, height: 520, transform: 'rotate(20deg) scaleX(-1)' }} />

      <h1 className="hero-title">Hi, I&apos;M {(displayName || 'MINI').toUpperCase()}!</h1>

      <div className="hero-photo-wrap">
        <Magnet strength={3} padding={140}>
          <div className="hero-photo" aria-label="MINI portrait" />
        </Magnet>
      </div>

      <div className="hero-foot">
        <a className="hero-cta" href="#contact">
          Contact Me
          <span style={{ fontSize: 16 }}>→</span>
        </a>
      </div>
    </section>
  );
}

/* ============================================================
   PROFILE SECTION
============================================================ */
function ProfileSection() {
  const content = useSiteContent();
  const subtitle = content['subtitle'] || '통통 튀고 상큼한 아이디어 생성기';
  const profileImg = content['profile_photo'];
  return (
    <section className="profile" data-screen-label="02 Profile">
      <FadeIn><h2>Profile</h2></FadeIn>
      <p className="subtitle">{subtitle}</p>

      <div className="profile-grid">
        {/* Card 1: Photo */}
        <div className="profile-card">
          <div className="card-label">Photo</div>
          <h3>프로필 사진</h3>
          <div
            className="photo-placeholder profile-img-slot"
            style={profileImg ? { backgroundImage: `url(${profileImg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
          >
            <span className="ph-label">PORTRAIT</span>
          </div>
        </div>

        {/* Card 2: Basic info */}
        <div className="profile-card">
          <div className="card-label">Basic Info</div>
          <h3>기본 프로필</h3>
          <div style={{ marginTop: 8 }}>
            {PROFILE.basic.map((row, i) => (
              <div className="info-row" key={i}>
                <span className="k">{row.k}</span>
                <span className="v">{row.v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Awards + Career */}
        <div className="profile-card">
          <div className="card-label">Awards & Career</div>
          <h3>수상 · 경력</h3>
          <div style={{ marginTop: 6, overflow: 'hidden' }}>
            {[...PROFILE.awards.slice(0, 3), ...PROFILE.career.slice(0, 3)].map((row, i) => (
              <div className="career-item" key={i}>
                <span className="yr">{row.yr}</span>
                <span className="body">
                  <div className="t">{row.t}</div>
                  <div className="s">{row.s}</div>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 4: Skills */}
        <div className="profile-card">
          <div className="card-label">Skills</div>
          <h3>주요 스킬</h3>
          <div style={{ marginTop: 8 }}>
            {PROFILE.skills.map((sk, i) => (
              <div className="skill-row" key={i}>
                <span className="name">{sk.n}</span>
                <span className="bar"><span className="fill" style={{ width: `${sk.v}%` }} /></span>
                <span className="pct">{sk.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   ABOUT ME — sticky stack with actual portfolio images
============================================================ */
const ABOUT_CARDS = [
  {
    num: '01',
    ko: '단단함',
    lead: '"마감 앞에서 흔들리지 않아요."',
    body: '5년간 한 번도 마감을 놓친 적이 없어요. 풀리지 않는 컷이 생기면 새벽 두 시까지 붙들고 있는 편입니다. 일단 시작하면 끝까지 끌고 가는 사람이고, 중간에 흔들려도 결과물만큼은 약속한 자리로 가져다 놓습니다.',
    tags: ['#마감장인', '#끝까지', '#책임감'],
    img: 'assets/about_me1.png',
  },
  {
    num: '02',
    ko: '빠른 아이디어',
    lead: '"노션엔 이미 60장의 레퍼런스."',
    body: '클라이언트가 "이건 좀 다른 방향이…" 라고 운을 떼면, 다음 카드는 이미 준비되어 있습니다. 빠르게, 많이, 그리고 다르게. 컨셉을 정하기 전 단계에서 가장 많이 움직이는 사람이 되려고 해요.',
    tags: ['#빠른손', '#아이디어부자', '#레퍼런스장인'],
    img: 'assets/about_me2.png',
  },
  {
    num: '03',
    ko: '친화력 & 밝음',
    lead: '"현장에서 가장 먼저 말 걸어요."',
    body: '영화 <우리들의 여름> 작업 때 촬영 감독님이 "쟤는 어디서나 살아남는다" 고 하셨어요. 처음 보는 클라이언트와도 30분이면 농담을 주고받는 편입니다. 분위기를 띄우는 게 일의 일부라고 생각해요.',
    tags: ['#밝음', '#친화력', '#팀워크'],
    img: 'assets/about_me3.png',
  },
  {
    num: '04',
    ko: '꾸준함',
    lead: '"매일 1컷씩 5년째 만들어요."',
    body: '인스타그램에 매일 1컷의 모션 작업을 올린 지 1,827일째. 일이 끝나도 손이 멈추지 않습니다. 재능보다 시간을 믿어요. 작은 컷이 쌓여서 나만의 리듬이 되고, 그 리듬이 결국 스타일이 된다고 생각해요.',
    tags: ['#1827days', '#매일1컷', '#복리의힘'],
    img: 'assets/about_me4.png',
  },
];

function AboutSection() {
  const content = useSiteContent();
  const cards = ABOUT_CARDS.map((card, i) => {
    const n = String(i + 1).padStart(2, '0');
    return {
      ...card,
      lead: content[`about_${n}_lead`] || card.lead,
      body: content[`about_${n}_body`] || card.body,
      img: content[`about_${n}_img`] || card.img,
    };
  });
  return (
    <section className="about-wrap" id="about" data-screen-label="03 About Me">
      <div className="about-head">
        <FadeIn><h2>About Me</h2></FadeIn>
      </div>
      <div className="about-stack">
        {cards.map((card, i) => (
          <StickyCard key={i} index={i} total={cards.length} offsetTop={90} gap={28}>
            <div className="left">
              <div className="head">
                <div className="num">{card.num}</div>
                <div className="head-text">
                  <div className="ko">{card.ko}</div>
                </div>
              </div>
              <p className="lead">{card.lead}</p>
              <p className="body">{card.body}</p>
              <div className="tags">
                {card.tags.map((t, j) => (
                  <span key={j} className={`tag ${j === 0 ? 'red' : ''}`}>{t}</span>
                ))}
              </div>
            </div>
            <div className="right">
              <div
                className="about-img-slot"
                style={{ backgroundImage: `url('${card.img}')` }}
                aria-label={`About Me ${card.num} - ${card.ko}`}
              />
            </div>
          </StickyCard>
        ))}
        <div style={{ height: '20vh' }} />
      </div>
    </section>
  );
}

/* ============================================================
   QnA Accordion
============================================================ */
const QNA = [
  {
    q: '어떤 작업을 가장 좋아하나요?',
    a: '처음 시작할 때 아무것도 정해지지 않은 프로젝트요. 빈 페이지에서 컨셉을 잡고, 컬러팔레트를 정하고, 첫 키프레임을 끊는 순간이 가장 짜릿해요. "이게 진짜 되네?" 하는 그 1초가 좋습니다.',
  },
  {
    q: '가장 기억에 남는 프로젝트는?',
    a: 'tvN 드라마 <불 켜진 방> 오프닝 시퀀스. 4주 동안 30버전을 만들었는데, 결국 채택된 건 제일 처음 그렸던 스케치와 거의 똑같았어요. 가끔은 첫 번째 직감이 맞을 때가 많더라고요.',
  },
  {
    q: '작업할 때 가장 중요하게 생각하는 것은?',
    a: '"이게 왜 움직여야 하는가." 모션을 위한 모션은 만들지 않으려고 해요. 정지 화면일 때보다 의미가 더 분명해질 때, 그때서야 좋은 모션이라고 생각합니다.',
  },
  {
    q: '함께 일하기 좋은 클라이언트 유형은?',
    a: '"그냥 멋있게 해주세요" 보다는 "이 부분이 답답해서 이렇게 풀어보고 싶어요" 라고 말해주는 분. 고민의 결을 같이 나눌 수 있을 때 결과물도 가장 좋게 나옵니다.',
  },
  {
    q: '5년 뒤 어떤 디자이너가 되어 있을까요?',
    a: '잘 모르겠어요. 다만 지금처럼 매일 1컷씩은 만들고 있을 거예요. 그 한 컷의 깊이가 지금과는 달라져 있길 바랄 뿐입니다.',
  },
  {
    q: '취미는 무엇인가요?',
    a: '필름카메라로 찍는 일요일 산책, 그리고 새벽에 베이킹. 손으로 무언가를 굽거나 인화할 때 머릿속이 가장 잘 정리돼요. 다음 작업에 쓰이는 컬러는 거의 그때 떠오릅니다.',
  },
];

function QnASection() {
  const [open, setOpen] = useState(0);
  const content = useSiteContent();
  const items = QNA.map((item, i) => {
    const n = String(i + 1).padStart(2, '0');
    return {
      q: content[`qna_${n}_q`] || item.q,
      a: content[`qna_${n}_a`] || item.a,
    };
  });
  return (
    <section className="qna-wrap" id="qna" data-screen-label="04 QnA">
      <div className="qna-head">
        <FadeIn><h2>QnA</h2></FadeIn>
      </div>
      <div className="qna-list">
        {items.map((item, i) => (
          <div key={i} className={`qna-item ${open === i ? 'open' : ''}`}>
              <button className="qna-q" onClick={() => setOpen(open === i ? -1 : i)}>
                <span className="q-mark">Q.</span>
                <span className="q-text">{item.q}</span>
                <span className="q-plus" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <line x1="12" y1="4" x2="12" y2="20" />
                    <line x1="4" y1="12" x2="20" y2="12" />
                  </svg>
                </span>
              </button>
              <div className="qna-a">
                <div>
                  <div className="qna-a-inner">
                    <span className="a-mark">A.</span>
                    <p>{item.a}</p>
                  </div>
                </div>
              </div>
            </div>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   COMMENTS SECTION — Supabase 연동 5×2 카드 그리드
============================================================ */
function CommentModal({ comment, onClose }) {
  const [replies, setReplies] = useState([]);

  useEffect(() => {
    const client = window.supabaseClient;
    if (!client) return;
    client
      .from('comments')
      .select('*')
      .eq('parent_id', comment.id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })
      .then(({ data }) => setReplies(data || []));
  }, [comment.id]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="닫기">✕</button>
        {comment.image_url && (
          <img src={comment.image_url} className="modal-img" alt="첨부 이미지" />
        )}
        <div className="modal-meta">
          <span className="modal-author">{comment.author_name || '익명'}</span>
          <span className="modal-date">
            {new Date(comment.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
        <p className="modal-text">{comment.content}</p>
        {replies.length > 0 && (
          <div className="modal-replies">
            <div className="replies-label">MINI의 답변</div>
            {replies.map(r => (
              <div key={r.id} className="reply-item">
                <p>{r.content}</p>
                <div className="reply-date">
                  {new Date(r.created_at).toLocaleDateString('ko-KR')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CommentsSection() {
  const [comments, setComments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    const client = window.supabaseClient;
    if (!client) { setLoading(false); return; }
    try {
      const { data } = await client
        .from('comments')
        .select('*')
        .is('parent_id', null)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(10);
      setComments(data || []);
    } catch (err) {
      console.warn('[Comments] 로드 실패:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchComments();
    window.addEventListener('commentAdded', fetchComments);
    return () => window.removeEventListener('commentAdded', fetchComments);
  }, []);

  if (loading || comments.length === 0) return null;

  return (
    <section className="comments-section" id="comments" data-screen-label="05 Comments">
      <FadeIn>
        <h2 className="comments-title">Comments</h2>
      </FadeIn>
      <p className="comments-sub">이력서를 읽고 남겨주신 이야기들</p>
      <div className="comments-grid">
        {comments.map((c) => (
          <div
              className={`comment-card${c.is_private ? ' private' : ''}`}
              onClick={() => !c.is_private && setSelected(c)}
              role="button"
              tabIndex={c.is_private ? -1 : 0}
              onKeyDown={e => e.key === 'Enter' && !c.is_private && setSelected(c)}
            >
              {c.is_private ? (
                <div className="private-msg">관리자에 의해 비공개 처리된 글입니다</div>
              ) : (
                <>
                  {c.image_url && (
                    <div className="comment-thumb" style={{ backgroundImage: `url(${c.image_url})` }} />
                  )}
                  <div className="comment-body">
                    <div className="comment-author">{c.author_name || '익명'}</div>
                    <p className="comment-text">{c.content}</p>
                    <div className="comment-date">
                      {new Date(c.created_at).toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      {selected && (
        <CommentModal comment={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}

/* ============================================================
   CONTACT — Supabase 저장 + 이미지 업로드
============================================================ */
function ContactSection() {
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [state, setState] = useState('idle'); // idle | sending | sent
  const fileRef = useRef(null);

  const onImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || state !== 'idle') return;
    setState('sending');

    const client = window.supabaseClient;
    let image_url = null;

    try {
      if (imageFile && client) {
        const ext = imageFile.name.split('.').pop().toLowerCase();
        const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: upErr } = await client.storage
          .from('comment-images')
          .upload(filename, imageFile, { cacheControl: '3600', upsert: false });
        if (!upErr) {
          const { data: urlData } = client.storage
            .from('comment-images')
            .getPublicUrl(filename);
          image_url = urlData?.publicUrl || null;
        }
      }

      if (client) {
        await client.from('comments').insert({
          author_name: authorName.trim() || '익명',
          content: content.trim(),
          image_url,
          parent_id: null,
        });
        window.dispatchEvent(new CustomEvent('commentAdded'));
      }
    } catch (err) {
      console.warn('[Contact] 제출 실패:', err);
    }

    setState('sent');
    setTimeout(() => {
      setState('idle');
      setContent('');
      setAuthorName('');
      removeImage();
    }, 3200);
  };

  return (
    <section className="contact" id="contact" data-screen-label="07 Contact">
      <FadeIn><h2>Contact Me</h2></FadeIn>

      <p className="contact-desc">이력서를 읽고 느끼신 점, 질문, 면접 제의를 남겨주세요</p>

      <form className={`contact-form-wrap ${state}`} onSubmit={onSubmit}>
          {/* Author name + image upload row */}
          <div className="contact-author-row">
            <input
              type="text"
              className="contact-name-input"
              placeholder="이름 또는 회사명 (선택 · 기본: 익명)"
              value={authorName}
              onChange={e => setAuthorName(e.target.value)}
              disabled={state !== 'idle'}
            />
            <label className="img-upload-btn" title="이미지 첨부" aria-label="이미지 첨부">
              <input
                type="file"
                accept="image/*"
                ref={fileRef}
                onChange={onImageChange}
                hidden
                disabled={state !== 'idle'}
              />
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              {imageFile && <span className="img-badge">✓</span>}
            </label>
          </div>

          {/* Image preview */}
          {imagePreview && (
            <div className="contact-preview">
              <img src={imagePreview} alt="미리보기" />
              <button type="button" className="remove-img" onClick={removeImage} aria-label="이미지 제거">✕</button>
            </div>
          )}

          {/* Message input pill */}
          <div className="contact-pill-row">
            <input
              type="text"
              className="contact-pill-input"
              placeholder="부족한점, 칭찬, 면접제의 어떤 내용이든 남겨주세요"
              value={content}
              onChange={e => setContent(e.target.value)}
              required
              disabled={state !== 'idle'}
            />
            <button type="submit" className="send-btn" aria-label="보내기" disabled={state !== 'idle'}>
              <svg className={`plane ${state === 'sending' ? 'flying' : ''}`} viewBox="0 0 24 24">
                <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
              </svg>
            </button>
            <div className={`success-msg ${state === 'sent' ? 'visible' : ''}`}>
              소중한 의견 감사합니다 ✦
            </div>
          </div>
        </form>

      <div className="socials">
        <a href="https://instagram.com" target="_blank" rel="noopener">Instagram</a>
        <a href="https://behance.net" target="_blank" rel="noopener">Behance</a>
        <a href="https://vimeo.com" target="_blank" rel="noopener">Vimeo</a>
        <a href="mailto:mini@studio.com">mini@studio.com</a>
      </div>

      <div className="contact-foot">
        <span>© 2025 MINI · MOTION GRAPHIC DESIGNER</span>
        <span>Made with ♥ in Seoul</span>
      </div>
    </section>
  );
}

window.Hero = Hero;
window.ProfileSection = ProfileSection;
window.AboutSection = AboutSection;
window.QnASection = QnASection;
window.CommentsSection = CommentsSection;
window.ContactSection = ContactSection;
