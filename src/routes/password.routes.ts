import { Router } from "express";
import { PasswordController } from "../controllers/password.controller.ts";
import { validateAllowedKeys } from "../middlewares/validadeKeys.middleware.ts";
import { passwordLimiter } from "../middlewares/rateLimit.middleware.ts";

const PassRouter = Router();

PassRouter.post('/passwords', passwordLimiter, validateAllowedKeys(['serviceName', 'password', 'usernameAccount', 'notes']), PasswordController.savePassword);
PassRouter.get('/passwords', passwordLimiter, PasswordController.getAllPasswords);
PassRouter.get('/passwords/:id', passwordLimiter, PasswordController.getPasswords);
PassRouter.put('/passwords/:id', passwordLimiter, validateAllowedKeys(['serviceName', 'usernameAccount', 'password', 'notes']), PasswordController.updatePassword);
PassRouter.delete('/passwords/:id', passwordLimiter, PasswordController.deletePassword);

export default PassRouter;
