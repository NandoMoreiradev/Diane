/* =====================================================================
   Dianê · configuração e cardápio (usado pelo site, pelo balcão e pelos QR)
   Edite aqui: preços, custos, sabores, WhatsApp e a conexão com o Firebase.
   Os preços e custos são sugestões: confirme com a ficha técnica e o contrato da máquina Nestlé.
   ===================================================================== */
window.CONFIG = {
  // WhatsApp da loja com DDI e DDD, só dígitos, ex.: '5579912345678'. Vazio = sem botão de WhatsApp.
  whatsapp: '',
  abre: 7, fecha: 17,              // horário
  diasAbertos: [1, 2, 3, 4, 5, 6], // 0 = domingo
  entrega: true,                   // mostra a opção "Entrega aqui perto"

  // Entrega: taxa por bairro (distância em linha reta até a loja, Av. Augusto Maynard, 201).
  // O cliente digita o CEP, o site acha o bairro e mostra a taxa. Bairro fora da lista = não entregamos.
  delivery: {
    pedidoMinimo: 25,      // só para entrega, sobre os produtos (sem a taxa). Retirada não tem mínimo.
    freteGratisAcima: 80,  // pedidos de produtos a partir deste valor não pagam taxa (0 = desliga)
    custoPorEntrega: 0,    // quanto a loja paga por corrida (motoboy). Entra como custo no DRE. 0 = não conta
    zonas: [
      { nome: "Pertinho", ate: "até 1,5 km", taxa: 4, prazo: "20 a 30 min",
        bairros: ["São José", "Centro", "Treze de Julho", "Salgado Filho", "Suíssa"] },
      { nome: "Perto", ate: "1,5 a 2,5 km", taxa: 6, prazo: "25 a 35 min",
        bairros: ["Cirurgia", "Grageru", "Getúlio Vargas", "Pereira Lobo", "Jardins", "Luzia"] },
      { nome: "Um pouco mais longe", ate: "2,5 a 3,8 km", taxa: 8, prazo: "30 a 45 min",
        bairros: ["Siqueira Campos", "Santo Antônio", "Industrial", "Ponto Novo", "Dezoito do Forte", "América", "Palestina", "Inácio Barbosa"] }
    ]
  },

  // Endereço público do site (para os QR Codes). Vazio = usa o endereço atual.
  urlSite: '',

  // A Dianê é takeaway: sem pedido pela mesa. Para voltar a ter QR por mesa, liste aqui, ex.: { n: 1, nome: 'Pátio' }.
  mesas: [],

  // Painel de resultado (DRE). Valores mensais em R$ e percentuais sobre a venda (mesmas premissas do estudo de viabilidade).
  dre: {
    custosFixos: [
      { nome: 'Colaborador (salário + encargos)', valor: 2200 },
      { nome: 'Aluguel', valor: 800 },
      { nome: 'Energia', valor: 700 },
      { nome: 'Cozinha de produção', valor: 400 },
      { nome: 'Marketing e Instagram', valor: 300 },
      { nome: 'Contador, internet, sistema, limpeza', valor: 650 }
    ],
    simples: 0.06,                                // imposto do Simples Nacional sobre a venda
    taxas: { 'Cartão': 0.025, 'Pix': 0, 'Dinheiro': 0 },
    perdas: 0.04,                                 // perdas e quebras sobre a venda (doces têm validade curta)
    diasAbertosNoMes: 24,
    reserva: 0.5,                                 // 1º ano: 50% do lucro fica no caixa
    socios: ['Sócia 1', 'Sócia 2']                // dividendos divididos meio a meio
  },

  // E-mails que veem a aba Resultado no painel (vazio = todos que entram no painel)
  emailsSocios: [],

  // Conexão com o Firebase (console.firebase.google.com → Configurações do projeto → Seus apps → Web).
  // Enquanto estiver null, o sistema roda em MODO DEMONSTRAÇÃO: os pedidos só chegam ao balcão
  // aberto no MESMO navegador e computador (ótimo para testar, não serve para a loja).
  firebase: null
};

// Sabores por grupo. Cada produto ou combo com "sabores" aponta para um grupo daqui.
window.SABORES = {
  brigadeiro: ['Tradicional', 'Ninho', 'Pistache', 'Morango', 'Churros', 'Café', 'Maracujá'],
  caixa: ['Sortida da casa', 'Clássicos (tradicional e ninho)', 'Frutados (morango, maracujá e pistache)', 'Escolho na observação'],
  bolo: ['Cenoura com brigadeiro', 'Chocolate com brigadeiro', 'Ninho com morango'],
  torta: ['Limão', 'Morango', 'Banoffee'],
  sanduiche: ['Frango com cenoura', 'Atum', 'Peito de peru com ricota', 'Caprese (vegetariano)'],
  frutales: ['Frutas do dia', 'Com granola e mel']
};
window.SABORES_NOME = { brigadeiro: 'Brigadeiro', caixa: 'Caixa', bolo: 'Bolo', torta: 'Torta', sanduiche: 'Sanduíche', frutales: 'Frutales' };

