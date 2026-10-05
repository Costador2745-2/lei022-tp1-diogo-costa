const http = require("http");

const PORT = 3000;

let items = [];
let nextId = 1;
let books = [];
let nextBookId = 1;
const allowedBookStatus = ["disponivel", "emprestado", "danificado"];

const server = http.createServer((req, res) => {
    res.setHeader("Content-Type", "application/json");

    // GET /api/items e GET /api/items?name=...
    if (req.method === "GET" && req.url.startsWith("/api/items")) {
        const url = new URL(req.url, `http://${req.headers.host}`);

        if (url.pathname === "/api/items") {
            const name = url.searchParams.get("name");

            if (name !== null) {
                const termo = name.trim().toLowerCase();

                const resultado = items.filter(item =>
                    item.name.toLowerCase().includes(termo)
                );

                res.statusCode = 200;
                res.end(JSON.stringify(resultado));
                return;
            }

            res.statusCode = 200;
            res.end(JSON.stringify(items));
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

        const item = items.find(item => item.id === id);

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
    if (req.method === "POST" && req.url === "/api/items") {
        let body = "";

        req.on("data", chunk => {
            body += chunk;
        });

        req.on("end", () => {
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

            const item = {
                id: nextId,
                name: data.name.trim()
            };

            nextId++;

            items.push(item);

            res.statusCode = 201;
            res.setHeader("Location", `/api/items/${item.id}`);
            res.end(JSON.stringify(item));
        });

        return;
    }

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

        req.on("end", () => {
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

            const item = items.find(item => item.id === id);

            if (!item) {
                res.statusCode = 404;
                res.end(JSON.stringify({
                    status: 404,
                    title: "Não encontrado",
                    detail: `Não existe item com id ${id}`
                }));
                return;
            }

            item.name = data.name.trim();

            res.statusCode = 200;
            res.end(JSON.stringify(item));
        });

        return;
    }

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

        const index = items.findIndex(item => item.id === id);

        if (index === -1) {
            res.statusCode = 404;
            res.end(JSON.stringify({
                status: 404,
                title: "Não encontrado",
                detail: `Não existe item com id ${id}`
            }));
            return;
        }

        items.splice(index, 1);

        res.statusCode = 204;
        res.end();
        return;
    }
    // GET /api/books
if (req.method === "GET" && req.url === "/api/books") {
    res.statusCode = 200;
    res.end(JSON.stringify(books));
    return;
}

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

    const book = books.find(book => book.id === id);

    if (!book) {
        res.statusCode = 404;
        res.end(JSON.stringify({
            status: 404,
            title: "Não encontrado",
            detail: `Não existe livro com id ${id}`
        }));
        return;
    }

    res.statusCode = 200;
    res.end(JSON.stringify(book));
    return;
}

// POST /api/books
if (req.method === "POST" && req.url === "/api/books") {
    let body = "";

    req.on("data", chunk => {
        body += chunk;
    });

    req.on("end", () => {
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

        // Verificar nome duplicado
        const duplicate = books.some(book =>
            book.name.toLowerCase() === data.name.trim().toLowerCase()
        );

        if (duplicate) {
            res.statusCode = 409;
            res.end(JSON.stringify({
                status: 409,
                title: "Conflito",
                detail: "Já existe um livro com esse nome"
            }));
            return;
        }

        const book = {
            id: nextBookId,
            name: data.name.trim(),
            author: data.author.trim(),
            status: data.status,
            createdAt: new Date().toISOString()
        };

        nextBookId++;

        books.push(book);

        res.statusCode = 201;
        res.setHeader("Location", `/api/books/${book.id}`);
        res.end(JSON.stringify(book));
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

    req.on("end", () => {
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

        // Só depois das validações procuramos o recurso
        const book = books.find(book => book.id === id);

        if (!book) {
            res.statusCode = 404;
            res.end(JSON.stringify({
                status: 404,
                title: "Não encontrado",
                detail: `Não existe livro com id ${id}`
            }));
            return;
        }

        // Verificar duplicados, excluindo o próprio livro
        const duplicate = books.some(otherBook =>
            otherBook.id !== id &&
            otherBook.name.toLowerCase() === data.name.trim().toLowerCase()
        );

        if (duplicate) {
            res.statusCode = 409;
            res.end(JSON.stringify({
                status: 409,
                title: "Conflito",
                detail: "Já existe um livro com esse nome"
            }));
            return;
        }

        book.name = data.name.trim();
        book.author = data.author.trim();
        book.status = data.status;

        // createdAt NÃO é alterado

        res.statusCode = 200;
        res.end(JSON.stringify(book));
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

    const index = books.findIndex(book => book.id === id);

    if (index === -1) {
        res.statusCode = 404;
        res.end(JSON.stringify({
            status: 404,
            title: "Não encontrado",
            detail: `Não existe livro com id ${id}`
        }));
        return;
    }

    books.splice(index, 1);

    res.statusCode = 204;
    res.end();
    return;
}
    // Rota inexistente
    res.statusCode = 404;
    res.end(JSON.stringify({
        status: 404,
        title: "Não encontrado",
        detail: "Rota inexistente"
    }));
});

server.listen(PORT, () => {
    console.log(`Servidor a correr em http://localhost:${PORT}`);
});