
const { buildSchema, graphql } = require("graphql");

const schema = buildSchema(`
    type Book {
        id: Int!
        name: String!
        author: String!
        status: String!
        createdAt: String!
    }

    type Query {
        books: [Book!]!
        book(id: Int!): Book
    }

    type Mutation {
        createBook(
            name: String!
            author: String!
            status: String!
        ): Book!
    }
`);

function createRoot(prisma) {
    return {
        // Consultar todos os livros
        books: async () => {
            const books = await prisma.book.findMany({
                include: {
                    author: true
                }
            });

            return books.map(book => ({
                id: book.id,
                name: book.name,
                author: book.author.name,
                status: book.status,
                createdAt: book.createdAt.toISOString()
            }));
        },

        // Consultar um livro pelo ID
        book: async ({ id }) => {
            if (id <= 0) {
                throw new Error("O id deve ser um inteiro positivo");
            }

            const book = await prisma.book.findUnique({
                where: { id },
                include: {
                    author: true
                }
            });

            if (!book) {
                throw new Error(`Não existe livro com id ${id}`);
            }

            return {
                id: book.id,
                name: book.name,
                author: book.author.name,
                status: book.status,
                createdAt: book.createdAt.toISOString()
            };
        },

        // Criar um livro
        
createBook: async ({ name, author, status }) => {
    if (typeof name !== "string" || name.trim() === "") {
        throw new Error("O nome do livro é obrigatório");
    }

    if (typeof author !== "string" || author.trim() === "") {
        throw new Error("O autor do livro é obrigatório");
    }

    const allowedBookStatus = [
        "disponivel",
        "emprestado",
        "danificado"
    ];

    if (!allowedBookStatus.includes(status)) {
        throw new Error(
            "Status inválido: use disponivel, emprestado ou danificado"
        );
    }

    const bookName = name.trim();
    const authorName = author.trim();

    try {
        const book = await prisma.$transaction(async (tx) => {
            const foundAuthor = await tx.author.upsert({
                where: {
                    nameNormalized: authorName.toLowerCase()
                },
                update: {},
                create: {
                    name: authorName,
                    nameNormalized: authorName.toLowerCase()
                }
            });

            return await tx.book.create({
                data: {
                    name: bookName,
                    nameNormalized: bookName.toLowerCase(),
                    status,
                    authorId: foundAuthor.id
                },
                include: {
                    author: true
                }
            });
        });

        return {
            id: book.id,
            name: book.name,
            author: book.author.name,
            status: book.status,
            createdAt: book.createdAt.toISOString()
        };

    } catch (error) {
        if (error.code === "P2002") {
            throw new Error("Já existe um livro com este nome.");
        }

        throw error;
    }
}

    };
}

module.exports = { schema, createRoot, graphql };
