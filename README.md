# LEI022 - TP1 - Primeira API REST

## Identificação

- Aluno: Diogo Costa
- Unidade Curricular: Laboratório de Desenvolvimento de Software
- Trabalho: TP1 - Primeira API REST
- Ano letivo: 2026/2027

## Descrição

Este projeto implementa uma API REST em Node.js com o uso do módulo nativo `http`.

A API contém dois recursos apenas em memória:

- `items` - recurso principal
- `books` - recurso adicional

Os dados são armazenados em memória, pelo que são apagados sempre que o servidor é reiniciado.

## Requisitos

- Node.js v24.21.0

Não são utilizadas dependências externas.

## Instalação

Entrar na pasta `backend`:

```bash
cd backend
```

Instalar as dependências:

```bash
npm install
```

## Execução

Dentro da pasta `backend`:

```bash
node server.js
```

ou:

```bash
npm start
```

O servidor fica disponível em:

`http://localhost:3000`

## Recurso Items

O recurso `items` possui os seguintes campos:

- `id` - identificador inteiro positivo gerado pelo servidor
- `name` - nome do item

### Endpoints

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/items` | Lista todos os items |
| GET | `/api/items?name=termo` | Pesquisa items pelo nome |
| GET | `/api/items/:id` | Obtém um item pelo ID |
| POST | `/api/items` | Cria um novo item |
| PUT | `/api/items/:id` | Atualiza um item |
| DELETE | `/api/items/:id` | Elimina um item |

## Recurso adicional - Books

Foi escolhido o domínio de livros para o recurso adicional.

Cada livro possui:

- `id` - identificador gerado pelo servidor
- `name` - nome do livro
- `author` - autor do livro
- `status` - estado do livro
- `createdAt` - data de criação gerada automaticamente pelo servidor em formato ISO 8601

Os valores permitidos para `status` são:

- `disponivel`
- `emprestado`
- `danificado`

O campo `createdAt` é controlado pelo servidor e não é alterado durante um `PUT`.

Não é permitida a criação de dois livros com o mesmo nome, assim ignoramos diferenças entre maiúsculas e minúsculas. Uma tentativa de criar um nome duplicado devolve `409 Conflict`.

### Endpoints

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/books` | Lista todos os livros |
| GET | `/api/books/:id` | Obtém um livro pelo ID |
| POST | `/api/books` | Cria um livro |
| PUT | `/api/books/:id` | Atualiza um livro |
| DELETE | `/api/books/:id` | Elimina um livro |

## Códigos HTTP utilizados

- `200 OK` - consulta ou atualização realizada com sucesso
- `201 Created` - recurso criado com sucesso
- `204 No Content` - recurso eliminado com sucesso
- `400 Bad Request` - pedido inválido
- `404 Not Found` - recurso ou rota inexistente
- `409 Conflict` - conflito com o estado atual dos dados

Os erros seguem um formato uniforme:

```json
{
  "status": 400,
  "title": "Pedido inválido",
  "detail": "Descrição do erro"
}
```

## Testes

Os testes foram realizados através do Postman.

A coleção exportada encontra-se na pasta `tests/`.

Foram testados casos de sucesso e de erro, incluindo:

| Pedido | Resultado esperado | Resultado obtido |
|---|---|---|
| GET `/api/items` | 200 | 200 |
| GET `/api/items/1` | 200 | 200 |
| GET `/api/items/999` | 404 | 404 |
| GET `/api/items/abc` | 400 | 400 |
| GET `/api/items/1e0` | 400 | 400 |
| GET `/api/items?name=TECLA` | 200 | 200 |
| GET `/api/items?name=xyz` | 200 + `[]` | 200 + `[]` |
| POST `/api/items` válido | 201 + Location | 201 + Location |
| POST `/api/items` inválido | 400 | 400 |
| POST `/api/items` sem body | 400 | 400 |
| POST `/api/items` com JSON malformado | 400 | 400 |
| PUT `/api/items/1` válido | 200 | 200 |
| PUT `/api/items/999` | 404 | 404 |
| PUT `/api/items/1` inválido | 400 | 400 |
| PUT `/api/items/abc` | 400 | 400 |
| DELETE `/api/items/1` | 204 | 204 |
| DELETE `/api/items/999` | 404 | 404 |
| DELETE `/api/items/abc` | 400 | 400 |
| GET rota inexistente | 404 | 404 |
| POST `/api/books` válido | 201 | 201 |
| GET `/api/books` | 200 | 200 |
| GET `/api/books/1` | 200 | 200 |
| POST book com status inválido | 400 | 400 |
| POST book com nome duplicado | 409 | 409 |
| PUT `/api/books/1` | 200 | 200 |
| DELETE `/api/books/1` | 204 | 204 |

## Utilização de IA

Foi utilizada a ferramenta ChatGPT, como apoio durante o desenvolvimento do trabalho.

A ferramenta foi utilizada para:

- apoio na interpretação dos requisitos do enunciado;
- esclarecimento de conceitos relacionados com APIs REST e códigos HTTP;
- apoio na revisão do `server.js`;
- apoio na preparação dos testes no Postman;
- apoio na organização final da documentação.

As sugestões fornecidas pela ferramenta foram aplicadas e ajustadas ao projeto durante o desenvolvimento. O funcionamento da implementação foi validado através da execução local da API, testes manuais com `curl` e testes realizados no Postman.

## Estrutura do projeto

```text
lei022-tp1-diogo-costa/
├── backend/
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
├── tests/
│   └── LEI022-TP1-Testes.postman_collection.json
└── README.md
```