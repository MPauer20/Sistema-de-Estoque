const express = require('express');
const app = express();

app.use(express.json());

app.listen(3000);


     

app.get('/cadastro', (req, res) => {
    res.sendFile(__dirname + '/ui/cadastro.html')
})

app.post('/estoque', (req, res) => {
    res.sendFile(__dirname + '/ui/estoque.html')
})

app.post('/index', (req, res) => {
    res.sendFile(__dirname + '/ui/index.html')
})