"""Script to create payment tables and enums"""
from app.core.database import SessionLocal
from sqlalchemy import text

db = SessionLocal()

try:
    # Create payment enums
    try:
        db.execute(text("CREATE TYPE paymenttype AS ENUM ('ONBOARDING', 'MONTHLY', 'ANNUAL')"))
        print("✓ PaymentType enum created")
    except Exception as e:
        print(f"PaymentType enum already exists or error: {e}")
        db.rollback()
    
    try:
        db.execute(text("CREATE TYPE paymentstatus AS ENUM ('PENDING', 'PROOF_UPLOADED', 'VERIFIED', 'REJECTED', 'EXPIRED')"))
        print("✓ PaymentStatus enum created")
    except Exception as e:
        print(f"PaymentStatus enum already exists or error: {e}")
        db.rollback()
    
    # Add new MemberStatus values
    try:
        db.execute(text("ALTER TYPE memberstatus ADD VALUE IF NOT EXISTS 'PAYMENT_PENDING'"))
        db.execute(text("ALTER TYPE memberstatus ADD VALUE IF NOT EXISTS 'PAYMENT_PROOF_UPLOADED'"))
        db.execute(text("ALTER TYPE memberstatus ADD VALUE IF NOT EXISTS 'PENDING_APPROVAL'"))
        print("✓ MemberStatus enum values added")
    except Exception as e:
        print(f"MemberStatus values already exist or error: {e}")
        db.rollback()
    
    # Create payments table
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS payments (
        id VARCHAR PRIMARY KEY,
        user_id VARCHAR NOT NULL REFERENCES users(id),
        payment_type paymenttype NOT NULL,
        amount FLOAT NOT NULL,
        status paymentstatus NOT NULL DEFAULT 'PENDING',
        pix_key VARCHAR,
        pix_qr_code TEXT,
        payment_proof_url VARCHAR,
        payment_date TIMESTAMP,
        verified_by VARCHAR REFERENCES users(id),
        verified_at TIMESTAMP,
        rejection_reason TEXT,
        reference_month VARCHAR,
        due_date TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
    """
    db.execute(text(create_table_sql))
    db.commit()
    print("✓ Payments table created")
    
    print("\n✅ All database changes applied successfully!")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    db.rollback()
finally:
    db.close()
