from database import conectar

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

    cursor.execute(comando, valores)
    conexao.commit()

    cursor.close()
    conexao.close()

#UPDATE
def atualizar_usuario(id_usuario, nome, email, cpf, telefone, data_nascimento):
    conexao = conectar()
    cursor = conexao.cursor()

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

    cursor.close()
    conexao.close()

#DELETE
def excluir_usuario(id_usuario):
    conexao = conectar()
    cursor = conexao.cursor()

    comando = """
        UPDATE usuarios
        SET ativo = 0
        WHERE idUsuarios = %s
    """

    # Usamos uma tupla com um único elemento porque o execute() espera os valores dos parâmetros em uma sequência.
    cursor.execute(comando, (id_usuario,))
    conexao.commit()

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
    cursor.execute(comando, (id_usuario,))

    usuario = cursor.fetchone()

    cursor.close()
    conexao.close()

    return usuario