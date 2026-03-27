import { Router } from "express";
import { PasswordController } from "../controllers/password.controller.ts";
import { validateAllowedKeys } from "../middlewares/validadeKeys.middleware.ts";

const PassRouter = Router();

PassRouter.post('/passwords', validateAllowedKeys(['serviceName', 'username', 'password']), PasswordController.savePassword);
PassRouter.get('/passwords/:id', PasswordController.getPasswords);
PassRouter.put('/passwords/:id', validateAllowedKeys(['serviceName', 'usernameAccount', 'password', 'notes']), PasswordController.updatePassword);
PassRouter.delete('/passwords/:id', PasswordController.deletePassword);

export default PassRouter;
