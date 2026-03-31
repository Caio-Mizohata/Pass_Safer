import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.ts';
import { authMiddleware } from '../middlewares/auth.middleware.ts';
import { issueCsrfToken } from '../middlewares/csrf.middleware.ts';
import { authLimiter } from '../middlewares/rateLimit.middleware.ts';

const Authrouter = Router();

Authrouter.get('/csrf-token', issueCsrfToken, (req, res) => {
    res.status(200).json({ message: 'Token CSRF emitido com sucesso' });
});

Authrouter.post('/register', authLimiter, issueCsrfToken, AuthController.register);
Authrouter.post('/login', authLimiter, issueCsrfToken, AuthController.login);
Authrouter.post('/logout', authMiddleware, AuthController.logout);

export default Authrouter;
