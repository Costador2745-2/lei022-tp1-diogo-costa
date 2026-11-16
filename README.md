# Projeto — API de Gestão de Biblioteca

**Unidade Curricular:** Laboratório de Desenvolvimento de Software
**Ano letivo:** 2026/2027  
**Estudante:** Diogo Costa  
**Tecnologias:** Node.js, PostgreSQL, Prisma ORM, REST e GraphQL

---

## 1. Introdução

O objetivo deste projeto é desenvolver uma API para a gestão de uma biblioteca que permita consultar, criar, atualizar e eliminar registos através de uma interface REST.

A aplicação utiliza PostgreSQL como sistema de gestão de base de dados e Prisma ORM para comunicar com a base de dados.

Adicionalmente, foi integrada uma interface GraphQL, permitindo consultar e criar livros através de um endpoint alternativo.

As interfaces REST e GraphQL usam os mesmos dados armazenados na base de dados PostgreSQL, garantindo a consistência das operações.

## 2. Tecnologias utilizadas

As principais tecnologias utilizadas no projeto são:

| Tecnologia | Finalidade |
|---|---|
| Node.js | Ambiente de execução JavaScript |
| PostgreSQL | Sistema de gestão de base de dados |
| Prisma ORM | Comunicação entre a aplicação e a base de dados |
| GraphQL | Interface alternativa de consulta e criação de livros |
| REST | Interface principal para operações CRUD |
| Postman | Testes dos endpoints HTTP |

## 3. Estrutura da implementação

O projeto está organizado da seguinte forma:

| Componente | Responsabilidade |
|---|---|
| `server.js` | Servidor HTTP e gestão dos pedidos REST e GraphQL |
| `graphql.js` | Definição do schema e operações GraphQL |
| `prismaClient.js` | Inicialização e exportação do cliente Prisma |
| `prisma/schema.prisma` | Definição dos modelos e relações da base de dados |
| `prisma/migrations/` | Histórico das migrações da base de dados |
| `.env` | Configuração da ligação à base de dados |

### 3.1. Modelo de dados

A aplicação utiliza três modelos principais:

**Item**

Representa os itens da aplicação e possui:
- `id`: identificador único.
- `name`: nome do item.

**Author**

Representa os autores dos livros e possui:
- `id`: identificador único.
- `name`: nome do autor.
- `nameNormalized`: nome normalizado para impedir duplicados.
- `createdAt`: data de criação.
- Relação com os livros associados.

**Book**

Representa os livros da biblioteca e possui:
- `id`: identificador único.
- `name`: nome do livro.
- `nameNormalized`: nome normalizado para impedir duplicados.
- `status`: estado do livro.
- `createdAt`: data de criação.
- `authorId`: identificador do autor associado.
- `author`: relação com o modelo Author.

A relação entre Author e Book é de um para muitos (1:N), permitindo que um autor esteja associado a vários livros.

Os estados permitidos para os livros são:

- `disponivel`
- `emprestado`
- `danificado`

### 3.2. Integridade dos dados

Foram implementadas restrições para garantir a integridade da informação:

- Identificadores únicos e gerados automaticamente.
- Nomes de livros sem duplicados.
- Nomes de autores normalizados para evitar registos duplicados.
- Relação entre livros e autores através de uma chave estrangeira.
- Restrição de eliminação de autores associados a livros.

A normalização dos nomes permite detetar duplicados mesmo quando existem diferenças entre maiúsculas, minúsculas ou espaços exteriores.

## 4. Instalação e execução

### 4.1. Requisitos

Para executar o projeto são necessários:

- Node.js.
- npm.
- PostgreSQL.
- Postman ou outra ferramenta para realizar pedidos HTTP.

### 4.2. Instalação das dependências

A partir da pasta `backend`, executar:

```bash
npm install
```

### 4.3. Configuração da base de dados

É necessário criar uma base de dados PostgreSQL com o nome:

```text
biblioteca
```

Na pasta `backend`, criar um ficheiro `.env` com a variável de ambiente `DATABASE_URL`:

```env
DATABASE_URL="postgresql://UTILIZADOR:PASSWORD@localhost:5432/biblioteca?schema=public"
```

Substituir `UTILIZADOR` e `PASSWORD` pelas credenciais configuradas no PostgreSQL.

O ficheiro `.env` não deve ser enviado para o repositório GitHub.

### 4.4. Aplicação das migrações

Para aplicar as migrações existentes à base de dados, executar:

```bash
npx prisma migrate deploy
```

Para gerar o cliente Prisma:

```bash
npx prisma generate
```

### 4.5. Executar o servidor

Na pasta `backend`, executar:

```bash
node server.js
```

O servidor ficará disponível em:

```text
http://localhost:3000
```

## 5. API REST

A API REST permite realizar operações CRUD sobre os recursos da aplicação.

### 5.1. Gestão de Items

| Método | Endpoint | Operação |
|---|---|---|
| GET | `/api/items` | Listar todos os itens |
| GET | `/api/items/:id` | Consultar um item |
| POST | `/api/items` | Criar um item |
| PUT | `/api/items/:id` | Atualizar um item |
| DELETE | `/api/items/:id` | Eliminar um item |

### 5.2. Gestão de Books

| Método | Endpoint | Operação |
|---|---|---|
| GET | `/api/books` | Listar todos os livros |
| GET | `/api/books/:id` | Consultar um livro |
| POST | `/api/books` | Criar um livro |
| PUT | `/api/books/:id` | Atualizar um livro |
| DELETE | `/api/books/:id` | Eliminar um livro |

