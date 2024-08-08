import express from "express";
import jwt from "jsonwebtoken";

import { validateRequestBody } from "zod-express-middleware";
import { z } from "zod";

export const getToken = express.Router();

getToken.post(
  "/",
  validateRequestBody(
    z.object({
      name: z.string(),
    })
  ),
  async (req, res) => {
    const token = jwt.sign(req.body, process.env.ACCESS_TOKEN_SECRET!);

    return res.status(200).send({ token });
  }
);
