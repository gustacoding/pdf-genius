import 'dotenv/config';
import { Pinecone } from '@pinecone-database/pinecone';
import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as pdfParse from 'pdf-parse';
import * as fs from 'fs/promises';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const index = pinecone.Index(process.env.PINECONE_INDEX_NAME!);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

@Controller('api')
export class AppController {
  @Post('upload-and-ask')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array.from({ length: 32 }, () =>
            Math.round(Math.random() * 16).toString(16),
          ).join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
          cb(null, true);
        } else {
          cb(
            new BadRequestException('Somente arquivos PDF são permitidos!'),
            false,
          );
        }
      },
    }),
  )
  async uploadAndAsk(
    @UploadedFile() file: Express.Multer.File,
    @Body('question') question: string,
    @Body('filename') filename: string,
  ) {
    let text: string;
    let embedding: number[];
    let existingId: string | undefined;
    let previousAskUser: string = '';
    let previousAnswerUser: string = '';
    let lastAskUser: string = '';
    let lastAnswerUser: string = '';

    if (file) {
      console.log('Processando PDF:', file.originalname);

      const filePath = file.path;
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdfParse(dataBuffer);
      text = this.formatExtractedText(data.text);

      embedding = await this.getEmbedding(text);

      // Gera um novo ID para o arquivo PDF
      existingId = uuidv4();

      await index.upsert([
        {
          id: existingId,
          values: embedding,
          metadata: {
            filename: file.filename,
            question: question,
            content: text,
            previousAskUser: '',
            previousAnswerUser: '',
            lastAskUser: question,
            lastAnswerUser: '',
          },
        },
      ]);

      // Agenda a exclusão do arquivo PDF após 15 segundos
      setTimeout(async () => {
        try {
          await fs.unlink(filePath);
          console.log(`Arquivo ${file.filename} excluído com sucesso.`);
        } catch (error) {
          console.error(`Erro ao excluir o arquivo ${file.filename}:`, error);
        }
      }, 15000);
    } else if (filename) {
      console.log(
        'Recuperando conteúdo do Pinecone com base no filename:',
        filename,
      );

      const pineconeQuery = await index.query({
        topK: 1,
        includeMetadata: true,
        vector: await this.getEmbedding(question),
        filter: {
          filename: filename,
        },
      });

      if (pineconeQuery.matches.length > 0) {
        const match = pineconeQuery.matches[0];
        text = String(match.metadata.content);
        embedding = await this.getEmbedding(text);
        existingId = match.id; // Recupera o ID existente para atualizações futuras

        previousAskUser = String(match.metadata.previousAskUser || '');
        previousAnswerUser = String(match.metadata.previousAnswerUser || '');
        lastAskUser = String(match.metadata.lastAskUser || '');
        lastAnswerUser = String(match.metadata.lastAnswerUser || '');

        console.log('ID Existente:', existingId);
      } else {
        throw new BadRequestException(
          'Nenhum conteúdo encontrado para o filename especificado.',
        );
      }
    } else {
      throw new BadRequestException('Nenhum arquivo ou filename fornecido.');
    }

    const prompt = `
      O seguinte texto foi extraído de um documento PDF e já foi armazenado:
      "${text}"
      Pergunta anterior: "${previousAskUser}"
      Resposta anterior: "${previousAnswerUser}"
      Agora, por favor, responda a seguinte pergunta baseada nesse conteúdo: "${question}".
    `;

    const answer = await this.askGPTWithRetry(prompt);
    lastAnswerUser = answer;

    // Atualiza o registro existente no Pinecone com a nova resposta
    if (existingId) {
      await index.upsert([
        {
          id: existingId,
          values: embedding,
          metadata: {
            filename: filename || file.filename,
            question: question,
            content: text,
            previousAskUser: lastAskUser,
            previousAnswerUser: lastAnswerUser,
            lastAskUser: question,
            lastAnswerUser: answer,
          },
        },
      ]);
    }

    return {
      message: 'PDF enviado, processado e pergunta respondida com sucesso!',
      filename: filename || file.filename,
      answer,
    };
  }

  async getEmbedding(text: string): Promise<number[]> {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });

    return response.data[0].embedding;
  }

  async askGPTWithRetry(
    prompt: string,
    retries = 5,
    delay = 1000,
  ): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Você é um assistente útil.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      if (error.response && error.response.status === 429 && retries > 0) {
        console.log(`Rate limit exceeded, retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.askGPTWithRetry(prompt, retries - 1, delay * 2);
      } else {
        throw error;
      }
    }
  }

  formatExtractedText(text: string): string {
    return text
      .split('\n')
      .map((line) =>
        line
          .replace(/(\S)(?=[AZ])/g, '$1 ')
          .replace(/\s+/g, ' ')
          .trim(),
      )
      .join('\n');
  }
}
