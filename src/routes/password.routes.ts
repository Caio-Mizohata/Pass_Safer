import { Router } from "express";
import { PasswordController } from "../controllers/password.controller.ts";

const PassRouter = Router();

PassRouter.post('/passwords', PasswordController.savePassword);
PassRouter.post('/decrypt-passwords', PasswordController.getPasswords);
PassRouter.put('/passwords/:id', PasswordController.updatePassword);
PassRouter.delete('/passwords/:id', PasswordController.deletePassword);


export default PassRouter;