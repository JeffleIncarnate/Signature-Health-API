"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const cors_1 = __importDefault(require("cors"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_express_middleware_1 = require("zod-express-middleware");
const zod_1 = require("zod");
const getToken_1 = require("./core/routes/getToken");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api/auth/token", getToken_1.getToken);
app.all("/", (req, res) => {
    return res.send({ detail: "Welcome to the SignatureHealth API" });
});
app.post("/sendMail", (0, zod_express_middleware_1.validateRequestBody)(zod_1.z.object({
    name: zod_1.z.string(),
    email: zod_1.z.string().email(),
    phoneNumber: zod_1.z.string(),
    message: zod_1.z.string(),
})), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (token === undefined || token === null) {
        return res.status(400).send({ detail: "Invalid token" });
    }
    const payload = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (payload.name !== req.body.name) {
        return res
            .status(400)
            .send({ detail: "The token does not match the user." });
    }
    const transporter = nodemailer_1.default.createTransport({
        service: "hotmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
    try {
        const success = yield transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_SEND_TO,
            subject: "SIGNATURE HEALTH CONTACT FORM",
            text: `Name: ${req.body.name}, Email: ${req.body.email}, Phone Number: ${req.body.phoneNumber === ""
                ? "No Number specified"
                : req.body.phoneNumber}, Message: ${req.body.message}`,
        });
        if (success.response.split(" ")[2] === "OK") {
            return res.sendStatus(200);
        }
    }
    catch (err) {
        console.log(err);
        return res.status(500).send(err);
    }
}));
app.listen(3000, () => {
    console.log("Listening on https://localhost:3000");
});
//# sourceMappingURL=index.js.map