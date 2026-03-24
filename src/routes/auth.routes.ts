import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.ts';

const Authrouter = Router();
const authController = new AuthController();

Authrouter.post('/auth/register', authController.register);
Authrouter.post('/auth/login', authController.login);

export default Authrouter;