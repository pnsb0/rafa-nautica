// CONFIGURAÇÃO
const WHATSAPP = "5567999379529"; // 55 + DDD + número do Rafa (confirmado no Instagram da loja)
const REDES = {
  instagram: "https://www.instagram.com/rafanautica/",
  facebook: "",  // colar o link da página quando tiver (vazio = o botão some)
  linkedin: "",  // idem
};

// Produto acima desse valor (ou sem preço) NÃO vai pro carrinho: a negociação é direto no WhatsApp.
// Pra forçar um produto específico, use no produtos.js:  setor: "whats"  ou  setor: "carrinho"
const LIMITE_CARRINHO = 3000;

const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const linkWhats = (msg) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
const porId = (id) => PRODUTOS.find((p) => p.id === id);
const vaiProCarrinho = (p) => (p.setor ? p.setor === "carrinho" : p.preco != null && p.preco <= LIMITE_CARRINHO);
const ICONE_WHATS = `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm4.5 12.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z"/></svg>`;

const precoTexto = (p) => (p.preco == null ? "consultar" : (p.aPartir ? "a partir de " : "") + brl(p.preco));
const msgNegociar = (p) =>
  `Oi, Rafa! Vi no site o ${p.nome} (${precoTexto(p)}) e quero negociar. Ainda tem disponível? Como ficam as condições de pagamento?`;

// ---------- Vitrine ----------
function precoHTML(p) {
  if (p.preco == null) return `<p class="preco">Consulte o preço</p>`;
  const de = p.precoDe ? `<s>${brl(p.precoDe)}</s>` : "";
  const ap = p.aPartir ? `<small>a partir de</small>` : "";
  return `<p class="preco">${de}${ap}${brl(p.preco)}</p>`;
}

const botaoNegociar = (p, extraClasse = "") =>
  `<a class="btn btn-whats ${extraClasse}" target="_blank" rel="noopener" href="${linkWhats(msgNegociar(p))}">${ICONE_WHATS} Negociar no WhatsApp</a>`;

// Setor 1: barcos e motores (direto no WhatsApp)
function renderGrandes() {
  document.getElementById("grade-grande").innerHTML = PRODUTOS.filter((p) => !vaiProCarrinho(p))
    .map((p) => `<article class="card-grande">
        <div class="card-img"><img src="img/${p.foto}" alt="${p.nome}" loading="lazy">
          ${p.precoDe ? `<span class="selo">Promoção</span>` : ""}</div>
        <div class="card-corpo">
          <span class="card-cat">${p.categoria}</span>
          <h3>${p.nome}</h3>
          <p class="card-desc">${p.desc}</p>
          ${precoHTML(p)}
          ${p.extra ? `<p class="card-extra">${p.extra}</p>` : ""}
          <div class="card-acoes">${botaoNegociar(p)}</div>
        </div>
      </article>`)
    .join("");
}

// Setor 2: acessórios (carrinho)
function renderCatalogo() {
  document.getElementById("grade").innerHTML = PRODUTOS.filter(vaiProCarrinho)
    .map((p) => `<article class="card">
        <div class="card-img"><img src="img/${p.foto}" alt="${p.nome}" loading="lazy">
          ${p.precoDe ? `<span class="selo">Promoção</span>` : ""}</div>
        <div class="card-corpo">
          <span class="card-cat">${p.categoria}</span>
          <h3>${p.nome}</h3>
          <p class="card-desc">${p.desc}</p>
          ${precoHTML(p)}
          ${p.extra ? `<p class="card-extra">${p.extra}</p>` : ""}
          <div class="card-acoes">
            <button class="btn btn-sm" data-add="${p.id}">Adicionar ao carrinho</button>
          </div>
        </div>
      </article>`)
    .join("");
}

// Mostra nos botões quantos de cada já estão no carrinho
function atualizarBotoes() {
  document.querySelectorAll("[data-add]").forEach((b) => {
    const qtd = pedido[b.dataset.add] || 0;
    b.textContent = qtd ? `✓ No carrinho (${qtd}) · +1` : "Adicionar ao carrinho";
    b.classList.toggle("no-carrinho", qtd > 0);
  });
}

