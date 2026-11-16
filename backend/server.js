const http = require("http");
const { schema, createRoot, graphql } = require("./graphql");
const prisma = require("./prismaClient");

const PORT = 3000;

let items = [];
let nextId = 1;
const allowedBookStatus = ["disponivel", "emprestado", "danificado"];

const server = http.createServer(async (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");

    // POST /graphql: query e mutation sobre os mesmos livros do REST.
    if (req.method === "POST" && req.url === "/graphql") {
        let body = "";
        req.on("data", chunk => { body += chunk; });
        req.on("end", async () => {
            let data;
            try {
                data = JSON.parse(body);
                if (!data || typeof data.query !== "string" || !data.query.trim()) {
                    throw new Error("Query em falta");
                }
            } catch {
                res.statusCode = 400;
                res.end(JSON.stringify({ errors: [{ message: "Pedido JSON invalido ou query em falta" }] }));
                return;
            }
            try {
                const result = await graphql({
                    schema,
                    source: data.query,
                    rootValue: createRoot(prisma),
                    variableValues: data.variables
                });
                res.statusCode = result.errors ? 400 : 200;
                res.end(JSON.stringify(result));
            } catch {
                res.statusCode = 500;
                res.end(JSON.stringify({ errors: [{ message: "Erro interno do servidor" }] }));
            }
        });
        return;
    }

    
    // GET /api/items e GET /api/items?name=...
    if (req.method === "GET" && req.url.startsWith("/api/items")) {
        const url = new URL(req.url, `http://${req.headers.host}`);

        if (url.pathname === "/api/items") {
            const name = url.searchParams.get("name");

            try {
                let resultado;

                if (name !== null && name.trim() !== "") {
                    resultado = await prisma.item.findMany({
                        where: {
                            name: {
                                contains: name.trim(),
                                mode: "insensitive"
                            }
                        }
                    });
                } else {
                    resultado = await prisma.item.findMany();
                }

                res.statusCode = 200;
                res.end(JSON.stringify(resultado));
            } catch (error) {
                console.error("Erro ao consultar itens:", error);

                res.statusCode = 500;
                res.end(JSON.stringify({
                    status: 500,
                    title: "Erro interno",
                    detail: "Não foi possível consultar os itens"
                }));
            }

            return;
        }
    }

    // GET /api/items/:id
    if (req.method === "GET" && req.url.startsWith("/api/items/")) {
        const idText = req.url.split("/")[3];

        if (!/^[1-9]\d*$/.test(idText)) {
            res.statusCode = 400;
            res.end(JSON.stringify({
                status: 400,
                title: "Pedido inválido",
                detail: "O id deve ser um inteiro positivo"
            }));
            return;
        }

        const id = Number(idText);

        const item = await prisma.item.findUnique({
            where: { id: id }
        });

        if (!item) {
            res.statusCode = 404;
            res.end(JSON.stringify({
                status: 404,
                title: "Não encontrado",
                detail: `Não existe item com id ${id}`
            }));
            return;
        }

        res.statusCode = 200;
        res.end(JSON.stringify(item));
        return;
    }

    // POST /api/items
    
    // POST /api/items
    if (req.method === "POST" && req.url === "/api/items") {
        let body = "";

        req.on("data", chunk => {
            body += chunk;
        });

        req.on("end", async () => {
            let data;

            try {
                data = JSON.parse(body);
            } catch {
                res.statusCode = 400;
                res.end(JSON.stringify({
                    status: 400,
                    title: "Pedido inválido",
                    detail: "JSON malformado"
                }));
                return;
            }

            if (
                !data ||
                typeof data.name !== "string" ||
                data.name.trim() === ""
            ) {
                res.statusCode = 400;
                res.end(JSON.stringify({
                    status: 400,
                    title: "Pedido inválido",
                    detail: "O campo name é obrigatório e deve ser texto não vazio"
                }));
                return;
            }

            try {
                const item = await prisma.item.create({
                    data: {
                        name: data.name.trim()
                    }
                });

                res.statusCode = 201;
                res.setHeader("Location", `/api/items/${item.id}`);
                res.end(JSON.stringify(item));

            } catch (error) {
                console.error("Erro ao criar item:", error);

                res.statusCode = 500;
                res.end(JSON.stringify({
                    status: 500,
                    title: "Erro interno",
                    detail: "Não foi possível criar o item"
                }));
            }
        });

        return;
    }


    // PUT /api/items/:id
    
    // PUT /api/items/:id
    if (req.method === "PUT" && req.url.startsWith("/api/items/")) {
        const idText = req.url.split("/")[3];

        if (!/^[1-9]\d*$/.test(idText)) {
            res.statusCode = 400;
            res.end(JSON.stringify({
                status: 400,
                title: "Pedido inválido",
                detail: "O id deve ser um inteiro positivo"
            }));
            return;
        }

        const id = Number(idText);

        let body = "";

        req.on("data", chunk => {
            body += chunk;
        });

        req.on("end", async () => {
            let data;

            try {
                data = JSON.parse(body);
            } catch {
                res.statusCode = 400;
                res.end(JSON.stringify({
                    status: 400,
                    title: "Pedido inválido",
                    detail: "JSON malformado"
                }));
                return;
            }

            if (
                !data ||
                typeof data.name !== "string" ||
                data.name.trim() === ""
            ) {
                res.statusCode = 400;
                res.end(JSON.stringify({
                    status: 400,
                    title: "Pedido inválido",
                    detail: "O campo name é obrigatório e deve ser texto não vazio"
                }));
                return;
            }

            try {
                const item = await prisma.item.update({
                    where: { id: id },
                    data: {
                        name: data.name.trim()
                    }
                });

                res.statusCode = 200;
                res.end(JSON.stringify(item));

            } catch (error) {
                if (error.code === "P2025") {
                    res.statusCode = 404;
                    res.end(JSON.stringify({
                        status: 404,
                        title: "Não encontrado",
                        detail: `Não existe item com id ${id}`
                    }));
                    return;
                }

                console.error("Erro ao atualizar item:", error);

                res.statusCode = 500;
                res.end(JSON.stringify({
                    status: 500,
                    title: "Erro interno",
                    detail: "Não foi possível atualizar o item"
                }));
            }
        });

        return;
    }


    // DELETE /api/items/:id
    
    // DELETE /api/items/:id
    if (req.method === "DELETE" && req.url.startsWith("/api/items/")) {
        const idText = req.url.split("/")[3];

        if (!/^[1-9]\d*$/.test(idText)) {
            res.statusCode = 400;
            res.end(JSON.stringify({
                status: 400,
                title: "Pedido inválido",
                detail: "O id deve ser um inteiro positivo"
            }));
            return;
        }

        const id = Number(idText);

        try {
            await prisma.item.delete({
                where: { id: id }
            });

            res.statusCode = 204;
            res.end();

        } catch (error) {
            if (error.code === "P2025") {
                res.statusCode = 404;
                res.end(JSON.stringify({
                    status: 404,
                    title: "Não encontrado",
                    detail: `Não existe item com id ${id}`
                }));
                return;
            }

            console.error("Erro ao eliminar item:", error);

            res.statusCode = 500;
            res.end(JSON.stringify({
                status: 500,
                title: "Erro interno",
                detail: "Não foi possível eliminar o item"
            }));
        }

        return;
    }

    // GET /api/books

    // GET /api/books
    if (req.method === "GET" && req.url === "/api/books") {
        try {
            const books = await prisma.book.findMany({
                include: {
                    author: true
                }
            });

            const result = books.map(book => ({
                id: book.id,
                name: book.name,
                author: book.author.name,
                status: book.status,
                createdAt: book.createdAt.toISOString()
            }));

            res.statusCode = 200;
            res.end(JSON.stringify(result));

        } catch (error) {
            console.error("Erro ao consultar livros:", error);

            res.statusCode = 500;
            res.end(JSON.stringify({
                status: 500,
                title: "Erro interno",
                detail: "Não foi possível consultar os livros"
            }));
        }

        return;
    }


// GET /api/books/:id

    // GET /api/books/:id
    if (req.method === "GET" && req.url.startsWith("/api/books/")) {
        const idText = req.url.split("/")[3];

        if (!/^[1-9]\d*$/.test(idText)) {
            res.statusCode = 400;
            res.end(JSON.stringify({
                status: 400,
                title: "Pedido inválido",
                detail: "O id deve ser um inteiro positivo"
            }));
            return;
        }

        const id = Number(idText);

        try {
            const book = await prisma.book.findUnique({
                where: { id: id },
                include: {
                    author: true
                }
            });

            if (!book) {
                res.statusCode = 404;
                res.end(JSON.stringify({
                    status: 404,
                    title: "Não encontrado",
                    detail: `Não existe livro com id ${id}`
                }));
                return;
            }

            const result = {
                id: book.id,
                name: book.name,
                author: book.author.name,
                status: book.status,
                createdAt: book.createdAt.toISOString()
            };

            res.statusCode = 200;
            res.end(JSON.stringify(result));

        } catch (error) {
            console.error("Erro ao consultar livro:", error);

            res.statusCode = 500;
            res.end(JSON.stringify({
                status: 500,
                title: "Erro interno",
                detail: "Não foi possível consultar o livro"
            }));
        }

        return;
    }


    // POST /api/books
    if (req.method === "POST" && req.url === "/api/books") {
        let body = "";

        req.on("data", chunk => {
            body += chunk;
        });

        req.on("end", async () => {
            let data;

            try {
                data = JSON.parse(body);
            } catch {
                res.statusCode = 400;
                res.end(JSON.stringify({
                    status: 400,
                    title: "Pedido inválido",
                    detail: "JSON malformado"
                }));
                return;
            }

            // Validar name
            if (
                !data ||
                typeof data.name !== "string" ||
                data.name.trim() === ""
            ) {
                res.statusCode = 400;
                res.end(JSON.stringify({
                    status: 400,
                    title: "Pedido inválido",
                    detail: "O campo name é obrigatório e deve ser texto não vazio"
                }));
                return;
            }

            // Validar author
            if (
                typeof data.author !== "string" ||
                data.author.trim() === ""
            ) {
                res.statusCode = 400;
                res.end(JSON.stringify({
                    status: 400,
                    title: "Pedido inválido",
                    detail: "O campo author é obrigatório e deve ser texto não vazio"
                }));
                return;
            }

            // Validar status
            if (
                typeof data.status !== "string" ||
                !allowedBookStatus.includes(data.status)
            ) {
                res.statusCode = 400;
                res.end(JSON.stringify({
                    status: 400,
                    title: "Pedido inválido",
                    detail: "O status deve ser disponivel, emprestado ou danificado"
                }));
                return;
            }

            // O cliente não pode definir id nem createdAt
            if (data.id !== undefined || data.createdAt !== undefined) {
                res.statusCode = 400;
                res.end(JSON.stringify({
                    status: 400,
                    title: "Pedido inválido",
                    detail: "Os campos id e createdAt são gerados pelo servidor"
                }));
                return;
            }

            const name = data.name.trim();
            const authorName = data.author.trim();

            const nameNormalized = name.toLowerCase();
            const authorNormalized = authorName.toLowerCase();

            try {
                const book = await prisma.$transaction(async (tx) => {

                    // Procurar ou criar o autor
                    const author = await tx.author.upsert({
                        where: {
                            nameNormalized: authorNormalized
                        },
                        update: {},
                        create: {
                            name: authorName,
                            nameNormalized: authorNormalized
                        }
                    });

                    // Criar o livro associado ao autor
                    return await tx.book.create({
                        data: {
                            name: name,
                            nameNormalized: nameNormalized,
                            status: data.status,
                            authorId: author.id
                        },
                        include: {
                            author: true
                        }
                    });
                });

                const result = {
                    id: book.id,
                    name: book.name,
                    author: book.author.name,
                    status: book.status,
                    createdAt: book.createdAt.toISOString()
                };

                res.statusCode = 201;
                res.setHeader("Location", `/api/books/${book.id}`);
                res.end(JSON.stringify(result));

            } catch (error) {
                if (error.code === "P2002") {
                    res.statusCode = 409;
                    res.end(JSON.stringify({
                        status: 409,
                        title: "Conflito",
                        detail: "Já existe um livro com esse nome"
                    }));
                    return;
                }

                console.error("Erro ao criar livro:", error);

                res.statusCode = 500;
                res.end(JSON.stringify({
                    status: 500,
                    title: "Erro interno",
                    detail: "Não foi possível criar o livro"
                }));
            }
        });

        return;
    }



// PUT /api/books/:id
if (req.method === "PUT" && req.url.startsWith("/api/books/")) {
    const idText = req.url.split("/")[3];

    if (!/^[1-9]\d*$/.test(idText)) {
        res.statusCode = 400;
        res.end(JSON.stringify({
            status: 400,
            title: "Pedido inválido",
            detail: "O id deve ser um inteiro positivo"
        }));
        return;
    }

    const id = Number(idText);

    let body = "";

    req.on("data", chunk => {
        body += chunk;
    });

    req.on("end", async () => {
        let data;

        try {
            data = JSON.parse(body);
        } catch {
            res.statusCode = 400;
            res.end(JSON.stringify({
                status: 400,
                title: "Pedido inválido",
                detail: "JSON malformado"
            }));
            return;
        }

        // Validar name
        if (
            !data ||
            typeof data.name !== "string" ||
            data.name.trim() === ""
        ) {
            res.statusCode = 400;
            res.end(JSON.stringify({
                status: 400,
                title: "Pedido inválido",
                detail: "O campo name é obrigatório e deve ser texto não vazio"
            }));
            return;
        }

        // Validar author
        if (
            typeof data.author !== "string" ||
            data.author.trim() === ""
        ) {
            res.statusCode = 400;
            res.end(JSON.stringify({
                status: 400,
                title: "Pedido inválido",
                detail: "O campo author é obrigatório e deve ser texto não vazio"
            }));
            return;
        }

        // Validar status
        if (
            typeof data.status !== "string" ||
            !allowedBookStatus.includes(data.status)
        ) {
            res.statusCode = 400;
            res.end(JSON.stringify({
                status: 400,
                title: "Pedido inválido",
                detail: "O status deve ser disponivel, emprestado ou danificado"
            }));
            return;
        }

        // id e createdAt são controlados pelo servidor
        if (data.id !== undefined || data.createdAt !== undefined) {
            res.statusCode = 400;
            res.end(JSON.stringify({
                status: 400,
                title: "Pedido inválido",
                detail: "Os campos id e createdAt são gerados pelo servidor"
            }));
            return;
        }

        const name = data.name.trim();
        const authorName = data.author.trim();

        const nameNormalized = name.toLowerCase();
        const authorNormalized = authorName.toLowerCase();

        try {
            const book = await prisma.$transaction(async (tx) => {

                // Verificar se o livro existe
                const existingBook = await tx.book.findUnique({
                    where: { id: id }
                });

                if (!existingBook) {
                    return null;
                }

                // Procurar o autor ou criá-lo se não existir
                const author = await tx.author.upsert({
                    where: {
                        nameNormalized: authorNormalized
                    },
                    update: {},
                    create: {
                        name: authorName,
                        nameNormalized: authorNormalized
                    }
                });

                // Atualizar o livro
                return await tx.book.update({
                    where: { id: id },
                    data: {
                        name: name,
                        nameNormalized: nameNormalized,
                        status: data.status,
                        authorId: author.id
                    },
                    include: {
                        author: true
                    }
                });
            });

            if (!book) {
                res.statusCode = 404;
                res.end(JSON.stringify({
                    status: 404,
                    title: "Não encontrado",
                    detail: `Não existe livro com id ${id}`
                }));
                return;
            }

            const result = {
                id: book.id,
                name: book.name,
                author: book.author.name,
                status: book.status,
                createdAt: book.createdAt.toISOString()
            };

            res.statusCode = 200;
            res.end(JSON.stringify(result));

        } catch (error) {

            // Nome de livro duplicado
            if (error.code === "P2002") {
                res.statusCode = 409;
                res.end(JSON.stringify({
                    status: 409,
                    title: "Conflito",
                    detail: "Já existe um livro com esse nome"
                }));
                return;
            }

            console.error("Erro ao atualizar livro:", error);

            res.statusCode = 500;
            res.end(JSON.stringify({
                status: 500,
                title: "Erro interno",
                detail: "Não foi possível atualizar o livro"
            }));
        }
    });

    return;
}

// DELETE /api/books/:id
if (req.method === "DELETE" && req.url.startsWith("/api/books/")) {
    const idText = req.url.split("/")[3];

    if (!/^[1-9]\d*$/.test(idText)) {
        res.statusCode = 400;
        res.end(JSON.stringify({
            status: 400,
            title: "Pedido inválido",
            detail: "O id deve ser um inteiro positivo"
        }));
        return;
    }

    const id = Number(idText);

    try {
        await prisma.book.delete({
            where: { id }
        });

        res.statusCode = 204;
        res.end();

    } catch (error) {
        if (error.code === "P2025") {
            res.statusCode = 404;
            res.end(JSON.stringify({
                status: 404,
                title: "Não encontrado",
                detail: `Não existe livro com id ${id}`
            }));
            return;
        }

        console.error("Erro ao eliminar livro:", error);

        res.statusCode = 500;
        res.end(JSON.stringify({
            status: 500,
            title: "Erro interno",
            detail: "Não foi possível eliminar o livro"
        }));
    }

    return;
}
});

server.listen(PORT, () => {
    console.log(`Servidor a correr em http://localhost:${PORT}`);
});