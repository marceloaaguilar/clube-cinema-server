require('dotenv').config();
const express = require("express");

const userRoutes = require('./routes/users.js');
const establishmentRoutes = require('./routes/establishment.js');
const clientRoutes = require('./routes/client.js');
const memberRoutes = require('./routes/member.js');
const voucherRoutes = require('./routes/voucher.js');
const voucherReservationHistory = require("./routes/voucherReservationHistory.js");
const codeRoutes = require('./routes/code.js');
const orderRoutes = require('./routes/orders.js');

const webhook = require('./routes/asaasWebhook');
const cors = require('cors');
const app = express();
const cookieParser = require('cookie-parser');

app.use(express.json());
app.use(cookieParser());

app.use(cors({origin: [process.env.CLUBE_CINEMA_CLIENT_URL, process.env.CLUBE_CINEMA_CLUBE_REDE_URL, "http://localhost:5173", "http://localhost:3000"], credentials: true}));

app.use("/user", userRoutes);
app.use("/code", codeRoutes);
app.use("/establishment", establishmentRoutes);
app.use("/client", clientRoutes);
app.use("/member", memberRoutes);
app.use("/voucher", voucherRoutes);
app.use("/voucherReservationHistory", voucherReservationHistory);
app.use("/orders", orderRoutes);
app.use("/webhook", webhook);

app.listen(process.env.CLUBE_CINEMA_SERVER_PORT || 8080, () => {
  console.log("Servidor iniciado.")
}); 