// ---------- Pedido (carrinho) ----------
let pedido = {}; // { id: quantidade }
try { pedido = JSON.parse(localStorage.getItem("rafa-pedido")) || {}; } catch (e) { pedido = {}; }
const salvar = () => { try { localStorage.setItem("rafa-pedido", JSON.stringify(pedido)); } catch (e) {} };

const precoUnit = (p, qtd) => (p.atacado && qtd >= p.atacado.min ? p.atacado.preco : p.preco);
const itensPedido = () => Object.entries(pedido).map(([id, qtd]) => ({ p: porId(id), qtd })).filter((i) => i.p && vaiProCarrinho(i.p));

function avisar(txt) {
  const t = document.getElementById("toast");
  t.textContent = txt;
  t.classList.add("ver");
  clearTimeout(avisar.timer);
  avisar.timer = setTimeout(() => t.classList.remove("ver"), 2200);
}

function adicionar(id) {
  if (!porId(id) || !vaiProCarrinho(porId(id))) return;
  pedido[id] = (pedido[id] || 0) + 1;
  salvar();
  renderPedido();
  avisar(`${porId(id).nome} foi pro carrinho`);
}

function mudarQtd(id, delta) {
  pedido[id] = (pedido[id] || 0) + delta;
  if (pedido[id] <= 0) delete pedido[id];
  salvar();
  renderPedido();
}

function renderPedido() {
  const itens = itensPedido();
  const qtdTotal = itens.reduce((s, i) => s + i.qtd, 0);
  const badge = document.getElementById("badge-carrinho");
  badge.textContent = qtdTotal;
  badge.hidden = qtdTotal === 0;
  atualizarBotoes();

  const box = document.getElementById("carrinho-itens");
  document.getElementById("carrinho-rodape").hidden = itens.length === 0;
  if (!itens.length) {
    box.innerHTML = `<p class="vazio">Teu carrinho está vazio.<br>Dá uma olhada nos acessórios 😉</p>`;
    return;
  }
  box.innerHTML = itens
    .map(({ p, qtd }) => `<div class="item">
        <img src="img/${p.foto}" alt="">
        <div class="item-info">
          <strong>${p.nome}</strong>
          <span>${p.preco == null ? "Consulte" : (p.aPartir ? "a partir de " : "") + brl(precoUnit(p, qtd) * qtd)}</span>
          <div class="qtd">
            <button data-menos="${p.id}" aria-label="Diminuir">−</button><b>${qtd}</b><button data-mais="${p.id}" aria-label="Aumentar">+</button>
          </div>
        </div>
      </div>`)
    .join("");
  const total = itens.reduce((s, { p, qtd }) => s + (p.preco == null ? 0 : precoUnit(p, qtd) * qtd), 0);
  document.getElementById("carrinho-total").textContent = brl(total);
}

function mensagemPedido() {
  const nome = document.getElementById("carrinho-nome").value.trim();
  const itens = itensPedido();
  const linhas = itens.map(({ p, qtd }) => {
    const valor = p.preco == null ? "consultar" : (p.aPartir ? "a partir de " : "") + brl(precoUnit(p, qtd) * qtd);
    return `• ${qtd}x ${p.nome} — ${valor}`;
  });
  const total = itens.reduce((s, { p, qtd }) => s + (p.preco == null ? 0 : precoUnit(p, qtd) * qtd), 0);
  return [
    `Oi, Rafa!${nome ? ` Aqui é ${nome}.` : ""} Montei um pedido pelo site:`,
    "",
    ...linhas,
    "",
    `Total estimado: ${brl(total)}`,
    "",
    "Tem disponível? Como fica o pagamento?",
  ].join("\n");
}

const carrinho = document.getElementById("carrinho");
const fundo = document.getElementById("fundo-carrinho");
function abrirCarrinho(abrir) {
  carrinho.classList.toggle("aberto", abrir);
  carrinho.setAttribute("aria-hidden", String(!abrir));
  fundo.hidden = !abrir;
  document.body.classList.toggle("travado", abrir);
}

