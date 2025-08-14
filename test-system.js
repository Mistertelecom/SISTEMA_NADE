#!/usr/bin/env node

/**
 * Script de teste básico para verificar se o sistema está funcionando
 */

const http = require('http');
const https = require('https');

const BASE_URL = 'http://localhost:3001';

// Função para fazer requisições HTTP
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = {
            status: res.statusCode,
            headers: res.headers,
            data: res.headers['content-type']?.includes('application/json') ? JSON.parse(data) : data
          };
          resolve(result);
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.on('error', reject);
    req.end();
  });
}

// Testes básicos
async function runTests() {
  console.log('🧪 Iniciando testes do sistema...\n');

  // Teste 1: Página inicial
  try {
    console.log('📋 Teste 1: Verificando página inicial...');
    const homeResponse = await makeRequest(BASE_URL);
    if (homeResponse.status === 200) {
      console.log('✅ Página inicial carregou corretamente (Status: 200)');
    } else if (homeResponse.status === 302 || homeResponse.status === 307) {
      console.log('✅ Redirecionamento funcionando (Status: ' + homeResponse.status + ')');
    } else {
      console.log('⚠️ Página inicial retornou status:', homeResponse.status);
    }
  } catch (error) {
    console.log('❌ Erro ao acessar página inicial:', error.message);
  }

  // Teste 2: Página de login
  try {
    console.log('\n📋 Teste 2: Verificando página de login...');
    const loginResponse = await makeRequest(BASE_URL + '/login');
    if (loginResponse.status === 200) {
      console.log('✅ Página de login carregou corretamente');
    } else {
      console.log('⚠️ Página de login retornou status:', loginResponse.status);
    }
  } catch (error) {
    console.log('❌ Erro ao acessar página de login:', error.message);
  }

  // Teste 3: API Health Check (sem autenticação)
  try {
    console.log('\n📋 Teste 3: Verificando saúde da API...');
    const apiResponse = await makeRequest(BASE_URL + '/api/dashboard/stats');
    if (apiResponse.status === 401) {
      console.log('✅ API funcionando - autenticação requerida (Status: 401)');
    } else if (apiResponse.status === 200) {
      console.log('✅ API funcionando - dados retornados (Status: 200)');
    } else {
      console.log('⚠️ API retornou status inesperado:', apiResponse.status);
    }
  } catch (error) {
    console.log('❌ Erro ao acessar API:', error.message);
  }

  // Teste 4: Verificar se assets CSS/JS carregam
  try {
    console.log('\n📋 Teste 4: Verificando assets estáticos...');
    const faviconResponse = await makeRequest(BASE_URL + '/favicon.ico');
    if (faviconResponse.status === 200 || faviconResponse.status === 404) {
      console.log('✅ Servidor de assets funcionando');
    } else {
      console.log('⚠️ Assets retornaram status:', faviconResponse.status);
    }
  } catch (error) {
    console.log('❌ Erro ao acessar assets:', error.message);
  }

  console.log('\n🎯 Resumo dos testes:');
  console.log('- Se todos os testes passaram, o sistema está funcionando');
  console.log('- Status 200: OK');
  console.log('- Status 401: API protegida (correto)');
  console.log('- Status 302/307: Redirecionamento (correto)');
  console.log('\n📱 Para testar completamente:');
  console.log('1. Abra http://localhost:3001 no navegador');
  console.log('2. Faça login com credenciais de admin');
  console.log('3. Teste criar uma nova ocorrência NADE');
  console.log('4. Teste a função de impressão');
}

runTests().catch(console.error);