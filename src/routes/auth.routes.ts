import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.ts';
import { authMiddleware } from '../middlewares/auth.middleware.ts';

const Authrouter = Router();

Authrouter.post('/register', AuthController.register);
Authrouter.post('/login', AuthController.login);
Authrouter.post('/logout', authMiddleware, AuthController.logout);

export default Authrouter;
