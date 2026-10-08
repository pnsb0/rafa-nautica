// CONFIGURAÇÃO
const WHATSAPP = "5567999379529"; // 55 + DDD + número do Rafa (confirmado no Instagram da loja)
const REDES = {
  instagram: "https://www.instagram.com/rafanautica/",
  facebook: "",  // colar o link da página quando tiver (vazio = o botão some)
  linkedin: "",  // idem
};

const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const linkWhats = (msg) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
const porId = (id) => PRODUTOS.find((p) => p.id === id);

// ---------- Vitrine ----------
function precoHTML(p) {
  if (p.preco == null) return `<p class="preco">Consulte o preço</p>`;
  const de = p.precoDe ? `<s>${brl(p.precoDe)}</s>` : "";
  const ap = p.aPartir ? `<small>a partir de</small>` : "";
  return `<p class="preco">${de}${ap}${brl(p.preco)}</p>`;
}

function renderCatalogo(filtro) {
  const lista = filtro === "Todos" ? PRODUTOS : PRODUTOS.filter((p) => p.categoria === filtro);
  document.getElementById("grade").innerHTML = lista
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
            <button class="btn btn-sm" data-add="${p.id}">Adicionar ao pedido</button>
            <a class="link-whats" target="_blank" rel="noopener"
              href="${linkWhats(`Oi, Rafa! Vi no site o ${p.nome} e fiquei interessado. Pode me passar mais detalhes?`)}">Perguntar no WhatsApp</a>
          </div>
        </div>
      </article>`)
    .join("");
}

function renderFiltros() {
  const cats = ["Todos", ...new Set(PRODUTOS.map((p) => p.categoria))];
  const box = document.getElementById("filtros");
  box.innerHTML = cats
    .map((c, i) => `<button class="filtro${i === 0 ? " ativo" : ""}" data-cat="${c}">${c}</button>`)
    .join("");
  box.addEventListener("click", (e) => {
    const b = e.target.closest(".filtro");
    if (!b) return;
    box.querySelectorAll(".filtro").forEach((x) => x.classList.toggle("ativo", x === b));
    renderCatalogo(b.dataset.cat);
  });
}

// ---------- Pedido (carrinho) ----------
let pedido = {}; // { id: quantidade }
try { pedido = JSON.parse(localStorage.getItem("rafa-pedido")) || {}; } catch (e) { pedido = {}; }
const salvar = () => { try { localStorage.setItem("rafa-pedido", JSON.stringify(pedido)); } catch (e) {} };

const precoUnit = (p, qtd) => (p.atacado && qtd >= p.atacado.min ? p.atacado.preco : p.preco);
const itensPedido = () => Object.entries(pedido).map(([id, qtd]) => ({ p: porId(id), qtd })).filter((i) => i.p);

function avisar(txt) {
  const t = document.getElementById("toast");
  t.textContent = txt;
  t.classList.add("ver");
  clearTimeout(avisar.timer);
  avisar.timer = setTimeout(() => t.classList.remove("ver"), 2200);
}

function adicionar(id) {
  pedido[id] = (pedido[id] || 0) + 1;
  salvar();
  renderPedido();
  avisar(`${porId(id).nome} foi pro pedido`);
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

  const box = document.getElementById("carrinho-itens");
  document.getElementById("carrinho-rodape").hidden = itens.length === 0;
  if (!itens.length) {
    box.innerHTML = `<p class="vazio">Teu pedido está vazio.<br>Escolhe alguma coisa na vitrine 😉</p>`;
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
        ${s.produto ? `<button class="btn btn-sm" data-add="${s.produto}">Adicionar ao pedido</button>` : ""}
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

renderFiltros();
renderCatalogo("Todos");
renderPedido();
iniciarCarrossel();
statusLoja();
