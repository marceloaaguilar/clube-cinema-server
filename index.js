require('dotenv').config();
const express = require("express");
const userRoutes = require('./routes/users.js');

const establishmentRoutes = require('./routes/establishment.js');
const clientRoutes = require('./routes/client.js');
const memberRoutes = require('./routes/member.js');
const voucherRoutes = require('./routes/voucher.js');
const voucherReservationHistory = require("./routes/voucherReservationHistory.js");
const codeRoutes = require('./routes/code.js');

const webhook = require('./routes/asaasWebhook');
const cors = require('cors');
const app = express();
const cookieParser = require('cookie-parser');

app.use(express.json());
app.use(cookieParser());

app.use(cors({origin: process.env.CLIENT_URL, credentials: true}));

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/code", codeRoutes);
app.use("/api/v1/establishment", establishmentRoutes);
app.use("/api/v1/client", clientRoutes);
app.use("/api/v1/member", memberRoutes);
app.use("/api/v1/voucher", voucherRoutes);
app.use("/api/v1/voucherReservationHistory", voucherReservationHistory);
app.use("/api/v1/webhook", webhook);

app.listen(process.env.SERVER_PORT || 8080, () => {
  console.log("Servidor iniciado.")
}); 