import express from "express";
import cors from "cors";
import mercadopago from "mercadopago";

const app = express();
app.use(express.json());
app.use(cors());

mercadopago.configure({
    access_token: process.env.MP_ACCESS_TOKEN
});

app.post("/crear-preferencia", async (req, res) => {
    try {
        const preference = { items: req.body.items };
        const response = await mercadopago.preferences.create(preference);
        res.json({ init_point: response.body.init_point });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al crear preferencia" });
    }
});

// Ruta de prueba para el navegador
app.get("/", (req, res) => {
    res.send("El backend de El Rincón de Chiara está funcionando correctamente ✅");
});

// NO USAR UN PUERTO FIJO
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
});