// Função para selecionar cores e ícones baseados no clima
function getClimaEstilos(descricao) {
    descricao = descricao.toLowerCase();
    
    if (descricao.includes('chuva')) {
        return {
            icone: '🌧️',
            backgroundColor: 'linear-gradient(to right, #5D6D7E, #2E4053)',
            textColor: '#D6DBDF'
        };
    }
    
    if (descricao.includes('nuvem')) {
        return {
            icone: '☁️',
            backgroundColor: 'linear-gradient(to right, #85C1E9, #5DADE2)',
            textColor: 'white'
        };
    }
    
    if (descricao.includes('sol')) {
        return {
            icone: '☀️', 
            backgroundColor: 'linear-gradient(to right, #F4D03F, #F39C12)',
            textColor: 'white'
        };
    }
    
    if (descricao.includes('neve')) {
        return {
            icone: '❄️',
            backgroundColor: 'linear-gradient(to right, #D5DBDB, #85929E)',
            textColor: '#2C3E50'
        };
    }
    
    // Clima padrão
    return {
        icone: '🌤️',
        backgroundColor: 'linear-gradient(to right, #AED6F1, #5DADE2)',
        textColor: 'white'
    };
}

document.addEventListener('DOMContentLoaded', () => {
    const resultadoDiv = document.getElementById('resultado');
    const dataHoraInput = document.getElementById('dataHora');
    const agora = new Date();

    // Remove segundos e milissegundos
    agora.setSeconds(0);
    agora.setMilliseconds(0);

    // Ajusta para o próximo minuto
    agora.setMinutes(agora.getMinutes() + 1);

    // Formata a data e hora atuais para o formato ISO
    const dataHoraAtual = agora.toISOString().slice(0, 16);

    // Calcula 7 dias no futuro
    const seteDiasFuturo = new Date(agora);
    seteDiasFuturo.setDate(seteDiasFuturo.getDate() + 7);

    // Formata a data máxima para o campo datetime-local
    const dataHoraMaxima = seteDiasFuturo.toISOString().slice(0, 16);

    // Define os atributos min e max no campo de data e hora
    dataHoraInput.setAttribute('min', dataHoraAtual);
    dataHoraInput.setAttribute('max', dataHoraMaxima);

    // Esconde a área de resultado até que o formulário seja enviado
    resultadoDiv.style.display = 'none';
});


document.getElementById('formulario-recomendacao').addEventListener('submit', async (event) => {
    event.preventDefault();

    const resultadoDiv = document.getElementById('resultado');
    const cidade = document.getElementById('cidade').value;
    const raio = document.getElementById('raio').value;
    const especialidade = document.getElementById('especialidade').value;
    const dataHora = document.getElementById('dataHora').value;

    // Verifica se dataHora está preenchido
    if (!dataHora) {
        alert('Por favor, insira uma data e hora válida.');
        return;
    }

    const data = new Date(dataHora);
    const agora = new Date();

    // Verifica se a data é no passado
    if (data < agora) {
        alert('A data e hora não podem ser no passado.');
        return;
    }

    const dataLocalISO = new Date(data.getTime() - data.getTimezoneOffset() * 60000).toISOString();
    const url = `/recomendacao/${cidade}/${raio}/${especialidade}/${encodeURIComponent(dataLocalISO)}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Erro ao obter dados da recomendação.');
        }

        const data = await response.json();

        if (!data.clima || !data.restaurantes) {
            throw new Error('Dados incompletos na resposta da API.');
        }

        const climaEstilos = getClimaEstilos(data.clima.descricao);

        // Exibe o clima
        const climaDiv = document.getElementById('clima');
        climaDiv.innerHTML = `
            <div class="weather-icon" style="color: ${climaEstilos.textColor}">${climaEstilos.icone}</div>
            <div class="weather-details">
                <h3>${data.clima.cidade}</h3>
                <p>Estão ${data.clima.temperatura}°C</p>
                <p>Está ${data.clima.descricao}</p>
            </div>
        `;
        climaDiv.style.background = climaEstilos.backgroundColor;

        // Exibe os restaurantes
        const restaurantesDiv = document.getElementById('restaurantes');
        restaurantesDiv.innerHTML = data.restaurantes.length > 0 
            ? data.restaurantes.map(restaurante => `
                <div class="restaurant-card">
                    <img src="${restaurante.foto}" alt="${restaurante.nome}">
                    <div class="restaurant-details">
                        <h3>${restaurante.nome}</h3>
                        <p>⭐ ${restaurante.avaliacao}/5 (${restaurante.avaliacoes} avaliações)</p>
                        <p>💰 ${restaurante.preco}</p>
                        <p>📍 ${restaurante.endereco}</p>
                        <p>🏷️ ${restaurante.categorias}</p>
                        <p>📞 ${restaurante.telefone}</p>
                        <a href="${restaurante.yelpUrl}" target="_blank" class="yelp-link">Ver no Yelp</a>
                    </div>
                </div>
            `).join('') 
            : '<p>Nenhum restaurante encontrado</p>';

        // Exibe a mensagem do clima
        const mensagemClimaElement = document.getElementById('mensagemClima');
        mensagemClimaElement.style.background = climaEstilos.backgroundColor;
        mensagemClimaElement.style.color = climaEstilos.textColor;
        mensagemClimaElement.textContent = data.mensagemClima || '';

        // Exibe a área de resultados
        resultadoDiv.style.display = 'block';

    } catch (error) {
        console.error('Erro:', error);
        alert('Ocorreu um erro ao obter a recomendação. Por favor, tente novamente.');
    }
});