document.addEventListener("click", (e) => {
  const add = e.target.closest("[data-add]");
  if (add) return adicionar(add.dataset.add);
  const mais = e.target.closest("[data-mais]");
  if (mais) return mudarQtd(mais.dataset.mais, 1);
  const menos = e.target.closest("[data-menos]");
  if (menos) return mudarQtd(menos.dataset.menos, -1);
});
document.getElementById("abrir-carrinho").addEventListener("click", () => abrirCarrinho(true));
document.getElementById("fechar-carrinho").addEventListener("click", () => abrirCarrinho(false));
fundo.addEventListener("click", () => abrirCarrinho(false));
document.addEventListener("keydown", (e) => { if (e.key === "Escape") abrirCarrinho(false); });
document.getElementById("enviar-pedido").addEventListener("click", () => {
  window.open(linkWhats(mensagemPedido()), "_blank", "noopener");
});

// ---------- Carrossel ----------
function iniciarCarrossel() {
  const trilho = document.getElementById("carrossel");
  const pontos = document.getElementById("pontos");
  trilho.innerHTML = CARROSSEL.map((s) => `<figure class="slide">
      <img src="img/${s.foto}" alt="${s.titulo}" loading="lazy">
      <figcaption><strong>${s.titulo}</strong><span>${s.texto}</span>
        ${s.produto ? (vaiProCarrinho(porId(s.produto)) ? `<button class="btn btn-sm" data-add="${s.produto}">Adicionar ao carrinho</button>` : botaoNegociar(porId(s.produto), "btn-sm")) : ""}
      </figcaption>
    </figure>`).join("");
  pontos.innerHTML = CARROSSEL.map((_, i) => `<button aria-label="Ir para foto ${i + 1}" data-i="${i}"></button>`).join("");

  const slides = [...trilho.children];
  const irPara = (i) => {
    const alvo = slides[(i + slides.length) % slides.length];
    trilho.scrollTo({ left: alvo.offsetLeft, behavior: "smooth" });
  };
  const atual = () => {
    let melhor = 0, dist = Infinity;
    slides.forEach((s, i) => {
      const d = Math.abs(s.offsetLeft - trilho.scrollLeft);
      if (d < dist) { dist = d; melhor = i; }
    });
    return melhor;
  };
  const marcar = () => {
    const a = atual();
    [...pontos.children].forEach((p, i) => p.classList.toggle("ativo", i === a));
  };
  trilho.addEventListener("scroll", () => requestAnimationFrame(marcar), { passive: true });
  pontos.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) irPara(+b.dataset.i); });
  document.getElementById("seta-ant").addEventListener("click", () => irPara(atual() - 1));
  document.getElementById("seta-prox").addEventListener("click", () => {
    const fim = trilho.scrollLeft + trilho.clientWidth >= trilho.scrollWidth - 4;
    irPara(fim ? 0 : atual() + 1);
  });
  marcar();

  // passa sozinho, pausa quando a pessoa mexe
  let pausado = false;
  ["pointerenter", "touchstart", "focusin"].forEach((ev) => trilho.addEventListener(ev, () => (pausado = true), { passive: true }));
  ["pointerleave", "focusout"].forEach((ev) => trilho.addEventListener(ev, () => (pausado = false)));
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    setInterval(() => { if (!pausado && !document.hidden) document.getElementById("seta-prox").click(); }, 4500);
  }
}

// ---------- Loja aberta agora? ----------
function statusLoja() {
  const agora = new Date();
  const dia = agora.getDay();
  const min = agora.getHours() * 60 + agora.getMinutes();
  const diaUtil = dia >= 1 && dia <= 5;
  const aberto = diaUtil && min >= 7 * 60 + 30 && min < 17 * 60;
  const el = document.getElementById("status-loja");
  el.classList.toggle("fechado", !aberto);
  el.textContent = aberto
    ? "Aberto agora · até 17h"
    : "Fechado agora · seg a sex, das 7h30 às 17h";
  const linha = document.querySelector(`#horarios tr[data-dia="${dia}"]`);
  if (linha) linha.classList.add("hoje");
}

// ---------- Links ----------
document.querySelectorAll("[data-whats]").forEach((a) => {
  a.href = linkWhats("Oi, Rafa! Vim pelo site e queria saber mais sobre os barcos e acessórios.");
});
document.querySelectorAll("[data-rede]").forEach((a) => {
  const url = REDES[a.dataset.rede];
  if (!url) return a.remove();
  a.href = url;
});
document.getElementById("ano").textContent = new Date().getFullYear();

renderGrandes();
renderCatalogo();
iniciarCarrossel();
renderPedido();
statusLoja();
