from app.core.security import get_password_hash

# Gerar hash para a senha "hub123"
hashed_password = get_password_hash("hub123")
print(f"Hash da senha 'hub123': {hashed_password}")

# Para verificar se uma senha corresponde a um hash
# from app.core.security import verify_password
# print(verify_password("hub123", hashed_password))  # Deve retornar True
