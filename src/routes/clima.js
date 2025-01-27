const axios = require("axios");
const express = require("express");
const router = express.Router();

// Função para obter o clima
async function obterClima(cidade, dataHora) {
  const chaveAPI = process.env.OPENWEATHER_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${cidade}&units=metric&lang=pt&appid=${chaveAPI}`;

  try {
    // Validação da cidade e dataHora
    if (!cidade || isNaN(new Date(dataHora).getTime())) {
      throw new Error("Parâmetros inválidos.");
    }

    const resposta = await axios.get(url);
    const previsoes = resposta.data.list;
    const dataAlvo = new Date(dataHora).getTime();

    // Encontrar a previsão mais próxima
    const previsao = previsoes.reduce((maisProxima, atual) => {
      const tempoAtual = new Date(atual.dt * 1000).getTime();
      return Math.abs(tempoAtual - dataAlvo) < Math.abs(new Date(maisProxima.dt * 1000).getTime() - dataAlvo)
        ? atual
        : maisProxima;
    });

    return {
      cidade: resposta.data.city.name,
      temperatura: previsao.main.temp,
      descricao: previsao.weather[0].description,
      data: new Date(previsao.dt * 1000).toLocaleString("pt-PT"),
    };
  } catch (erro) {
    throw new Error("Erro ao buscar dados meteorológicos.");
  }
}

// Rota para obter clima
router.get("/:cidade/:dataHora", async (req, res) => {
  const { cidade, dataHora } = req.params;

  try {
    const clima = await obterClima(cidade, dataHora);
    res.json(clima);
  } catch (erro) {
    const statusCode = erro.message === "Parâmetros inválidos." ? 400 : 500;
    res.status(statusCode).json({ erro: erro.message });
  }
});

module.exports = router;
