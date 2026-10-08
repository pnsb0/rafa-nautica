// Catálogo da Rafa Náutica — produtos e preços tirados dos posts do Instagram @rafanautica (out/2026).
// Pra adicionar/trocar um produto, edite esta lista. Fotos ficam em img/.
// id: único, sem espaço · categoria: vira botão de filtro · preco: número em reais (ou null = "Consulte")
// aPartir: true mostra "a partir de" · precoDe: preço antigo riscado (opcional)
// atacado: { min, preco } preço por unidade quando leva "min" ou mais (opcional) · extra: linha curta embaixo do preço
const PRODUTOS = [
  {
    id: "kit-mercury-15", nome: "Barco semichato 6 m + carretinha + Mercury 15/18 HP", categoria: "Barcos",
    desc: "Kit completo e pronto pra navegar: barco, carretinha com alongador, rodas novas, LED e motor Mercury novo.",
    preco: 25380, aPartir: true, extra: "Zero hora · pronto pra emplacar", foto: "ig-kit-mercury-15.jpg",
  },
  {
    id: "proboat-6m", nome: "Pro Boat 6 metros", categoria: "Barcos",
    desc: "Alumínio de qualidade e estrutura reforçada. Serve pra pesca, lazer e trabalho.",
    preco: 9250, aPartir: true, extra: "À pronta entrega", foto: "ig-proboat-6m.jpg",
  },
  {
    id: "mercury-30", nome: "Motor de popa Mercury 30 HP", categoria: "Motores",
    desc: "2 tempos, partida elétrica e 3 anos de garantia. Bom pra pesca e passeio.",
    preco: 17999, precoDe: 20990, extra: "Até 18x no cartão (com taxa da máquina)", foto: "ig-mercury-30.jpg",
  },
  {
    id: "yamaha-15", nome: "Motor de popa Yamaha 15 HP", categoria: "Motores",
    desc: "Ano 2014, 15 HP. Chama no WhatsApp pra saber mais ou vem ver de perto.",
    preco: 7500, foto: "ig-yamaha-15.jpg",
  },
  {
    id: "phantom-54", nome: "Motor elétrico Phantom 54 lbs", categoria: "Motores",
    desc: "Motor elétrico zero na caixa, pra quem curte pescar de barco.",
    preco: 1449, extra: "À vista · ou até 12x no cartão", foto: "ig-motor-phantom.jpg",
  },
  {
    id: "churrasqueira-bafinho", nome: "Churrasqueira Bafinho inox nº01", categoria: "Acessórios",
    desc: "Churrasqueira pra barco em aço inox 430, 40x25 cm. Compacta, leve e fácil de levar.",
    preco: 349.9, precoDe: 399, extra: "Até 15x no cartão (com taxa da máquina)", foto: "ig-churrasqueira.jpg",
  },
  {
    id: "gas-fogareiro", nome: "Gás para fogareiro 400 ml", categoria: "Acessórios",
    desc: "Cartucho Etaniz 227 g. Pra camping, pesca, trilha e uso geral.",
    preco: 17.9, atacado: { min: 4, preco: 14.99 }, extra: "Levando 4 ou mais: R$ 14,99 cada", foto: "ig-gas.jpg",
  },
];

// Fotos do carrossel (img/ + legenda)
const CARROSSEL = [
  { foto: "fachada.webp", titulo: "Nossa loja", texto: "Letreiro azul aceso no Solar do Vale" },
  { foto: "ig-barcos-entrega.jpg", titulo: "Barcos à pronta entrega", texto: "Vem fazer seu orçamento" },
  { foto: "ig-kit-mercury-15.jpg", titulo: "Kit completo", texto: "Barco + carretinha + Mercury", produto: "kit-mercury-15" },
  { foto: "ig-proboat-6m.jpg", titulo: "Pro Boat 6 metros", texto: "A partir de R$ 9.250", produto: "proboat-6m" },
  { foto: "ig-mercury-30.jpg", titulo: "Mercury 30 HP", texto: "Promoção com 3 anos de garantia", produto: "mercury-30" },
  { foto: "ig-loja-sorteio.webp", titulo: "Inauguração", texto: "Rafa Náutica chegou no Solar do Vale" },
  { foto: "ig-churrasqueira.jpg", titulo: "Churrasqueira pra barco", texto: "Inox, por R$ 349,90", produto: "churrasqueira-bafinho" },
];
