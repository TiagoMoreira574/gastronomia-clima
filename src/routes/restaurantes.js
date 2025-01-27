const express = require('express');
const axios = require('axios');
const router = express.Router();

// Rota principal para buscar restaurantes
router.get('/:cidade/:especialidade/:raio/:dataHora?', async (req, res) => {  // Agora o parâmetro dataHora é opcional
    const { cidade, especialidade, raio, dataHora } = req.params;
    const chaveAPI = process.env.YELP_API_KEY;

    if (!chaveAPI) {
        return res.status(500).json({ erro: 'Chave API do Yelp não configurada.' });
    }

    // Validar e converter a data, se fornecida
    let timestamp = null;
    if (dataHora) {
        const data = new Date(dataHora);
        if (isNaN(data.getTime())) {
            return res.status(400).json({ erro: 'Data fornecida inválida.' });
        }
        timestamp = Math.floor(data.getTime() / 1000); // Convertendo para timestamp UNIX (segundos)
    }

    try {
        const resposta = await axios.get('https://api.yelp.com/v3/businesses/search', {
            headers: {
                Authorization: `Bearer ${chaveAPI}`
            },
            params: {
                location: cidade,
                categories: especialidade === 'nenhuma' ? '' : especialidade,
                radius: raio * 1000,
                limit: 5,
                open_at: timestamp // Filtrar restaurantes abertos no horário especificado
            }
        });

        const restaurantes = resposta.data.businesses.map(r => ({
            nome: r.name,
            endereco: r.location.address1,
            avaliacao: r.rating,
            preco: r.price || 'N/A',
        }));

        res.json(restaurantes);
    } catch (erro) {
        console.error('Erro ao buscar restaurantes:', erro.message);
        res.status(500).json({ erro: 'Erro ao obter os restaurantes!' });
    }
});

module.exports = router;