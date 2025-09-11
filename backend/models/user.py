class User:
    def __init__(self, email, username, password_hash, created_at):
        self.email = email
        self.username = username
        self.password_hash = password_hash
        self.created_at = created_at

    def to_dict(self):
        return {
            "email": self.email,
            "username": self.username,
            "password": self.password_hash,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }