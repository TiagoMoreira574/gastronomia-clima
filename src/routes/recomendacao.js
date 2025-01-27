const axios = require('axios');
const express = require('express');
const router = express.Router();
const { criarConexaoSupabase } = require('../supabase');

// Função para obter o clima
async function obterClima(cidade, dataHora) {
    const chaveAPI = process.env.OPENWEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${cidade}&units=metric&lang=pt&appid=${chaveAPI}`;

    try {
        const resposta = await axios.get(url);
        const previsoes = resposta.data.list;
        const dataAlvo = new Date(dataHora).getTime();

        // Encontrar a previsão mais próxima
        const previsao = previsoes.reduce((maisProxima, atual) => {
            const tempoAtual = new Date(atual.dt * 1000).getTime();
            return Math.abs(tempoAtual - dataAlvo) <
                Math.abs(new Date(maisProxima.dt * 1000).getTime() - dataAlvo)
                ? atual
                : maisProxima;
        });

        return {
            cidade: resposta.data.city.name,
            temperatura: previsao.main.temp,
            descricao: previsao.weather[0].description,
            data: new Date(previsao.dt * 1000).toLocaleString('pt-PT'),
        };
    } catch (erro) {
        throw new Error('Erro ao buscar dados meteorológicos.');
    }
}

// Função para estimar o preço dos restaurantes
function estimarPreco(faixaPreco) {
    const precos = {
        '€': '10€',
        '€€': '20€',
        '€€€': '30€',
        '€€€€': '40€',
    };
    return precos[faixaPreco] || 'N/A';
}

// Função para obter restaurantes
async function obterRestaurantes(cidade, especialidade, raio, climaDescricao, dataHora) {
    const chaveAPI = process.env.YELP_API_KEY;
    if (!raio || isNaN(raio) || raio <= 0) throw new Error('Raio inválido.');

    let termo = especialidade === 'nenhuma' ? '' : `&term=${especialidade}`;
    if (climaDescricao.includes('sol')) termo += '&attributes=outdoor_seating';
    if (climaDescricao.includes('chuva')) termo += '&attributes=cozy';
    if (climaDescricao.includes('nuvens')) termo += '&attributes=indoor_seating';
    if (dataHora) {
        const data = new Date(dataHora);
        if (isNaN(data.getTime())) throw new Error('Data fornecida inválida.');
    }

    const url = `https://api.yelp.com/v3/businesses/search?location=${cidade}${termo}&radius=${raio * 1000}&dataHora=${encodeURIComponent(dataHora)}`;

    try {
        const resposta = await axios.get(url, {
            headers: { Authorization: `Bearer ${chaveAPI}` },
        });

        return resposta.data.businesses.map((restaurante) => ({
            nome: restaurante.name,
            avaliacao: restaurante.rating,
            preco: estimarPreco(restaurante.price),
            endereco: restaurante.location.address1,
            foto: restaurante.image_url,
            telefone: restaurante.display_phone || 'N/A',
            categorias: restaurante.categories.map((cat) => cat.title).join(', '),
            avaliacoes: restaurante.review_count,
            yelpUrl: restaurante.url,
        }));
    } catch (erro) {
        throw new Error('Erro ao buscar dados de restaurantes.');
    }
}

// Rota principal para recomendações
router.get('/:cidade/:raio/:especialidade/:data', async (req, res) => {
    const { cidade, raio, especialidade, data } = req.params;

    try {
        if (!cidade || !especialidade || !data) {
            return res.status(400).json({ erro: 'Cidade, especialidade e data são obrigatórios.' });
        }

        // Obter clima e mensagem personalizada
        const clima = await obterClima(cidade, data);
        const mensagemClima =
            clima.descricao.includes('sol') ? 'Recomendamos locais com esplanada!' :
            clima.descricao.includes('chuva') ? 'Talvez prefira locais acolhedores!' :
            clima.descricao.includes('nuvens') ? 'Sugestões de locais cobertos disponíveis!' :
            `O clima está ${clima.descricao}. Escolha à sua preferência!`;

        // Obter restaurantes
        const restaurantes = await obterRestaurantes(cidade, especialidade, raio, clima.descricao);

        // Salvar no Supabase
        const supabase = criarConexaoSupabase();
        const nomesRestaurantes = `{${restaurantes.map((r) => r.nome).join(', ')}}`;
        const { error } = await supabase.from('requisicoes').insert([{
            cidade,
            data_hora_pesquisada: data,
            raio,
            especialidade,
            temperatura: clima.temperatura,
            descricao_clima: clima.descricao,
            ip_solicitante: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            timestamp_requisicao: new Date().toISOString(),
            nomes_restaurantes: nomesRestaurantes,
        }]);

        if (error) return res.status(500).json({ erro: 'Erro ao salvar dados no Supabase.' });

        // Resposta final
        res.json({ clima, mensagemClima, restaurantes });
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    }
});


module.exports = router;
