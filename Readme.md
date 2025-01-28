# Projeto de Integração de APIs com Node.js

## Descrição
Este projeto consiste em uma aplicação Node.js que consome duas APIs externas (OpenWeather API e Yelp API) para processar informações sobre o clima e recomendar restaurantes com base nas condições meteorológicas de uma cidade. A aplicação armazena os resultados consolidando o clima com sugestões de restaurantes em uma base de dados Supabase. Além disso, a aplicação foi containerizada com Docker e publicada no Docker Hub.

## Funcionalidades
- Consulta de dados meteorológicos da OpenWeather API.
- Consulta de restaurantes próximos à localização da cidade via Yelp API.
- Processamento dos dados para combinar o clima e uma sugestão de restaurante (ex: restaurante com esplanada em dias de sol).
- Armazenamento dos dados consolidados em uma base de dados Supabase, incluindo:
  - IP do usuário que fez a requisição.
  - Timestamp (data e hora) da requisição.
- A aplicação foi executada em um container Docker e publicada no Docker Hub.

## Tecnologias Utilizadas
- **Node.js** 
- **Express.js** 
- **OpenWeather API** 
- **Yelp API** 
- **Supabase** 
- **Docker** 

## Requisitos
- **Node.js** e **npm** instalados.
- **Docker** instalado para rodar a aplicação em contêiner.
- Conta no **Supabase** para configurar a base de dados.

## Como Executar o Projeto

### 1. Instalação das Dependências

Clone este repositório:

```bash
git clone https://github.com/KalliSmb/gastronomia-clima
cd <diretório-do-repositório>
```

Instale as dependências com o npm:

```bash
npm install
```

### 2. Configuração do Supabase
1. Crie um projeto no Supabase.
2. Crie uma tabela chamada `requisicoes` com as seguintes colunas:
   * `id` (int4, auto-increment)
   * `cidade` (text)
   * `data_hora_pesquisada` (timestamp)
   * `raio` (int4)
   * `especialidade` (varchar)
   * `temperatura` (float8)
   * `descricao_clima` (varchar)
   * `ip_solicitante` (varchar)
   * `timestamp_requisicao` (timestamp)
   * `nomes_restaurantes` (text[])
3. Gere sua chave de API do Supabase e adicione-a ao ficheiro `.env`:

```env
SUPABASE_URL=<sua-url-do-supabase>
SUPABASE_KEY=<sua-chave-do-supabase>
```

### 3. Configuração das APIs Externas
1. **OpenWeather API**: Crie uma conta e obtenha uma chave de API em OpenWeather.
2. **Yelp API**: Crie uma conta e obtenha uma chave de API em Yelp Fusion.
Adicione essas chaves ao ficheiro `.env`:

```env
OPENWEATHER_API_KEY=<sua-chave-do-openweather>
YELP_API_KEY=<sua-chave-do-yelp>
```

### 4. Executando o Projeto
Para rodar a aplicação localmente, use:

```bash
npm start
```

A aplicação estará disponível em http://localhost:3000.

### 5. Executando com Docker
Para rodar a aplicação em um container Docker, execute os seguintes comandos:

1. **Build da Imagem Docker**:
```bash
docker-compose up --build
```

2. **Execução do Container**:
```bash
docker run -p 3000:3000 <nome-da-imagem>
```

3. **Publicação no Docker Hub**:
```bash
docker tag <nome-da-imagem> <seu-usuario>/<nome-do-repositório>:<tag>
docker push <seu-usuario>/<nome-do-repositório>:<tag>
```
