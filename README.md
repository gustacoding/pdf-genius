# PDF Genius

## Descrição do Projeto

PDF Genius é uma aplicação full-stack desenvolvida utilizando **Node.js**, **Nest.js**, **Redis**, **Pinecone**, **OpenAI**, e **Next.js**. O objetivo da aplicação é permitir que os usuários façam upload de documentos PDF e façam perguntas sobre o conteúdo desses documentos. A aplicação utiliza inteligência artificial para responder as perguntas, mantendo um histórico de interações para fornecer respostas mais contextuais.

## Funcionalidades Principais

- **Upload de PDF**: Permite que o usuário faça upload de um documento PDF.
- **Extração de Texto**: O texto do PDF é extraído utilizando a biblioteca `pdf-parse`.
- **Armazenamento de Vetores**: As representações vetoriais (embeddings) do conteúdo do PDF são armazenadas no Pinecone para consultas futuras.
- **Integração com IA**: Utiliza o modelo GPT-3.5 da OpenAI para responder perguntas baseadas no conteúdo do PDF.
- **Histórico de Interações**: Mantém um registro de perguntas e respostas para melhorar o contexto nas respostas subsequentes.
- **Interface Web**: Desenvolvida com Next.js, a interface permite que o usuário interaja facilmente com a IA e visualize as respostas.

## Estrutura do Projeto

### Backend

O backend é implementado utilizando **Nest.js** e serve como a API que processa os PDFs, consulta o Pinecone, e se comunica com a OpenAI para gerar respostas.

- **src/app.controller.ts**: Controlador principal que gerencia o upload do PDF, processa a pergunta do usuário e retorna a resposta.
- **src/app.module.ts**: Módulo principal que importa as dependências do Nest.js.
- **src/main.ts**: Arquivo de bootstrap que inicializa a aplicação Nest.js.
- **Pinecone**: Utilizado para armazenar e consultar embeddings dos textos extraídos dos PDFs.
- **OpenAI**: Utilizado para gerar respostas baseadas no conteúdo do PDF e no histórico de interações.

### Frontend

O frontend é implementado utilizando **Next.js** e oferece uma interface interativa para os usuários.

- **src/app/page.tsx**: Componente principal que renderiza a interface do chat e o upload de arquivos.
- **src/app/Chat.tsx**: Componente de chat que gerencia a interação com a IA.
- **public/logo.png**: Logotipo do PDF Genius.

## Instalação e Configuração

### Requisitos

- Node.js v14 ou superior
- Redis
- Conta na OpenAI com API Key
- Conta na Pinecone com API Key e um índice configurado

### Passos de Instalação

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/seu-usuario/pdf-genius.git
   cd pdf-genius

   ```

2. **Configuração do Backend**

   Navegue até o diretório do backend e instale as dependências:

   ```bash
   cd backend
   npm install
   ```

   Crie um arquivo `.env` na raiz do diretório backend e configure as seguintes variáveis de ambiente:

   ```bash
   OPENAI_API_KEY=sua-chave-openai
   PINECONE_API_KEY=sua-chave-pinecone
   PINECONE_INDEX_NAME=nome-do-seu-índice
   ```

   Inicie o backend:

   ```bash
   npm run start
   ```

3. **Configuração do Frontend**

   Navegue até o diretório do frontend e instale as dependências:

   ```bash
   cd frontend
   npm install
   ```

   Inicie o frontend:

   ```bash
   npm run dev
   ```

   A aplicação estará disponível em [http://localhost:3000](http://localhost:3000).

## Exemplos de Chamadas à API

1. **Upload de PDF e Pergunta**

   Para fazer o upload de um PDF e enviar uma pergunta, utilize o seguinte exemplo com o cURL:

   ```bash
   curl -X POST http://localhost:3000/api/upload-and-ask \
   -F 'file=@/caminho/para/seu/documento.pdf' \
   -F 'question=Qual é o resumo deste documento?'
   ```

2. **Pergunta com Base em um PDF Já Armazenado**

   Caso o PDF já tenha sido armazenado anteriormente, você pode fazer uma nova pergunta utilizando o filename:

   ```bash
   curl -X POST http://localhost:3000/api/upload-and-ask \
   -F 'filename=seu_arquivo_pdf_salvo.pdf' \
   -F 'question=O que o documento diz sobre o tópico X?'
   ```

3. **Resposta da API**

   A resposta será semelhante ao exemplo abaixo:

   ```json
   {
     "message": "PDF enviado, processado e pergunta respondida com sucesso!",
     "filename": "seu_arquivo_pdf_salvo.pdf",
     "answer": "Aqui está o resumo do documento..."
   }
   ```

## Testes na Interface Web

- **Acesso**: Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.
- **Upload de PDF**: Faça upload de um documento PDF.
- **Envio de Pergunta**: Digite uma pergunta sobre o conteúdo do PDF e clique em "Enviar".
- **Visualização de Respostas**: As respostas serão exibidas no chat, e o histórico de interações será mantido.
- **Novo Chat**: Utilize o botão "Novo Chat" para limpar o histórico e iniciar uma nova sessão.

## Contribuições

Sinta-se à vontade para fazer um fork deste repositório, abrir issues e enviar pull requests.

## Licença

Este projeto é licenciado sob a MIT License.

## Adicionando ao GitHub

Para adicionar isso ao GitHub, siga os passos:

1. No seu repositório local, crie ou edite o arquivo `README.md`.
2. Adicione o conteúdo acima ao `README.md`.
3. Faça commit das alterações:

   ```bash
   git add README.md
   git commit -m "Adicionando documentação completa"
   ```

4. **Envie as mudanças para o repositório remoto:**

   ```bash
   git push origin main
   ```
