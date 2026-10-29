---
name: owasp-top-10
description: >-
  Audits, verifies, and enforces web application and API security best practices
  based on the OWASP Top 10 and OWASP API Security Top 10. Use whenever reviewing
  or writing code with authentication, authorization, cryptography, user input,
  database queries, session management, or sensitive data handling, and whenever
  the user asks for "owasp", "segurança", "security audit", "vulnerabilidades",
  or "code review de segurança".
---

# OWASP Top 10 & API Security Guidelines

This skill provides automated security verification, proactive threat mitigation, and code review rules based on the official **OWASP Top 10 (Web)** and **OWASP API Security Top 10**.

---

## 1. When to Apply

Activate security checks whenever:
- Implementing or modifying **routes, controllers, middlewares, or services**.
- Handling **authentication, tokens (JWT), password hashing, or data encryption**.
- Querying databases (**MongoDB/Mongoose, SQL, Key-Value**).
- Reading, writing, or exposing **user-supplied input or sensitive data**.
- Setting up **HTTP headers, cookies, CORS, and error handling**.
- The user requests an **audit, vulnerability assessment, or security review**.

---

## 2. Core OWASP Top 10 Vulnerabilities & Prevention

### A01: Broken Access Control (and API1: BOLA)
> *The #1 risk. Users acting outside their intended permissions or accessing resources belonging to other tenants/users.*

- **Object-Level Ownership Check**: Always verify that the authenticated user (`req.user.id`) owns the specific resource being queried, modified, or deleted.
  ```typescript
  // ❌ VULNERABLE: Any authenticated user can modify any entry if they guess entryId
  await Entry.findByIdAndUpdate(req.params.id, req.body);

  // ✅ SECURE: Strict scoping to authenticated user
  const entry = await Entry.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    req.body,
    { new: true }
  );
  if (!entry) throw new ForbiddenOrNotFoundError();
  ```
- **Principle of Least Privilege**: Default deny on all endpoints. Explicitly attach authentication & authorization middlewares.
- **Direct Object Reference Validation**: Reject invalid IDs upfront (`Types.ObjectId.isValid()`, UUID validation) to prevent unexpected driver behavior or type-confusion attacks.

---

### A02: Cryptographic Failures
> *Exposure of sensitive data at rest or in transit due to weak, improper, or missing cryptographic operations.*

- **Password Hashing (One-Way)**:
  - Use memory-hard, work-factor algorithms: **Argon2id** (preferred) or **bcrypt** (cost $\ge$ 12).
  - Never use MD5, SHA-1, SHA-256, or raw SHA-512 for password verification.
- **Data Encryption (Reversible, at Rest)**:
  - Use authenticated symmetric encryption: **AES-256-GCM** or **ChaCha20-Poly1305**.
  - **IV / Nonce**: Generate a cryptographically secure, random IV/Nonce (`crypto.randomBytes`) for **every single encryption operation**. Never reuse an IV with the same key.
  - **Authentication Tag**: Always store and verify the authentication tag (`getAuthTag()` / `setAuthTag()`) to prevent ciphertext tampering.
- **Key Management**:
  - Never hardcode secrets, keys, or salts in source code.
  - Load keys from environment variables or a secrets manager.
  - If deriving keys from user passwords, use **PBKDF2** (high iteration count) or **Argon2id**.

---

### A03: Injection (SQL, NoSQL, Command, XSS)
> *Untrusted data parsed as commands or query parameters.*

- **NoSQL Injection (Mongoose/MongoDB)**:
  - Express body parsers can accept nested objects (e.g., `{"username": {"$gt": ""}}`).
  - Sanitize input by strictly validating types (strings, numbers) or using schema validators like **Zod** or **mongo-sanitize**.
- **Cross-Site Scripting (XSS)**:
  - Sanitize and encode user-controlled content before rendering in HTML/web views.
  - Set `Content-Security-Policy` headers.
- **Command Injection**:
  - Never pass user input to `eval()`, `child_process.exec()`, or shell commands. Use parameterized APIs (`execFile` with argument arrays) when external processes are unavoidable.

---

### A04: Insecure Design & Business Logic Flaws
- Implement **defense-in-depth**: Validate at the route layer (middleware), business layer (services), and storage layer (schemas).
- Enforce strict state transitions (e.g., passwords cannot be marked as reset without a valid, single-use, unexpired token).

---

### A05: Security Misconfiguration
- **Security Headers**: Always integrate [`helmet`](https://github.com/helmetjs/helmet) to enable `HSTS`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, etc.
- **CORS**: Avoid wildcard origins (`*`) with credentials (`credentials: true`). Explicitly whitelist allowed domains.
- **Information Leakage**:
  - In production, never return stack traces, database schema names, or raw error objects to the client.
  - Use a centralized error handler returning generic user messages and logging details internally.

---

### A06: Vulnerable and Outdated Components
- Regularly run dependency vulnerability checks: `npm audit` or `pnpm audit`.
- Pin dependency versions and vet third-party packages before introducing them.

---

### A07: Identification and Authentication Failures
- **Brute-Force & Credential Stuffing Defense**:
  - Implement rate limiting (`express-rate-limit`) on `/auth/login`, `/auth/register`, `/auth/reset-password`, and verification endpoints.
- **JWT Best Practices**:
  - Use strong, high-entropy secrets (`crypto.randomBytes(64).toString('hex')`).
  - Keep expiration short (e.g., access token 15m; refresh token 7d with revocation).
  - Explicitly verify algorithm: prevent `alg: none` attacks by enforcing algorithms (e.g., `algorithms: ['HS256']`).
- **Cookie Security**:
  - Always set cookies containing session identifiers or refresh tokens with:
    `{ httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' }`.

---

### A08: Software and Data Integrity Failures (and API3: BOPLA / Mass Assignment)
- **Mass Assignment Prevention**:
  - Never pass raw `req.body` directly to `Model.create()` or `Model.updateOne()`.
  - Whitelist allowed fields explicitly or use schema validation:
    ```typescript
    // ❌ VULNERABLE: Client could supply { "role": "admin" } or modify immutable fields
    await User.create(req.body);

    // ✅ SECURE: Explicit field mapping
    const { name, email, password } = req.body;
    await User.create({ name, email, passwordHash });
    ```

---

### A09: Security Logging and Monitoring Failures
- Log significant security events: failed login attempts, privilege changes, password changes, token revocations.
- **Log Sanitization**: Never log passwords, tokens, full credit card numbers, or encryption keys.

---

### A10: Server-Side Request Forgery (SSRF)
- If the application fetches URLs provided by users (e.g., webhooks, avatar URLs, link previews):
  - Enforce an allowlist of permitted protocols (`http`, `https`).
  - Block internal network addresses (e.g., `127.0.0.1`, `localhost`, `169.254.169.254`, `10.0.0.0/8`, `192.168.0.0/16`).

---

## 3. Code Review Checklist

Before finishing any code change or security audit, verify:
- [ ] **Auth & Scope**: Is the user authenticated, and is the resource scoped to `req.user.id`?
- [ ] **Input Validation**: Are all route parameters and request bodies strictly validated?
- [ ] **Crypto Safety**: Are random IVs used per operation, and are keys loaded securely?
- [ ] **Error Handling**: Are raw internal errors kept out of public HTTP responses?
- [ ] **Rate Limiting**: Are public and sensitive endpoints protected against abuse?
- [ ] **Mass Assignment**: Are inputs explicitly filtered before database persistence?

