import express from "express";
import mercadopago from "mercadopago";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

// Configura tu access token aquí
mercadopago.configurations.setAccessToken("TU_ACCESS_TOKEN_AQUI");

app.post("/crear-preferencia", async (req, res) => {
    try {
        const items = req.body.items;
        const preference = {
            items: items,
            back_urls: {
                success: "https://elrincondechiara.github.io/mitienda/success",
                failure: "https://elrincondechiara.github.io/mitienda/failure",
                pending: "https://elrincondechiara.github.io/mitienda/pending"
            },
            auto_return: "approved"
        };

        const response = await mercadopago.preferences.create(preference);
        res.json({ init_point: response.body.init_point });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al crear preferencia" });
    }
});

app.listen(3000, () => {
    console.log("Servidor Mercado Pago escuchando en puerto 3000");
});