window.PRODUTOS = [
  // --- doces ---
  { id: 'brigadeiro', cat: 'doces', nome: 'Brigadeiro gourmet', desc: 'Feito à mão, na forminha. Escolha o sabor.', preco: 4.5, custo: 1.3, arte: 'brigadeiro', sabores: 'brigadeiro', tag: 'O da casa' },
  { id: 'caixa-4', cat: 'doces', nome: 'Caixa com 4', desc: 'Lembrancinha creme, lacrada com o selo da marca.', preco: 17, custo: 5.6, arte: 'caixa', sabores: 'caixa' },
  { id: 'caixa-6', cat: 'doces', nome: 'Caixa com 6', desc: 'Com cinta chocolate e o cartão "pra você".', preco: 25, custo: 8.4, arte: 'caixa', sabores: 'caixa' },
  { id: 'caixa-12', cat: 'doces', nome: 'Caixa com 12', desc: 'A caixa de presente: tampa caramelo e fundo chocolate.', preco: 48, custo: 16.5, arte: 'caixa', sabores: 'caixa', tag: 'Para presentear' },
  { id: 'caixa-25', cat: 'doces', nome: 'Caixa com 25', desc: 'Para a festa, a reunião ou a família toda.', preco: 95, custo: 33, arte: 'caixa', sabores: 'caixa' },
  { id: 'colher', cat: 'doces', nome: 'Brigadeiro de colher', desc: 'No pote de 150 ml, para comer devagar.', preco: 14, custo: 4.2, arte: 'pote' },
  { id: 'bolo', cat: 'doces', nome: 'Fatia de bolo', desc: 'Bolo com gosto de casa, na embalagem para levar.', preco: 12, custo: 3.6, arte: 'bolo', sabores: 'bolo' },
  { id: 'torta', cat: 'doces', nome: 'Fatia de torta', desc: 'A torta do dia, na embalagem para levar.', preco: 14, custo: 4.6, arte: 'torta', sabores: 'torta' },
  // --- lanches ---
  { id: 'pao', cat: 'lanches', nome: 'Pão de queijo mineiro', desc: 'Quentinho, saído do forno.', preco: 5, custo: 1.5, arte: 'pao', tag: 'Mais pedido' },
  { id: 'sanduiche', cat: 'lanches', nome: 'Sanduíche natural', desc: 'Pão macio, recheio leve e salada fresca. Escolha o sabor.', preco: 16, custo: 7, arte: 'sanduiche', sabores: 'sanduiche' },
  { id: 'frutales', cat: 'lanches', nome: 'Frutales', desc: 'Frutas frescas no copo de 400 ml, com tampa.', preco: 14, custo: 5.5, arte: 'frutales', sabores: 'frutales', tag: 'Novidade' },
  // --- cafés (máquina automática Nestlé, grãos moídos na hora) e bebidas ---
  { id: 'expresso', cat: 'cafes', nome: 'Expresso curto', desc: 'Curto e intenso. 80 ml.', preco: 6, custo: 1.3, arte: 'espresso' },
  { id: 'americano', cat: 'cafes', nome: 'Expresso americano', desc: 'Expresso com água quente. 200 ml.', preco: 7, custo: 1.4, arte: 'viagem' },
  { id: 'duplo', cat: 'cafes', nome: 'Expresso duplo', desc: 'Duas doses, para quem precisa. 120 ml.', preco: 9, custo: 2.4, arte: 'espresso' },
  { id: 'cafe-leite-p', cat: 'cafes', nome: 'Café com leite pequeno', desc: 'Cremoso, no copo de 200 ml.', preco: 6, custo: 1.6, arte: 'cappuccino' },
  { id: 'cafe-leite', cat: 'cafes', nome: 'Café com leite', desc: 'Cremoso, no copo de 300 ml.', preco: 9, custo: 2.4, arte: 'viagem' },
  { id: 'cappuccino', cat: 'cafes', nome: 'Cappuccino', desc: 'Café, leite e espuma cremosa. 200 ml.', preco: 10, custo: 2.5, arte: 'cappuccino' },
  { id: 'cappuccino-alpino', cat: 'cafes', nome: 'Cappuccino Alpino', desc: 'Cappuccino com chocolate Alpino. 200 ml.', preco: 12, custo: 3.2, arte: 'cappuccino' },
  { id: 'mokaccino', cat: 'cafes', nome: 'Mokaccino 2 Frades', desc: 'Café, chocolate 2 Frades e leite. 200 ml.', preco: 12, custo: 3.2, arte: 'cappuccino' },
  { id: 'choc-alpino', cat: 'cafes', nome: 'Achocolatado Alpino', desc: 'Chocolate quente cremoso. 200 ml.', preco: 10, custo: 2.8, arte: 'chocolate' },
  { id: 'choc-frades', cat: 'cafes', nome: 'Achocolatado 2 Frades', desc: 'Chocolate quente mais intenso. 200 ml.', preco: 10, custo: 2.8, arte: 'chocolate' },
  { id: 'kitkat', cat: 'cafes', nome: 'Kit Kat', desc: 'Bebida quente de chocolate com wafer. 200 ml.', preco: 13, custo: 3.6, arte: 'chocolate' },
  { id: 'agua', cat: 'cafes', nome: 'Água mineral', desc: 'Com ou sem gás. 500 ml.', preco: 4, custo: 1.5, arte: 'agua' },
  { id: 'refri', cat: 'cafes', nome: 'Refrigerante', desc: 'Lata de 350 ml.', preco: 7, custo: 3.5, arte: 'lata' }
];

