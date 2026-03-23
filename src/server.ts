import dotenv from "dotenv";
dotenv.config();

import express from "express";
import type { Request, Response } from "express";

const app = express();
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    res.send("Hello, Pass_Safer!");
});

const port = process.env.PORT ?? 3000;
app.listen(port, () => {
    console.log(`Aplicação disponível em http://localhost:${port}`);
});
