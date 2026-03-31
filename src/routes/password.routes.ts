import { Router } from "express";
import { PasswordController } from "../controllers/password.controller.ts";
import { validateAllowedKeys } from "../middlewares/validadeKeys.middleware.ts";
import { passwordLimiter } from "../middlewares/rateLimit.middleware.ts";

const PassRouter = Router();

PassRouter.post('/api/v1/passwords', passwordLimiter, validateAllowedKeys(['serviceName', 'password', 'usernameAccount', 'notes']), PasswordController.savePassword);
PassRouter.get('/api/v1/passwordslist', passwordLimiter, PasswordController.getAllPasswords);
PassRouter.get('/api/v1/passwordslist/:id', passwordLimiter, PasswordController.getUserPassword);
PassRouter.put('/api/v1/passwordslist/:id', passwordLimiter, validateAllowedKeys(['serviceName', 'usernameAccount', 'password', 'notes']), PasswordController.updatePassword);
PassRouter.delete('/api/v1/passwordslist/:id', passwordLimiter, PasswordController.deletePassword);

export default PassRouter;
