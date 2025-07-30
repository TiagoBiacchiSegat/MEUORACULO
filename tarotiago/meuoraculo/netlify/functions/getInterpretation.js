// Importa o 'fetch' para fazer requisições HTTP, necessário no ambiente do Node.js
import fetch from 'node-fetch';

// Esta é a função principal que o Netlify vai executar
exports.handler = async function(event, context) {
    // Pega os dados das cartas que o aplicativo enviou
    const { cards } = JSON.parse(event.body);
    const [card1, card2, card3] = cards;

    // Pega a chave secreta da API que configuramos no Netlify
    const apiKey = process.env.GEMINI_API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    // Monta o prompt para a IA, exatamente como antes
    const prompt = `
        Você é um tarólogo experiente, sábio e acolhedor. Faça uma interpretação de uma tiragem de 3 cartas (Passado, Presente, Futuro) em português do Brasil.

        A carta do Passado é **${card1.name}**, que significa: "${card1.meaning}".
        A carta do Presente é **${card2.name}**, que significa: "${card2.meaning}".
        A carta do Futuro é **${card3.name}**, que significa: "${card3.meaning}".

        Crie uma interpretação fluida e conectada que conte uma história sobre a jornada do consulente. Comece analisando o passado, conecte com o momento presente e projete o futuro. Use uma linguagem inspiradora e clara. Não liste os significados, mas incorpore-os na narrativa. Termine com um conselho encorajador.
    `;

    const payload = {
        contents: [{
            role: "user",
            parts: [{ text: prompt }]
        }]
    };

    try {
        // Faz a chamada para a API do Gemini
        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!apiResponse.ok) {
            throw new Error(`API error: ${apiResponse.statusText}`);
        }

        const result = await apiResponse.json();
        const interpretation = result.candidates[0].content.parts[0].text;

        // Retorna a interpretação com sucesso para o aplicativo
        return {
            statusCode: 200,
            body: JSON.stringify({ interpretation: interpretation })
        };

    } catch (error) {
        console.error("Error in Netlify function:", error);
        // Retorna uma mensagem de erro se algo der errado
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to get interpretation from the oracle." })
        };
    }
};

