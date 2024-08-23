# Backend - PDF Genius

## Descrição

Este é o backend do PDF Genius, uma API construída com Nest.js. Ela permite o upload de arquivos PDF, processa o texto usando `pdf-parse`, e utiliza o Pinecone para indexar e armazenar embeddings gerados pela OpenAI.

## Tecnologias

- Nest.js
- Pinecone
- OpenAI
- Multer (para upload de arquivos)
- TypeScript

## Instalação

1. **Instale as dependências:**

   ```bash
   npm install
   ```

2. **Configuração do Ambiente:**

   Crie um arquivo `.env` na raiz da pasta `backend/` com as seguintes variáveis:

   ```bash
   OPENAI_API_KEY=your_openai_api_key
   PINECONE_API_KEY=your_pinecone_api_key
   PINECONE_INDEX_NAME=pdf-genius-index
   ```

3. **Inicie o servidor:**

   ```bash
   npm run start
   ```

## Scripts Disponíveis

- `npm run start`: Inicia o servidor Nest.js em modo de produção.
- `npm run start:dev`: Inicia o servidor Nest.js em modo de desenvolvimento.
- `npm run test`: Executa os testes.

## Estrutura do Código

- `src/app.controller.ts`: Controlador principal que lida com o upload de PDF e as interações com a OpenAI.
- `src/app.module.ts`: Módulo principal que importa todos os outros módulos e serviços necessários.
- `src/app.service.ts`: Serviço principal que pode conter lógica de negócio.
- `src/main.ts`: Ponto de entrada da aplicação.

## Licença

MIT License
