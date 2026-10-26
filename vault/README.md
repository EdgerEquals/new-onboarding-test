# Vault (stub, empty)

This test page has no secrets, so there's nothing here.

If one is ever needed, follow simmie-chat's `config.enc.json` pattern:
- A local build script encrypts a JSON config with AES-GCM, using a key from PBKDF2-HMAC-SHA256 over a password with a random salt.
- Only the encrypted file is committed. The page decrypts it in the browser after the password is entered.
- The password and any plain config stay off the repo, in the box's private config.

Do not put real secrets, tokens, topics or passwords in this folder or anywhere else in this public repo.
