# CRUD de Usuários — Residência III

Sistema completo de cadastro de usuários (CRUD) desenvolvido como projeto da Residência em Software III. Composto por uma API REST em **FastAPI** conectada a um banco **MySQL**, e uma interface web em **HTML, CSS e JavaScript puro** consumindo essa API.

---

## Funcionalidades

- **Listar** usuários ativos
- **Buscar** um usuário específico por ID
- **Cadastrar** novo usuário
- **Atualizar** dados de um usuário existente
- **Excluir** usuário via **soft delete** (o registro não é apagado do banco, apenas marcado como inativo)
- Validações e tratamento de erros nas rotas (404 para usuário não encontrado/inativo, 503 para indisponibilidade temporária do banco)
- Interface web para gerenciar os usuários visualmente, com listagem paginada, formulário de cadastro/edição e feedback de ações (toasts)

---

## Tecnologias utilizadas

**Backend**
- Python 3
- FastAPI
- Uvicorn (servidor ASGI)
- MySQL Connector/Python
- Pydantic (validação de dados)

**Banco de dados**
- MySQL

**Frontend**
- HTML5
- CSS3
- JavaScript (vanilla, sem frameworks)

---

## Estrutura do projeto

```
CRUD - Residência III/
├── Backend/
│   ├── main.py             # Rotas da API (FastAPI)
│   ├── usuarios.py         # Funções de acesso ao banco (CRUD)
│   ├── database.py         # Conexão com o MySQL
│   └── requirements.txt    # Dependências do backend
├── Frontend/
│   ├── index.html          # Estrutura da página
│   ├── style.css           # Estilos visuais
│   └── script.js           # Lógica de consumo da API
├── .env                    # Credenciais do banco (não versionado)
├── .gitignore
└── README.md
```

---

## Modelo de dados

Tabela `usuarios`:

| Campo             | Tipo      | Descrição                                   |
|--------------------|-----------|-----------------------------------------------|
| `idUsuarios`       | INT (PK)  | Identificador único, autoincremento           |
| `nome`             | VARCHAR   | Nome completo do usuário                      |
| `email`            | VARCHAR   | E-mail do usuário                             |
| `cpf`              | VARCHAR   | CPF do usuário                                |
| `telefone`         | VARCHAR   | Telefone (opcional)                           |
| `data_nascimento`  | DATE      | Data de nascimento                            |
| `data_cadastro`    | DATETIME  | Preenchido automaticamente na criação         |
| `ativo`            | BOOLEAN   | `1` = ativo, `0` = inativo (soft delete). Default `TRUE` |

---

## Endpoints da API

Base URL local: `http://127.0.0.1:8000`

| Método   | Rota                | Descrição                                      |
|----------|----------------------|--------------------------------------------------|
| `GET`    | `/usuarios`          | Lista todos os usuários ativos                  |
| `GET`    | `/usuarios/{id}`     | Busca um usuário ativo pelo ID                  |
| `POST`   | `/usuarios`           | Cadastra um novo usuário                        |
| `PUT`    | `/usuarios/{id}`     | Atualiza um usuário (somente se estiver ativo)  |
| `DELETE` | `/usuarios/{id}`     | Exclui logicamente um usuário (soft delete)      |

**Exemplo de corpo de requisição** (`POST` e `PUT`):
```json
{
  "nome": "Natália Caetano",
  "email": "natalia.caetano@gmail.com",
  "cpf": "01146789960",
  "telefone": "75988654528",
  "data_nascimento": "2007-12-10"
}
```

**Códigos de resposta**

| Código | Situação                                                |
|--------|-----------------------------------------------------------|
| `200`  | Sucesso                                                    |
| `404`  | Usuário não encontrado ou inativo                          |
| `422`  | Dados inválidos no corpo da requisição                     |
| `503`  | Banco de dados temporariamente indisponível (lock/timeout) |
| `500`  | Erro interno inesperado                                    |

A documentação interativa completa (Swagger) fica disponível em `http://127.0.0.1:8000/docs` com o servidor rodando.

---

## Como executar o projeto

### Pré-requisitos
- Python 3.10+
- MySQL Server instalado e rodando
- Extensão **Live Server** (VS Code) ou qualquer servidor estático, para rodar o front

### 1. Configurar o banco de dados
Crie o banco e a tabela `usuarios` conforme o modelo de dados descrito acima, com o campo `ativo` como `BOOLEAN DEFAULT TRUE`.

### 2. Configurar as credenciais
Na **raiz do projeto**, crie um arquivo `.env` com os dados de conexão do seu MySQL (host, usuário, senha, nome do banco).

### 3. Instalar as dependências
```bash
cd Backend
pip install -r requirements.txt
```

### 4. Rodar o backend e o frontend juntos

> **Importante:** backend e frontend são dois processos independentes, e **os dois precisam estar rodando ao mesmo tempo** para o sistema funcionar. Se abrir só o frontend sem o backend ativo, a listagem de usuários não carrega e aparece um erro de conexão na tela.

**Terminal 1 — Backend** (dentro da pasta `Backend`):
```bash
py -m uvicorn main:app --reload
```
A API sobe em `http://127.0.0.1:8000`. Deixe esse terminal aberto enquanto usa o sistema.

**Terminal 2 (ou VS Code) — Frontend**:
Com o backend já rodando, abra a pasta `Frontend` e inicie o `index.html` com o **Live Server** (ou dê duplo clique no arquivo). A interface se conecta automaticamente à API local.

---

## Observações técnicas

- **CORS**: o backend possui `CORSMiddleware` habilitado, permitindo que o frontend (servido em outra porta/origem) consuma a API sem bloqueios do navegador.
- **Soft delete**: o `DELETE` não remove o registro do banco — apenas atualiza o campo `ativo` para `0`. As rotas `GET`, `PUT` e `DELETE` ignoram usuários inativos.
- **Erros de lock no MySQL**: se a API retornar erro 503 com mensagem de indisponibilidade do banco, verifique se não há transações pendentes sem commit em ferramentas como o MySQL Workbench (consulte `SELECT * FROM information_schema.innodb_trx;` para diagnosticar).

---

## Autor

Projeto desenvolvido para a disciplina de Residência em Software III.
