import "dotenv/config";

import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import jwt from "jsonwebtoken";

import { validateRequestBody } from "zod-express-middleware";
import { z } from "zod";

import { getToken } from "./core/routes/getToken";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth/token", getToken);

app.all("/", (req, res) => {
  return res.send({ detail: "Welcome to the SignatureHealth API" });
});

app.post(
  "/sendMail",
  validateRequestBody(
    z.object({
      name: z.string(),
      email: z.string().email(),
      phoneNumber: z.string(),
      message: z.string(),
    })
  ),
  async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (token === undefined || token === null) {
      return res.status(400).send({ detail: "Invalid token" });
    }

    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
      name: string;
      iat: number;
    };

    if (payload.name !== req.body.name) {
      return res
        .status(400)
        .send({ detail: "The token does not match the user." });
    }

    const transporter = nodemailer.createTransport({
      service: "hotmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      secure: false,
      tls: {
        rejectUnauthorized: false,
      },
    });

    try {
      const success = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_SEND_TO,
        subject: "SIGNATURE HEALTH CONTACT FORM",
        text: `Name: ${req.body.name}, Email: ${
          req.body.email
        }, Phone Number: ${
          req.body.phoneNumber === ""
            ? "No Number specified"
            : req.body.phoneNumber
        }, Message: ${req.body.message}`,
      });
      if (success.response.split(" ")[2] === "OK") {
        return res.sendStatus(200);
      }
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  }
);

app.listen(3000, () => {
  console.log("Listening on http://localhost:3000");
});
