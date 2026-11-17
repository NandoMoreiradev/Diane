/* =====================================================================
   Dianê · camada de pedidos
   - Com CONFIG.firebase preenchido: grava e lê no Firestore (funciona entre
     celular, mesa e computador do balcão, em tempo real).
   - Sem Firebase: MODO DEMONSTRAÇÃO, guarda no navegador e avisa as outras
     abas abertas do mesmo navegador (BroadcastChannel).
   ===================================================================== */
(function () {
  const FB = '10.12.2';
  const CHAVE = 'diane-pedidos-demo';
  const STATUS = ['novo', 'preparo', 'pronto', 'entregue', 'cancelado'];

  const codigo = () => {
    const a = 'ACDEFGHJKMNPQRTUVWXY', d = '2346789';
    return a[Math.floor(Math.random() * a.length)] + d[Math.floor(Math.random() * d.length)] + a[Math.floor(Math.random() * a.length)];
  };
  const inicioDoDia = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };

  /* ---------------- modo demonstração ---------------- */
  function demo() {
    let canal = null;
    try { canal = new BroadcastChannel('diane-pedidos'); } catch (e) {}
    const ouvintes = new Set();
    const ler = () => { try { return JSON.parse(localStorage.getItem(CHAVE) || '[]'); } catch (e) { return []; } };
    const gravar = (l) => { try { localStorage.setItem(CHAVE, JSON.stringify(l)); } catch (e) {} avisar(); canal && canal.postMessage('mudou'); };
    const avisar = () => ouvintes.forEach(f => f());
    canal && (canal.onmessage = avisar);
    addEventListener('storage', e => { if (e.key === CHAVE) avisar(); });
    const ouvir = (f) => { ouvintes.add(f); f(); return () => ouvintes.delete(f); };

    return {
      modo: 'demo',
      async enviar(p) {
        const l = ler();
        const novo = { ...p, id: 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), codigo: codigo(), status: 'novo', criadoEm: Date.now() };
        l.push(novo); gravar(l);
        return { id: novo.id, codigo: novo.codigo };
      },
      acompanhar(id, cb) { return ouvir(() => cb(ler().find(p => p.id === id) || null)); },
      ouvirDesde(desde, cb) {
        return ouvir(() => { const ini = +desde; cb(ler().filter(p => p.criadoEm >= ini).sort((a, b) => a.criadoEm - b.criadoEm)); });
      },
      async registrar(p) { // venda feita no balcão (já entregue)
        const l = ler();
        const novo = { ...p, id: 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), codigo: codigo(), status: 'entregue', criadoEm: Date.now(), em_entregue: Date.now() };
        l.push(novo); gravar(l); return { id: novo.id, codigo: novo.codigo };
      },
      async mudarStatus(id, status) {
        const l = ler(); const p = l.find(x => x.id === id); if (!p) return;
        p.status = status; p['em_' + status] = Date.now(); gravar(l);
      },
      onAuth(cb) { cb({ demo: true }); return () => {}; },
      async entrar() {}, async sair() {}
    };
  }

  /* ---------------- Firebase ---------------- */
  function carregar(src) {
    return new Promise((ok, erro) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => erro(new Error('Não carregou ' + src)); document.head.appendChild(s); });
  }
  async function firebaseApi(cfg, comAuth) {
    const base = `https://www.gstatic.com/firebasejs/${FB}/`;
    await carregar(base + 'firebase-app-compat.js');
    await carregar(base + 'firebase-firestore-compat.js');
    if (comAuth) await carregar(base + 'firebase-auth-compat.js');
    const app = firebase.apps.length ? firebase.app() : firebase.initializeApp(cfg);
    const db = app.firestore();
    const col = db.collection('pedidos');
    const ts = () => firebase.firestore.FieldValue.serverTimestamp();
    const ms = (v) => v && v.toMillis ? v.toMillis() : (v || Date.now());
    const norm = (d) => { const x = d.data(); return { ...x, id: d.id, criadoEm: ms(x.criadoEm) }; };
    return {
      modo: 'firebase',
      async enviar(p) {
        const c = codigo();
        const ref = await col.add({ ...p, codigo: c, status: 'novo', criadoEm: ts() });
        return { id: ref.id, codigo: c };
      },
      acompanhar(id, cb) { return col.doc(id).onSnapshot(d => cb(d.exists ? norm(d) : null), () => cb(null)); },
      ouvirDesde(desde, cb, erro) {
        return col.where('criadoEm', '>=', desde).orderBy('criadoEm')
          .onSnapshot(s => cb(s.docs.map(norm)), e => erro && erro(e));
      },
      async registrar(p) {
        const c = codigo();
        const ref = await col.add({ ...p, codigo: c, status: 'entregue', criadoEm: ts(), em_entregue: ts() });
        return { id: ref.id, codigo: c };
      },
      mudarStatus(id, status) { return col.doc(id).update({ status, ['em_' + status]: ts() }); },
      onAuth(cb) { return app.auth().onAuthStateChanged(cb); },
      entrar(email, senha) { return app.auth().signInWithEmailAndPassword(email, senha); },
      sair() { return app.auth().signOut(); }
    };
  }

  /* Pedidos.pronto(comAuth) → Promise da API */
  let api = null;
  window.Pedidos = {
    STATUS,
    pronto(comAuth) {
      if (!api) api = window.CONFIG && CONFIG.firebase ? firebaseApi(CONFIG.firebase, comAuth) : Promise.resolve(demo());
      return api;
    }
  };

  /* Catálogo: monta o item do pedido e confere o total pelo cardápio */
  window.Catalogo = {
    info(id) { return PRODUTOS.find(p => p.id === id) || COMBOS.find(c => c.id === id) || null; },
    custo(id) {
      const i = this.info(id); if (!i) return 0;
      return i.itens ? i.itens.reduce((s, x) => s + (this.info(x).custo || 0), 0) : (i.custo || 0);
    },
    linha(l) {
      const i = this.info(l.id);
      return { id: l.id, nome: (i.itens ? 'Combo ' : '') + i.nome, q: l.q, preco: i.preco, custo: this.custo(l.id), sabor: l.sabor || null };
    },
    conferir(itens) {
      return itens.reduce((s, l) => { const i = this.info(l.id); return s + (i ? i.preco : NaN) * l.q; }, 0);
    },
    // itens feitos para consumir na mesa (ex.: coado para preparar ali), não vão para entrega nem retirada
    soNaMesa(id) {
      const i = this.info(id); if (!i) return false;
      return i.itens ? i.itens.some(x => this.soNaMesa(x)) : !!i.soNaMesa;
    },
    // entrega: acha a zona pelo nome do bairro (ignora acentos e maiúsculas)
    // nome do bairro como está na lista (ou null se não entregamos lá)
    bairro(nome) {
      const n = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
      const alvo = n(nome).replace(/^(bairro|b\.) /, '').replace(/^18 do forte$/, 'dezoito do forte').replace(/^13 de julho$/, 'treze de julho');
      const d = (window.CONFIG && CONFIG.delivery) || { zonas: [] };
      for (const z of d.zonas) { const b = z.bairros.find(b => n(b) === alvo); if (b) return b; }
      return null;
    },
    zona(nome) {
      const b = this.bairro(nome); if (!b) return null;
      return CONFIG.delivery.zonas.find(z => z.bairros.includes(b));
    },
    // taxa de entrega: null = bairro fora da área
    frete(subtotal, bairro) {
      const d = CONFIG.delivery, z = this.zona(bairro);
      if (!z) return null;
      return d.freteGratisAcima && subtotal >= d.freteGratisAcima ? 0 : z.taxa;
    }
  };
})();
