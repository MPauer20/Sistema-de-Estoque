// server.js
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

let nextId = 1;
const produtos = []; // { id, nome, marca, volume, tipo_embalagem, aplicacao, estoque, estoque_minimo }
const movimentos = []; // { id, produto_id, tipo: 'entrada'|'saida', quantidade, data, responsavel }

function findProduto(id){
  return produtos.find(p => p.id === Number(id));
}

// POST /produtos -> cadastrar produto
app.post('/produtos', (req,res) => {
  const {
    nome, marca, volume, tipo_embalagem, aplicacao,
    estoque = 0, estoque_minimo = 0
  } = req.body;
  if(!nome) return res.status(400).json({error: 'nome é obrigatório'});
  const p = { id: nextId++, nome, marca, volume, tipo_embalagem, aplicacao, estoque: Number(estoque), estoque_minimo: Number(estoque_minimo) };
  produtos.push(p);
  res.status(201).json(p);
});

// GET /produtos -> listar
app.get('/produtos', (req,res) => {
  res.json(produtos);
});

// PUT /estoque/entrada -> registrar entrada
app.put('/estoque/entrada', (req,res) => {
  const { produto_id, quantidade, responsavel } = req.body;
  if(!produto_id || !quantidade) return res.status(400).json({error:'produto_id e quantidade obrigatórios'});
  const p = findProduto(produto_id);
  if(!p) return res.status(404).json({error:'produto não encontrado'});
  const q = Number(quantidade);
  p.estoque += q;
  const m = { id: movimentos.length + 1, produto_id: p.id, tipo: 'entrada', quantidade: q, data: new Date().toISOString(), responsavel: responsavel || 'não informado' };
  movimentos.push(m);
  res.json({ produto: p, movimento: m });
});

// PUT /estoque/saida -> registrar saída
app.put('/estoque/saida', (req,res) => {
  const { produto_id, quantidade, responsavel } = req.body;
  if(!produto_id || !quantidade) return res.status(400).json({error:'produto_id e quantidade obrigatórios'});
  const p = findProduto(produto_id);
  if(!p) return res.status(404).json({error:'produto não encontrado'});
  const q = Number(quantidade);
  if(q > p.estoque) return res.status(400).json({error:'estoque insuficiente'});
  p.estoque -= q;
  const m = { id: movimentos.length + 1, produto_id: p.id, tipo: 'saida', quantidade: q, data: new Date().toISOString(), responsavel: responsavel || 'não informado' };
  movimentos.push(m);
  res.json({ produto: p, movimento: m });
});

// GET /alertas -> produtos abaixo do mínimo
app.get('/alertas', (req,res) => {
  const abaixo = produtos.filter(p => p.estoque <= p.estoque_minimo);
  res.json(abaixo);
});

// GET /movimentos -> histórico (opcional)
app.get('/movimentos', (req,res) => {
  res.json(movimentos);
});

// health
app.get('/', (req,res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`API rodando na porta ${PORT}`));