// onde: "delivery" = no site (entrega e retirada). "mesa" só vale se houver mesas com QR.
// pessoas: para quantas pessoas o combo serve (o site agrupa por isso).
// sabores: o grupo de sabores que o cliente escolhe no combo.
const vezes = (id, n) => Array(n).fill(id);
window.COMBOS = [
  // --- 1 pessoa ---
  { id: "c-pausa", nome: "Pausa doce", desc: "Expresso curto + brigadeiro. O intervalo perfeito.", itens: ["expresso", "brigadeiro"], preco: 9.5, selo: "A qualquer hora", sabores: "brigadeiro", pessoas: 1, onde: ["delivery"] },
  { id: "c-manha", nome: "Manhã mineira", desc: "Café com leite + 2 pães de queijo.", itens: ["cafe-leite", "pao", "pao"], arte: ["viagem", "pao"], preco: 17, selo: "Manhã", pessoas: 1, onde: ["delivery"] },
  { id: "c-leve", nome: "Almoço leve", desc: "Sanduíche natural + Frutales. Leve e rápido.", itens: ["sanduiche", "frutales"], preco: 27, selo: "Almoço", sabores: "sanduiche", pessoas: 1, onde: ["delivery"] },
  // --- 2 pessoas ---
  { id: "c-cafe-2", nome: "Café a dois", desc: "2 cappuccinos + 4 pães de queijo + 2 brigadeiros.", itens: [...vezes("cappuccino", 2), ...vezes("pao", 4), ...vezes("brigadeiro", 2)], arte: ["cappuccino", "pao", "brigadeiro"], preco: 42, selo: "Manhã e tarde", sabores: "brigadeiro", pessoas: 2, onde: ["delivery"] },
  { id: "c-almoco-2", nome: "Almoço a dois", desc: "2 sanduíches naturais + 2 Frutales.", itens: [...vezes("sanduiche", 2), ...vezes("frutales", 2)], arte: ["sanduiche", "frutales"], preco: 54, selo: "Almoço", sabores: "sanduiche", pessoas: 2, onde: ["delivery"] },
  { id: "c-tarde-2", nome: "Tarde a dois", desc: "2 cappuccinos + 2 fatias de bolo.", itens: [...vezes("cappuccino", 2), ...vezes("bolo", 2)], arte: ["cappuccino", "bolo"], preco: 39, selo: "Tarde", sabores: "bolo", pessoas: 2, onde: ["delivery"] },
  // --- reuniões ---
  { id: "c-reuniao-6", nome: "Café da reunião", desc: "6 cafés com leite + 12 pães de queijo + 6 brigadeiros, na caixa de reunião.", itens: [...vezes("cafe-leite", 6), ...vezes("pao", 12), ...vezes("brigadeiro", 6)], arte: ["viagem", "pao", "brigadeiro"], preco: 129, selo: "Reunião", sabores: "brigadeiro", pessoas: 6, onde: ["delivery"] },
  { id: "c-lanche-6", nome: "Lanche da reunião", desc: "6 sanduíches + 12 pães de queijo + 6 cafés com leite + 6 brigadeiros.", itens: [...vezes("sanduiche", 6), ...vezes("pao", 12), ...vezes("cafe-leite", 6), ...vezes("brigadeiro", 6)], arte: ["sanduiche", "viagem", "brigadeiro"], preco: 210, selo: "Reunião", sabores: "sanduiche", pessoas: 6, onde: ["delivery"] },
  { id: "c-lanche-10", nome: "Reunião para 10", desc: "10 sanduíches + 20 pães de queijo + 10 cafés com leite + 10 brigadeiros.", itens: [...vezes("sanduiche", 10), ...vezes("pao", 20), ...vezes("cafe-leite", 10), ...vezes("brigadeiro", 10)], arte: ["sanduiche", "viagem", "brigadeiro"], preco: 340, selo: "Reunião", sabores: "sanduiche", pessoas: 10, onde: ["delivery"] },
  { id: "c-lanche-20", nome: "Reunião para 20", desc: "20 sanduíches + 40 pães de queijo + 20 cafés com leite + 20 brigadeiros.", itens: [...vezes("sanduiche", 20), ...vezes("pao", 40), ...vezes("cafe-leite", 20), ...vezes("brigadeiro", 20)], arte: ["sanduiche", "viagem", "brigadeiro"], preco: 660, selo: "Reunião", sabores: "sanduiche", pessoas: 20, onde: ["delivery"] }
];
