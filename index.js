require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());

const climaRoutes = require('./src/routes/clima');
const recomendacaoRoutes = require('./src/routes/recomendacao');
const restaurantesRoutes = require('./src/routes/restaurantes');


app.use(express.static(path.join(__dirname, 'public')));

app.use('/clima', climaRoutes);
app.use('/recomendacao', recomendacaoRoutes);
app.use('/restaurantes', restaurantesRoutes);


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));  // Caminho para o 'index.html'
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor a correr em http://localhost:${PORT}`);
});
