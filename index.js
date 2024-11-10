const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');



// Importar los módulos de Binance y Kucoin
const Binance = require('./Binance.js');
const kukoin = require('./kukoin.js');

// Configuración del servidor
const PORT = process.env.PORT || 3000;
const server = require('http').Server(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.text());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", '*');
  res.header("Access-Control-Allow-Credentials", true);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
  next();
});

// Funciones auxiliares para modificar archivos JSON
function modifyJsonFile(filepath, newData) {
  const data = JSON.parse(fs.readFileSync(filepath));
  Object.assign(data, newData);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  console.log("Archivo JSON modificado:", newData);
}

// Rutas del API
app.post('/webhook', (req, res) => {
  try {
    const data = req.body;
    console.log("Datos recibidos:", data);

    const { Order_action, Bot, Alert } = data;

    if (Order_action === 'sell' && Bot === 'Si' && Alert === 'exit_buy') {
      console.log('Ejecutando: Stop Long en Kucoin');
      kukoin.StopShort(); // Función de Kucoin
    }

    if (Order_action === 'buy' && Bot === 'Si' && Alert === 'exit_sell') {
      console.log('Ejecutando: Stop Short en Kucoin');
      kukoin.StopShort(); // Función de Kucoin
    }

    if (Order_action === 'buy' && Bot === 'Si' && Alert === 'ok buy') {
      console.log('Ejecutando: Long en Kucoin');
      kukoin.placeLongPosition(); // Función de Kucoin
    }

    if (Order_action === 'sell' && Bot === 'Si' && Alert === 'ok sell') {
      console.log('Ejecutando: Short en Kucoin');
      kukoin.placeShortPosition(); // Función de Kucoin
    }

    res.status(200).send("Webhook procesado exitosamente");
  } catch (error) {
    console.error('Error procesando webhook:', error);
    res.status(400).send("Error en el formato de datos");
  }
});

app.post('/BuyKukoin', (req, res) => {
  console.log('Ejecutando: Buy kukoin');
  kukoin.placeLongPosition(); // Función de Kukoin
  res.status(200).send("[POST] Buy Binance ejecutado");
});

app.post('/ShortKukoin', (req, res) => {
  console.log('Ejecutando: Short en Kucoin');
  kukoin.Short(); // Función de Kucoin
  res.status(200).send("[POST] Short en Kucoin ejecutado");
});

app.post('/StopShortKukoin', (req, res) => {
  const user_id = req.param('id');
  console.log(`Ejecutando: Stop Short en Kucoin para `);
  kukoin.StopShort(); // Función de Kucoin
  res.status(200).send(`[POST] Stop Short ejecutado para `);
});

// Iniciar el servidor
server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


