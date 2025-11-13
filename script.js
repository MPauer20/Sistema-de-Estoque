// ajuste baseURL se necessário
const baseURL = 'http://localhost:3000';

async function fetchProdutos(){
  const r = await fetch(`${baseURL}/produtos`);
  return r.json();
}

async function fetchAlertas(){
  const r = await fetch(`${baseURL}/alertas`);
  return r.json();
}

async function carregarProdutosTabela(){
  const tbody = document.querySelector('#tblProdutos tbody');
  if(!tbody) return;
  const prods = await fetchProdutos();
  tbody.innerHTML = prods.map(p => `<tr>
    <td>${p.id}</td><td>${p.nome}</td><td>${p.estoque}</td><td>${p.estoque_minimo}</td>
    <td><button onclick="preencherMov(${p.id})">Selecionar</button></td>
  </tr>`).join('');
  const sel = document.getElementById('selProduto');
  if(sel){
    sel.innerHTML = prods.map(p => `<option value="${p.id}">${p.id} - ${p.nome}</option>`).join('');
  }
}

function preencherMov(id){
  const sel = document.getElementById('selProduto');
  if(sel) sel.value = id;
  window.scrollTo(0,document.body.scrollHeight);
}

async function cadastroHandler(e){
  e.preventDefault();
  const f = e.target;
  const data = {
    nome: f.nome.value,
    marca: f.marca.value,
    volume: f.volume.value,
    tipo_embalagem: f.tipo_embalagem.value,
    aplicacao: f.aplicacao.value,
    estoque: Number(f.estoque.value||0),
    estoque_minimo: Number(f.estoque_minimo.value||0)
  };
  const res = await fetch(`${baseURL}/produtos`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data)});
  const txt = document.getElementById('msg');
  if(res.ok){
    txt.innerText = 'Produto cadastrado com sucesso';
    f.reset();
  } else {
    const err = await res.json();
    txt.innerText = 'Erro: ' + (err.error || res.statusText);
  }
}

async function movimentoHandler(e){
  e.preventDefault();
  const f = e.target;
  const produto_id = Number(f.selProduto ? f.selProduto.value : (f.produto ? f.produto.value : 0));
  const tipo = f.tipo ? f.tipo.value : f.querySelector('[name=tipo]').value;
  const quantidade = Number(f.quantidade.value);
  const responsavel = f.responsavel ? f.responsavel.value : '';
  try {
    const url = tipo === 'entrada' ? '/estoque/entrada' : '/estoque/saida';
    const res = await fetch(baseURL + url, {
      method:'PUT',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ produto_id, quantidade, responsavel })
    });
    const txt = document.getElementById('msg');
    if(res.ok){
      txt.innerText = 'Movimento registrado';
      await carregarProdutosTabela();
    } else {
      const err = await res.json();
      txt.innerText = 'Erro: ' + (err.error || res.statusText);
    }
  } catch(err){
    document.getElementById('msg').innerText = 'Erro: ' + err.message;
  }
}

async function carregarAlertas(){
  const ul = document.getElementById('listaAlertas');
  if(!ul) return;
  const arr = await fetchAlertas();
  if(arr.length===0) ul.innerHTML = '<li>Nenhum alerta</li>';
  else ul.innerHTML = arr.map(p => `<li>${p.id} - ${p.nome} (estoque: ${p.estoque}, mínimo: ${p.estoque_minimo})</li>`).join('');
}

// Event binding para as páginas
document.addEventListener('DOMContentLoaded', ()=>{
  const formCad = document.getElementById('formCadastro');
  if(formCad) formCad.addEventListener('submit', cadastroHandler);

  const formMov = document.getElementById('formMovimento');
  if(formMov) formMov.addEventListener('submit', movimentoHandler);

  // carregar listas quando existirem
  carregarProdutosTabela();
  carregarAlertas();
});
