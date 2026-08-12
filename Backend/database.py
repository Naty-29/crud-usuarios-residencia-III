import mysql.connector
from dotenv import load_dotenv # Aqui importei uma função da biblioteca 'python-dotenv', ela serve para ler o arquivo .env
import os # O módulo os permite que o python interaja com recursos do sistema operacional, nesse caso, utilizei para pegar os valores das variáveis de ambiente

load_dotenv() # Carregando o .env

def conectar():
    conexao = mysql.connector.connect(
        host = os.getenv("DB_HOST"),
        user = os.getenv("DB_USER"),
        password = os.getenv("DB_PASSWORD"),
        database = os.getenv("db_NAME"),

    )
    return conexao # Faz a função devolver a conexão que acabou de criar

