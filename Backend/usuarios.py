from database import conectar
import mysql.connector
from fastapi import HTTPException

#READ
def listar_usuarios():
    conexao = conectar()
    cursor = conexao.cursor()

    cursor.execute(" SELECT * FROM usuarios WHERE ativo = 1") # Executar a consulta SQL para selecionar todos os usuários ativos

    usuarios = cursor.fetchall() # Guardar os resultados da consulta na variável usuários

    cursor.close()
    conexao.close()

    return usuarios

#CREATE
def criar_usuario(nome, email, cpf, telefone, data_nascimento):
    conexao = conectar()
    cursor = conexao.cursor()

    # %s é um placeholder que será substituído pelo valor passado no execute().
    comando = """
        INSERT INTO usuarios
        (nome, email, cpf, telefone, data_nascimento)
        VALUES (%s, %s, %s, %s, %s) 
        """
    valores = (
        nome,
        email,
        cpf,
        telefone,
        data_nascimento
    )

    try:
        cursor.execute(comando, valores)
        conexao.commit()
    except mysql.connector.errors.DatabaseError as erro:
        if erro.errno == 1205:
            raise HTTPException(
                status_code=503 , 
                datail="O banco de dados está temporariamente indisponível. Por favor, tente novamente mais tarde."
            )
        raise HTTPException(status_code=500, detail="Erro ao criar usuário.")
    finally:
        cursor.close()
        conexao.close()

#UPDATE
def atualizar_usuario(id_usuario, nome, email, cpf, telefone, data_nascimento):
    conexao = conectar()
    cursor = conexao.cursor()

    try:
        cursor.execute(
            "SELECT idUsuarios FROM usuarios WHERE idUsuarios = %s AND ativo = 1",
            (id_usuario,)
        )
        usuario_existente = cursor.fetchone()

        if not usuario_existente:
            raise HTTPException(
                status_code=404, 
                detail="Usuário não encontrado ou inativo."
                )


        comando = """
            UPDATE usuarios
            SET nome = %s,
                email = %s,
                cpf = %s,
                telefone = %s,
                data_nascimento = %s
            WHERE idUsuarios = %s
        """

        valores = (
            nome,
            email,
            cpf,
            telefone,
            data_nascimento,
            id_usuario # O ID diz qual usuário será alterado
        )

        cursor.execute(comando, valores)
        conexao.commit()

    except HTTPException:
        raise
    except mysql.connector.errors.DatabaseError as erro:
        if erro.errno == 1205:
            raise HTTPException(    
                status_code=503, 
                detail="O banco de dados está temporariamente indisponível. Por favor, tente novamente mais tarde."
            )
        raise HTTPException(status_code=500, detail="Erro ao atualizar usuário.")
    finally:
        cursor.close()
        conexao.close()

#DELETE
def excluir_usuario(id_usuario):
    conexao = conectar()
    cursor = conexao.cursor()

    try:
        cursor.execute(
            "SELECT idUsuarios FROM usuarios WHERE idUsuarios = %s AND ativo = 1",
            (id_usuario,)
        )
        usuario_existente = cursor.fetchone()

        if not usuario_existente:
            raise HTTPException(
                status_code=404, 
                detail="Usuário não encontrado ou inativo."
            )

        comando = """
            UPDATE usuarios
            SET ativo = 0
            WHERE idUsuarios = %s
        """
        # Usamos uma tupla com um único elemento porque o execute() espera os valores dos parâmetros em uma sequência.
        cursor.execute(comando, (id_usuario,))
        conexao.commit()

    except HTTPException:
        raise
    except mysql.connector.errors.DatabaseError as erro:
        if erro.errno == 1205:
            raise HTTPException(
                status_code=503, 
                detail="O banco de dados está temporariamente indisponível. Por favor, tente novamente mais tarde."
            )
        raise HTTPException(status_code=500, detail="Erro ao excluir usuário.")
    finally:
        cursor.close()
        conexao.close()

# Buscar um único usuário
def buscar_usuario(id_usuario):
    conexao = conectar()
    cursor = conexao.cursor()

    comando = """
        SELECT * FROM usuarios
        WHERE idUsuarios = %s
        AND ativo = 1
    """
    try:
        cursor.execute(comando, (id_usuario,))
        usuario = cursor.fetchone()

        if not usuario:
            raise HTTPException(
                status_code=404, 
                detail="Usuário não encontrado ou inativo."
            )
        return usuario
    except HTTPException:
        raise
    except mysql.connector.errors.DatabaseError as erro:
        if erro.errno == 1205:
            raise HTTPException(
                status_code=503, 
                detail="O banco de dados está temporariamente indisponível. Por favor, tente novamente mais tarde."
            )
        raise HTTPException(status_code=500, detail="Erro ao buscar usuário.")
    finally:
        cursor.close()
        conexao.close()

