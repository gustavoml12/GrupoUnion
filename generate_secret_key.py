#!/usr/bin/env python3
"""
Script para gerar uma SECRET_KEY segura para o backend
"""
import secrets

def generate_secret_key(length=64):
    """Gera uma chave secreta segura"""
    return secrets.token_urlsafe(length)

if __name__ == "__main__":
    secret_key = generate_secret_key()
    print("=" * 80)
    print("🔐 SECRET_KEY GERADA COM SUCESSO!")
    print("=" * 80)
    print(f"\nSECRET_KEY={secret_key}")
    print("\n⚠️  IMPORTANTE:")
    print("1. Copie esta chave e adicione nas variáveis de ambiente do Coolify")
    print("2. NUNCA compartilhe esta chave publicamente")
    print("3. Use uma chave diferente para cada ambiente (dev, staging, prod)")
    print("=" * 80)
