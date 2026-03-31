import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.ts';
import { authMiddleware } from '../middlewares/auth.middleware.ts';
import { issueCsrfToken } from '../middlewares/csrf.middleware.ts';
import { authLimiter } from '../middlewares/rateLimit.middleware.ts';

const Authrouter = Router();

Authrouter.get('/api/csrf-token', issueCsrfToken, (req, res) => {
    res.status(200).json({ message: 'Token CSRF emitido com sucesso' });
});

Authrouter.post('/api/v1/register', authLimiter, issueCsrfToken, AuthController.register);
Authrouter.post('/api/v1/login', authLimiter, issueCsrfToken, AuthController.login);
Authrouter.post('/api/v1/logout', authMiddleware, AuthController.logout);

export default Authrouter;
