from fastapi import FastAPI
from pydantic import BaseModel # Ele vai permitir definir quais dados a API espera receber
from usuarios import (
    listar_usuarios,
    buscar_usuario,
    criar_usuario,
    atualizar_usuario,
    excluir_usuario
)


class Usuario(BaseModel): 
    nome: str
    email: str
    cpf: str
    telefone: str | None = None #Pode ser deixado vazio
    data_nascimento: str

app = FastAPI() # Cria nossa aplicação

@app.get("/usuarios")
def get_usuarios():
    #Chama nosso CRUD  
    return listar_usuarios()

@app.get("/usuarios/{id_usuario}") # cria uma rota que aceita um ID
def get_usuario(id_usuario: int):
    return buscar_usuario(id_usuario)

@app.post("/usuarios")
def post_usuario(usuario: Usuario):
    criar_usuario(
        usuario.nome,
        usuario.email,
        usuario.cpf,
        usuario.telefone,
        usuario.data_nascimento
    )

    return{"mensagem": "Usuário cadastrado com sucesso!"}

@app.put("/usuarios/{id_usuario}")
def put_usuario(id_usuario: int, usuario: Usuario):
    atualizar_usuario(
        id_usuario,
        usuario.nome,
        usuario.email,
        usuario.cpf,
        usuario.telefone,
        usuario.data_nascimento
    )
    return {"mensagem": "Usuário atualizado com sucesso!"}

@app.delete("/usuarios/{id_usuario}")
def delete_usuario(id_usuario: int):
    excluir_usuario(id_usuario)
    return {"mensagem": "Usuário excluído com sucesso!"}