As operações REST utilizam o Prisma para consultar e modificar os registos armazenados no PostgreSQL.

Nas respostas relativas aos livros, é também disponibilizada a informação do respetivo autor.

## 6. API GraphQL

Para além da API REST, a aplicação disponibiliza um endpoint GraphQL:

```text
POST http://localhost:3000/graphql
```

Os pedidos devem ser enviados em formato JSON, utilizando o campo `query`.

### 6.1. Consultar todos os livros

Exemplo de pedido:

```json
{
  "query": "{ books { id name author status createdAt } }"
}
```

Esta operação devolve todos os livros armazenados na base de dados.

### 6.2. Selecionar apenas determinados campos

Uma das principais vantagens do GraphQL é permitir ao cliente escolher os campos que pretende receber.

Exemplo:

```json
{
  "query": "{ books { id name } }"
}
```

Neste caso, o servidor devolve apenas o identificador e o nome de cada livro.

### 6.3. Consultar um livro através do ID

Exemplo:

```json
{
  "query": "{ book(id: 1) { id name author status createdAt } }"
}
```

Esta operação permite consultar um livro específico através do seu identificador.

Caso o livro não exista, é devolvido um erro.

### 6.4. Criar um livro

Para criar um livro através do GraphQL é utilizada uma Mutation.

Exemplo:

```json
{
  "query": "mutation { createBook(name: \"Os Lusíadas\", author: \"Luís de Camões\", status: \"disponivel\") { id name author status createdAt } }"
}
```

O servidor valida os dados recebidos e, caso sejam válidos, cria o livro na base de dados PostgreSQL.

A criação do autor é também assegurada através do Prisma, reutilizando um autor existente quando o nome normalizado corresponde a um registo já existente.

## 7. Validação e tratamento de erros

Foram implementadas várias validações para garantir a integridade dos dados.

Entre as principais validações encontram-se:

- Campos obrigatórios não podem estar vazios.
- Os identificadores têm de ser inteiros positivos.
- Os livros têm de utilizar um dos estados permitidos.
- Não são permitidos nomes de livros duplicados.
- Os livros têm de estar associados a um autor válido.
- Os identificadores e datas gerados pelo servidor não podem ser definidos manualmente nos pedidos de criação ou atualização.

Também são tratados erros provenientes do Prisma, incluindo:

- `P2002`: violação de uma restrição de unicidade.
- `P2025`: registo que não foi encontrado.

Na API REST são utilizados códigos HTTP adequados, como:

| Código | Significado |
|---|---|
| 200 | Pedido realizado com sucesso |
| 201 | Recurso criado |
| 204 | Recurso eliminado com sucesso |
| 400 | Dados ou identificador inválidos |
| 404 | Recurso não encontrado |
| 409 | Conflito por duplicação |
| 500 | Erro interno do servidor |

## 8. Testes e evidências

Foram realizados testes através do Postman e de pedidos GraphQL para verificar o funcionamento da aplicação.

Os principais cenários testados incluem:

| Teste | Descrição |
|---|---|
| 1 | Consultar todos os itens através de REST |
| 2 | Criar, atualizar e eliminar itens |
| 3 | Consultar todos os livros através de REST |
| 4 | Criar, atualizar e eliminar livros |
| 5 | Consultar um livro através do GraphQL |
| 6 | Consultar todos os livros através do GraphQL |
| 7 | Criar um livro através de uma Mutation |
| 8 | Tentar criar um livro com nome duplicado |
| 9 | Tentar criar um livro com estado inválido |
| 10 | Consultar um livro inexistente |
| 11 | Confirmar a persistência dos dados após reiniciar o servidor |
| 12 | Verificar a relação entre livros e autores na base de dados |

Foi também confirmada a aplicação das migrações através do Prisma.

## 9. Persistência e integração com PostgreSQL

Uma das principais alterações ao projeto foi a substituição do armazenamento em memória pela utilização de uma base de dados PostgreSQL.

Através do Prisma ORM, as operações de consulta, criação, atualização e eliminação são executadas diretamente na base de dados.

A utilização de migrações permite controlar as alterações efetuadas à estrutura da base de dados e reproduzi-las noutros ambientes.

A persistência dos dados garante que os registos continuam disponíveis mesmo depois de o servidor ser reiniciado.

## 10. Utilização de Inteligência Artificial

Foi utilizada a ferramenta ChatGPT como apoio a compreensão do projeto.

A sua utilização teve como finalidade esclarecer conceitos relacionados com PostgreSQL, Prisma ORM, GraphQL e REST e auxiliar na preparação da documentação.

## 11. Conclusão

Com este projeto foi desenvolvida uma API de gestão de biblioteca que utiliza Node.js, PostgreSQL e Prisma ORM para armazenar e gerir os dados de forma persistente.

A aplicação disponibiliza operações CRUD através de REST e integra também GraphQL como interface alternativa para consultar e criar livros.

A implementação permitiu aprofundar conhecimentos sobre bases de dados relacionais, relações entre modelos, migrações, integridade dos dados e diferentes formas de comunicação entre aplicações.

Conclui-se que a utilização de PostgreSQL com Prisma ORM proporciona uma solução para a gestão dos dados, enquanto a integração de GraphQL acrescenta flexibilidade na consulta e criação de livros.