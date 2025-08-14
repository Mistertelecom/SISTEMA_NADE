# 🏫 Sistema de Ocorrência Escolar - NADE

Sistema completo para registro e gestão de ocorrências escolares desenvolvido para o Núcleo de Apoio ao Desenvolvimento Educacional (NADE).

## 📋 Funcionalidades

- **👤 Autenticação**: Login seguro com NextAuth.js e recuperação de senha
- **👨‍🏫 Gestão de Usuários**: Administradores, Coordenadores e Professores
- **👨‍🎓 Cadastro de Alunos**: Gerenciamento completo de estudantes
- **📝 Registro de Ocorrências**: Sistema completo de ocorrências disciplinares
- **📊 Dashboard**: Estatísticas e relatórios em tempo real
- **📱 Design Responsivo**: Interface otimizada para desktop e mobile
- **🔒 Sistema de Logging**: Logging estruturado e seguro para produção

## 🚀 Tecnologias

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB, Mongoose
- **Autenticação**: NextAuth.js
- **UI/UX**: Lucide Icons, Design System customizado
- **Deploy**: Vercel
- **Tipagem**: TypeScript

## ⚙️ Configuração de Desenvolvimento

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Conta MongoDB Atlas

### Instalação

1. **Clone o repositório**:
```bash
git clone https://github.com/Mistertelecom/SISTEMA_NADE.git
cd SISTEMA_NADE
```

2. **Instale as dependências**:
```bash
npm install
```

3. **Configure variáveis de ambiente**:
```bash
cp .env.example .env.local
```

Configure no `.env.local`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sistema-nade
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3001
```

4. **Execute o seeding do banco**:
```bash
npm run seed
```

5. **Inicie o servidor de desenvolvimento**:
```bash
npm run dev
```

Abra [http://localhost:3001](http://localhost:3001) no seu navegador.

## 👤 Usuários Padrão

### Administrador
- **Email**: `admin@nade.com`
- **Senha**: `admin123`

### Professor
- **Email**: `professor@nade.com`
- **Senha**: `professor123`

### Coordenador
- **Email**: `coordenador@nade.com`
- **Senha**: `coord123`

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router do Next.js
│   ├── api/               # API Routes
│   ├── dashboard/         # Dashboard principal
│   ├── login/             # Autenticação
│   ├── occurrences/       # Gestão de ocorrências
│   ├── students/          # Gestão de alunos
│   └── settings/          # Configurações
├── components/            # Componentes React
│   └── ui/               # Componentes base
├── lib/                  # Utilitários e configurações
│   ├── auth.ts           # Configuração NextAuth
│   ├── logger.ts         # Sistema de logging
│   └── mongodb.ts        # Conexão MongoDB
├── models/               # Modelos Mongoose
└── types/                # Tipos TypeScript
```

## 🔒 Sistema de Logging

O sistema implementa logging estruturado e seguro:

- **Desenvolvimento**: Logs detalhados no console
- **Produção**: Sanitização automática de dados sensíveis
- **Contexto**: Logs incluem userId, método, URL e contexto relevante
- **Segurança**: Remove automaticamente senhas, tokens e dados sensíveis

## 📱 Deploy na Vercel

### Configuração Automática
1. Conecte seu repositório GitHub na Vercel
2. Configure as variáveis de ambiente no dashboard da Vercel:
   - `MONGODB_URI`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (URL de produção)

### Deploy Manual
```bash
npm run build
```

## 🛡️ Segurança

- **Autenticação**: JWT com NextAuth.js
- **Senhas**: Hash bcrypt (salt 12)
- **Logs**: Sanitização automática de dados sensíveis
- **Reset de Senha**: Tokens seguros SHA-256 com expiração
- **Proteção CSRF**: Proteção nativa do NextAuth.js

## 📈 Monitoramento

O sistema inclui:
- Logging estruturado para produção
- Tratamento de erros com contexto
- Métricas de performance
- Sistema de auditoria integrado

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte técnico ou dúvidas:
- Abra uma issue no GitHub
- Entre em contato com a equipe de desenvolvimento

---

**Desenvolvido por**: Y Software  
**Para**: NADE - Núcleo de Apoio ao Desenvolvimento Educacional
