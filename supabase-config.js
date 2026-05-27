// ============================================================
// Supabase 설정 — CDN 불필요, 직접 REST API 방식
// supabase.com > Settings > API 에서 아래 두 값을 복사하세요
// ============================================================
window.SUPABASE_URL = 'https://uprmcniecwjzxerwufzr.supabase.co';
window.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwcm1jbmllY3dqenhlcnd1ZnpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3ODQ2OTAsImV4cCI6MjA5NTM2MDY5MH0.Z2Y_ZzOTufCLoZOBWf5nmBTgzN99QaOXaYhUhvPmuXo';

(function () {
  const configured = window.SUPABASE_URL && !window.SUPABASE_URL.includes('YOUR_PROJECT');
  let _token = localStorage.getItem('_mini_admin_token') || null;

  function headers(useAuth) {
    const tok = useAuth && _token ? _token : window.SUPABASE_ANON_KEY;
    return {
      'apikey': window.SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + tok,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    };
  }

  // 쿼리 빌더 — await 시 자동 실행 (thenable)
  function QB(table, mode, initData) {
    const s = { table, mode, data: initData, cols: '*', filters: [], order: null, limit: null };

    const b = {
      select(c) { s.cols = c || '*'; return b; },
      eq(col, val) { s.filters.push(col + '=eq.' + val); return b; },
      neq(col, val) { s.filters.push(col + '=neq.' + val); return b; },
      is(col, val) { s.filters.push(col + (val === null ? '=is.null' : '=is.' + val)); return b; },
      order(col, o) { s.order = col + '.' + (o && o.ascending === false ? 'desc' : 'asc'); return b; },
      limit(n) { s.limit = n; return b; },

      then(res, rej) { return run().then(res, rej); },
      catch(rej) { return run().catch(rej); },
    };

    async function run() {
      if (!configured) return { data: [], error: null };
      try {
        const base = window.SUPABASE_URL + '/rest/v1/' + s.table;
        const p = new URLSearchParams();
        if (s.mode === 'select') {
          p.set('select', s.cols);
          s.filters.forEach(f => { const [k, v] = f.split('='); p.append(k, v); });
          if (s.order) p.set('order', s.order);
          if (s.limit) p.set('limit', s.limit);
          const r = await fetch(base + '?' + p, { headers: headers(true) });
          if (!r.ok) return { data: [], error: { status: r.status } };
          return { data: await r.json(), error: null };
        }
        if (s.mode === 'insert') {
          const body = Array.isArray(s.data) ? s.data : [s.data];
          const r = await fetch(base, { method: 'POST', headers: headers(true), body: JSON.stringify(body) });
          if (!r.ok) return { data: null, error: { status: r.status } };
          return { data: await r.json(), error: null };
        }
        if (s.mode === 'update') {
          s.filters.forEach(f => { const [k, v] = f.split('='); p.append(k, v); });
          const r = await fetch(base + '?' + p, { method: 'PATCH', headers: headers(true), body: JSON.stringify(s.data) });
          if (!r.ok) return { data: null, error: { status: r.status } };
          return { data: await r.json(), error: null };
        }
      } catch (e) { return { data: null, error: e }; }
    }

    return b;
  }

  const client = {
    from(table) {
      return {
        select(cols) { return QB(table, 'select').select(cols); },
        insert(data) { return QB(table, 'insert', data); },
        update(data) {
          const b = QB(table, 'update', data);
          return b;
        },
      };
    },

    storage: {
      from(bucket) {
        return {
          async upload(path, file, opts) {
            if (!configured) return { data: null, error: new Error('미설정') };
            try {
              const r = await fetch(
                window.SUPABASE_URL + '/storage/v1/object/' + bucket + '/' + path,
                {
                  method: 'POST',
                  headers: {
                    'apikey': window.SUPABASE_ANON_KEY,
                    'Authorization': 'Bearer ' + (_token || window.SUPABASE_ANON_KEY),
                    'x-upsert': String(!!(opts && opts.upsert)),
                  },
                  body: file,
                }
              );
              const d = await r.json().catch(() => ({}));
              return r.ok ? { data: d, error: null } : { data: null, error: d };
            } catch (e) { return { data: null, error: e }; }
          },
          getPublicUrl(path) {
            return { data: { publicUrl: window.SUPABASE_URL + '/storage/v1/object/public/' + bucket + '/' + path } };
          },
        };
      },
    },

    auth: {
      async signInWithPassword({ email, password }) {
        if (!configured) throw new Error('Supabase가 설정되지 않았습니다. supabase-config.js를 확인하세요.');
        const r = await fetch(
          window.SUPABASE_URL + '/auth/v1/token?grant_type=password',
          {
            method: 'POST',
            headers: { 'apikey': window.SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          }
        );
        const d = await r.json();
        if (!r.ok) throw new Error(d.error_description || d.error || '로그인 실패');
        _token = d.access_token;
        localStorage.setItem('_mini_admin_token', _token);
        return { data: { session: d, user: d.user }, error: null };
      },

      async signOut() {
        _token = null;
        localStorage.removeItem('_mini_admin_token');
      },

      async getSession() {
        const t = localStorage.getItem('_mini_admin_token');
        if (t) { _token = t; return { data: { session: { access_token: t } }, error: null }; }
        return { data: { session: null }, error: null };
      },

      onAuthStateChange(cb) {
        const t = localStorage.getItem('_mini_admin_token');
        setTimeout(() => cb(t ? 'SIGNED_IN' : 'SIGNED_OUT', t ? { access_token: t } : null), 0);
        return { data: { subscription: { unsubscribe() {} } } };
      },
    },
  };

  window.supabaseClient = client;
  if (configured) console.log('[Supabase] REST API 초기화 완료');
  else console.info('[Supabase] supabase-config.js에 URL과 KEY를 입력해주세요.');
})();
