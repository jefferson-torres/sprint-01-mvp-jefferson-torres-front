document.addEventListener("DOMContentLoaded", () => {
    const cadastroLivroPanel = document.getElementById("cadastro-livro");
    const listaLivrosPanel = document.getElementById("lista-livros");
    const formCadastroLivro = document.getElementById("cadastro-livro-form");
    const tabelaLivrosBody = document.getElementById("tabela-livros-body");
    const btnNovoLivro = document.getElementById("btn-novo-livro");
    const btnSalvarLivro = document.getElementById("btn-salvar-livro");
    const modal = document.getElementById("modal");
    const modalTitle = document.getElementById("modal-title");
    const modalBody = document.getElementById("modal-body");
    const modalCloseButton = document.getElementById("fechar-modal");
    const btnCancelaLivro = document.getElementById("btn-cancelar-livro");

    function showModalError(errors) {
        modalTitle.innerText = "Erro";
        modalBody.innerText = "";

        if (Array.isArray(errors)) {
            const ul = document.createElement("ul");
            errors.forEach((error) => {
                const li = document.createElement("li");
                li.textContent = error.msg;
                ul.appendChild(li);
            });
            modalBody.appendChild(ul);
        } else {
            if(errors.mesage){
                modalBody.textContent = errors.mesage;
            }else{
                modalBody.textContent = errors;
            }
        }

        let bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
    }

    function showModalSuccess(message) {
        modalTitle.innerText = "Sucesso";
        modalBody.innerText = message;
        let bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
    }

    modalCloseButton.addEventListener("click", () => {
        console.log('Aqui');
        let bootstrapModal = bootstrap.Modal.getInstance(modal);
        bootstrapModal.hide();
    });

    async function fetchLivros() {
        try {
            const response = await fetch("http://localhost:8000/livros");
            if (response.status === 422) {
                const errors = await response.json();
                showModalError(errors);
                return;
            }
    
            if (!response.ok) {
                const errorData = await response.json();
                const error = new Error(errorData.message);
                error.errors = errorData.errors;
                throw error;
            }
            const data = await response.json();
            return data.livros;
        } catch (error) {
            if (error.errors) {
                showModalError(error.errors);
            } else {
                showModalError(error.message);
            }
            return [];
        }
    }

    async function listarLivros() {
        const livros = await fetchLivros();
        if (livros && livros.length > 0) {
            tabelaLivrosBody.innerHTML = "";
            livros.forEach((livro) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
        <td>${livro.titulo}</td>
        <td>${livro.sinopse}</td>
        <td>${livro.autores}</td>
        <td>${livro.editora}</td>
        <td>${livro.edicao}</td>
        <td>${livro.genero}</td>
        <td>${livro.numero_paginas}</td>
        <td><button class="btn btn-danger btn-delete" data-id="${livro.codigo}"><i class="fas fa-trash"></i> Excluir</button></td>
      `;
                tabelaLivrosBody.appendChild(tr);
            });
            Array.from(document.getElementsByClassName("btn-delete")).forEach((btn) =>
                btn.addEventListener("click", deletarLivro)
            );
            listaLivrosPanel.style.display = "block";
            cadastroLivroPanel.style.display = "none";
        } else {
            listaLivrosPanel.style.display = "none";
            cadastroLivroPanel.style.display = "block";
        }
    }

    async function deletarLivro(event) {
        const id = event.target.dataset.id;
        try {
            const response = await fetch(`http://localhost:8000/livros?codigo=${id}`, {
                method: "DELETE",
            });
            if (response.status === 422) {
                const errors = await response.json();
                showModalError(errors);
                return;
            }
    
            if (!response.ok) {
                const errorData = await response.json();
                const error = new Error(errorData.message);
                error.errors = errorData.errors;
                throw error;
            }
            showModalSuccess("Livro deletado com sucesso!");
            listarLivros();
        } catch (error) {
            if (error.errors) {
                showModalError(error.errors);
            } else {
                showModalError(error.message);
            }
        }
    }

    async function cadastrarLivro(event) {
        event.preventDefault();
        const formData = new FormData(formCadastroLivro);

        try {
            const response = await fetch("http://localhost:8000/livros", {
                method: "POST",
                body: formData,
            });
            if (response.status === 422) {
                const errors = await response.json();
                showModalError(errors);
                return;
            }
    
            if (!response.ok) {
                const errorData = await response.json();
                const error = new Error(errorData.message);
                error.errors = errorData.errors;
                throw error;
            }
            showModalSuccess("Livro cadastrado com sucesso!");
            formCadastroLivro.reset();
            listarLivros();
        } catch (error) {
            if (error.errors) {
                showModalError(error.errors);
            } else {
                showModalError(error.message);
            }
        }
    }

    async function cancelarCadastroLivro() {
        const livros = await fetchLivros();
        if (livros && livros.length > 0) {
            listarLivros();
        } else {
            showModalError("Nenhum livro cadastrado. Por favor, cadastre um livro.");
            showCadastroLivroPanel();
        }
    }
    
    btnCancelaLivro.addEventListener("click", cancelarCadastroLivro);

    function showCadastroLivroPanel() {
        cadastroLivroPanel.style.display = "block";
        listaLivrosPanel.style.display = "none";
    }

    btnNovoLivro.addEventListener("click", showCadastroLivroPanel);
    btnSalvarLivro.addEventListener("click", cadastrarLivro);

    listarLivros();
});