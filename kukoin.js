//require('dotenv').config()
//const client = require('./services/client')
const { v4: uuidv4 } = require('uuid');



const Kucoin = require('kucoin-futures-node-api')

const apiKey = "672d5278f6b79000010aabb1"//process.env.APIKEY
const secretKey = "c8c9e811-b6af-43f5-850a-d8a9f5d40fac"//process.env.SECRETKEY
const passphrase = "Youtube44"//process.env.PASSPHRASE
const environment = "live"//process.env.ENVIROMENT

const client = new Kucoin()
client.init({
    apiKey,
    secretKey,
    passphrase,
    environment
})

//module.exports = client

var TAKE_PROFIT_PERCENT4close 
var STOP_LOSS_PERCENT4close 

////////////////////// Longgg

var PAIR1 = process.argv[2] || 'BTC'
PAIR1 = PAIR1.replace('BTC', 'XBT')
const PAIR2 = process.argv[3] || 'USDT'
const AMOUNT = process.argv[4] || 40
const LEVERAGE = process.argv[5] || 5
const TAKE_PROFIT_PERCENT = process.argv[6] || 5
const STOP_LOSS_PERCENT = process.argv[7] || 1.5

const sleep = (timeMs) => new Promise(resolve => setTimeout(resolve, timeMs))


///////////////////////////// Short 
// Función para esperar un tiempo definido
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Función para obtener la orden con reintentos
async function getOrderWithRetry(client, orderId, retries = 5, delay = 2000) {
    for (let i = 0; i < retries; i++) {
        const order = await client.getOrderById({ oid: orderId });
        if (order && order.data && order.data.filledValue && order.data.filledSize) {
            return order; // Retorna la orden si está disponible
        }
        console.log(`Reintento ${i + 1}: La orden aún no está disponible, esperando ${delay}ms...`);
        await wait(delay); // Esperar antes del siguiente intento
    }
    throw new Error(`No se pudo obtener la orden ${orderId} después de ${retries} intentos.`);
}

// Función principal ajustada
// Función para esperar un tiempo definido
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Función para obtener la orden con reintentos
async function getOrderWithRetry(client, orderId, retries = 5, delay = 2000) {
    for (let i = 0; i < retries; i++) {
        const order = await client.getOrderById({ oid: orderId });
        if (order && order.data && order.data.filledValue && order.data.filledSize) {
            return order; // Retorna la orden si está disponible
        }
        console.log(`Reintento ${i + 1}: La orden aún no está disponible, esperando ${delay}ms...`);
        await wait(delay); // Esperar antes del siguiente intento
    }
    throw new Error(`No se pudo obtener la orden ${orderId} después de ${retries} intentos.`);
}

// Función principal ajustada


async function placeShortPosition() {
    cancel4();
    await sleep(4000);

    const contracts = await client.getAllContracts();
    const contract = contracts.data.find(contract => contract.baseCurrency === PAIR1 &&
        contract.quoteCurrency === PAIR2);

    const { price, pricePlace, lotSize, multiplier, tickSize } = {
        price: contract.markPrice,
        pricePlace: contract.markPrice.toString().includes('.')
            ? contract.markPrice.toString().split('.')[1].length : 0,
        lotSize: contract.lotSize,
        multiplier: contract.multiplier,
        tickSize: contract.tickSize,
    };

    console.log('Datos del contrato:', { price, pricePlace, lotSize, multiplier, tickSize });

    // Calcular la cantidad a comprar en PAIR2
    const amountBuyPAIR2 = AMOUNT * LEVERAGE;
    const amountBuyPAIR1 = parseFloat(amountBuyPAIR2) / parseFloat(price);
    const size = parseInt((lotSize * amountBuyPAIR1) / multiplier);

    // Realizar la orden de venta (short)
    const SellOrder = await client.placeOrder({
        clientOid: uuidv4(),
        symbol: contract.symbol,
        side: 'sell',
        type: 'market',
        leverage: LEVERAGE,
        size,
    });

    if ('data' in SellOrder && 'orderId' in SellOrder.data) {
        console.log('Orden realizada:', SellOrder.data.orderId);

        try {
            // Intentar obtener la orden con reintentos
            const order = await getOrderWithRetry(client, SellOrder.data.orderId);

            // Calcular el precio de compra promedio
            const buyPrice = parseFloat((order.data.filledValue / order.data.filledSize) / multiplier).toFixed(pricePlace);
            console.log('buyPrice calculado:', buyPrice);

            // Calcular el Stop Loss (SL) y Take Profit (TP)
            let sl = parseFloat(parseFloat(buyPrice) + (parseFloat(buyPrice) * STOP_LOSS_PERCENT / 100)).toFixed(pricePlace);
            let tp = parseFloat(parseFloat(buyPrice) - (parseFloat(buyPrice) * TAKE_PROFIT_PERCENT / 100)).toFixed(pricePlace);

            // Asegurarse de que el precio esté alineado con el tickSize
            sl = Math.round(sl / tickSize) * tickSize;
            tp = Math.round(tp / tickSize) * tickSize;

            console.log('Stop Loss ajustado al tickSize:', sl);
            console.log('Take Profit ajustado al tickSize:', tp);

            // Realizar la orden de Stop Loss
            await client.placeOrder({
                clientOid: uuidv4(),
                symbol: contract.symbol,
                side: 'buy',
                stop: 'up',
                stopPrice: sl,
                stopPriceType: 'MP',
                leverage: LEVERAGE,
                type: 'market',
                size,
                closeOrder: true,
            });

            // Realizar la orden de Take Profit
            await client.placeOrder({
                clientOid: uuidv4(),
                symbol: contract.symbol,
                side: 'buy',
                stop: 'down',
                stopPrice: tp,
                stopPriceType: 'MP',
                leverage: LEVERAGE,
                type: 'market',
                size,
                closeOrder: true,
            });
        } catch (error) {
            console.error('Error al obtener la orden después de múltiples intentos:', error.message);
        }
    } else {
        console.error('Error al realizar la orden de venta.');
    }
}







/////////////////////////////////////////long 

// Función para esperar un tiempo definido
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Función para cancelar órdenes de TP y SL existentes
async function cancelExistingOrders(client, symbol, retries = 5, delay = 2000) {
    try {
        const orders = await client.getOrders({ symbol });
        for (const order of orders.data) {
            if (order.stop && (order.stop === 'up' || order.stop === 'down')) {
                console.log(`Cancelando la orden con ID ${order.orderId}`);
                await client.cancelOrder({ orderId: order.orderId });
            }
        }
    } catch (error) {
        console.error('Error al intentar cancelar órdenes existentes:', error.message);
    }
}

// Función para obtener la orden con reintentos
async function getOrderWithRetry(client, orderId, retries = 5, delay = 2000) {
    for (let i = 0; i < retries; i++) {
        const order = await client.getOrderById({ oid: orderId });
        if (order && order.data && order.data.filledValue && order.data.filledSize) {
            return order; // Retorna la orden si está disponible
        }
        console.log(`Reintento ${i + 1}: La orden aún no está disponible, esperando ${delay}ms...`);
        await wait(delay); // Esperar antes del siguiente intento
    }
    throw new Error(`No se pudo obtener la orden ${orderId} después de ${retries} intentos.`);
}

// Función para colocar la orden de Long con TP y SL
async function placeLongPosition() {
    cancel4();
    await wait(4000);

    const contracts = await client.getAllContracts();
    const contract = contracts.data.find(contract => contract.baseCurrency === PAIR1 &&
        contract.quoteCurrency === PAIR2);

    var { price, pricePlace, lotSize, multiplier } = {
        price: contract.markPrice,
        pricePlace: contract.markPrice.toString().includes('.')
            ? contract.markPrice.toString().split('.')[1].length : 0,
        lotSize: contract.lotSize,
        tickSize: contract.indexPriceTickSize,
        multiple: contract.tickSize,
        multiplier: contract.multiplier
    };

    const amountBuyPAIR2 = AMOUNT * LEVERAGE;
    const amountBuyPAIR1 = parseFloat(amountBuyPAIR2) / parseFloat(price);
    const size = parseInt((lotSize * amountBuyPAIR1) / multiplier);

    // Realizar la orden de compra (long)
    const BuyOrder = await client.placeOrder({
        clientOid: uuidv4(),
        symbol: contract.symbol,
        side: 'buy',
        type: 'market',
        leverage: LEVERAGE,
        size,
    });

    if ('data' in BuyOrder && 'orderId' in BuyOrder.data) {
        let order;
        try {
            // Intentar obtener la orden de compra por ID
            order = await getOrderWithRetry(client, BuyOrder.data.orderId);
            const buyPrice = parseFloat((order.data.filledValue / order.data.filledSize)
                / multiplier).toFixed(pricePlace);

            // Calcular el Take Profit (TP) y Stop Loss (SL)
            let tp = parseFloat(parseFloat(buyPrice)
                + (parseFloat(buyPrice) * TAKE_PROFIT_PERCENT / 100)).toFixed(pricePlace);
            let sl = parseFloat(parseFloat(buyPrice)
                - (parseFloat(buyPrice) * STOP_LOSS_PERCENT / 100)).toFixed(pricePlace);

            console.log('TP calculado:', tp);
            console.log('SL calculado:', sl);

            // Cancelar las órdenes existentes de TP y SL antes de colocar nuevas
            await cancelExistingOrders(client, contract.symbol);

            // Colocar órdenes de Stop Loss y Take Profit
            await wait(1000); // Esperar un poco antes de colocar las órdenes

            await client.placeOrder({
                clientOid: uuidv4(),
                symbol: contract.symbol,
                side: 'sell',
                stop: 'up',
                stopPrice: tp,
                stopPriceType: 'MP',
                leverage: LEVERAGE,
                type: 'market',
                size,
                closeOrder: true,
            });

            await client.placeOrder({
                clientOid: uuidv4(),
                symbol: contract.symbol,
                side: 'sell',
                stop: 'down',
                stopPrice: sl,
                stopPriceType: 'MP',
                leverage: LEVERAGE,
                type: 'market',
                size,
                closeOrder: true,
            });

        } catch (error) {
            console.error('Error al obtener la orden de compra:', error.message);

            // Si no se puede obtener la orden, intentar esperar y reintentar
            console.log('Esperando 5 segundos antes de reintentar...');
            await wait(5000);
            await placeLongPosition(); // Volver a intentar
        }
    } else {
        console.log('¡Orden no ejecutada!');
    }
}



//////Cancela

async function cancel4()
{
    const orders = await client.getStopOrders()

    try {

        if(orders.data.items.length>0)
        {
            for(var i=0; orders.data.items.length>= i; i++)
            {
                var id = orders.data.items[i].id
               var order = await client.cancelOrder({ id })
               console.log(orders.data.items[i].id + " :odenes ");
    
            }
            return
        }

        if(orders.data.items.length==0)
        {
            console.log( "sin ordenes ");
            return
        }
      return
         
    } catch (err) {
        console.log( "Cayo errror ");
        return
        
    }

}

/////Stop 

async function StopLong()
{

    const amountBuyPAIR2 = AMOUNT * LEVERAGE

    const amountBuyPAIR1 = parseFloat(amountBuyPAIR2) / parseFloat(price)
    //const orders = await client.getOrders()
    const contracts = await client.getAllContracts()
    const contract = contracts.data.find(contract => contract.baseCurrency === PAIR1 &&
        contract.quoteCurrency === PAIR2)
    

        var { price, pricePlace, lotSize, multiplier } = {
            price: contract.markPrice,
            pricePlace: contract.markPrice.toString().includes('.')
                ? contract.markPrice.toString().split('.')[1].length : 0,
            lotSize: contract.lotSize,
            tickSize: contract.indexPriceTickSize,
            multiple: contract.tickSize,
            multiplier: contract.multiplier
        }

        console.log(price+  " :El precio ");
        await sleep(1000)

        const size = parseInt((lotSize * amountBuyPAIR1) / multiplier)
        await client.placeOrder({
            clientOid: uuidv4(),
            symbol: contract.symbol,
            side: 'sell',
            stop: 'up',
            stopPrice: price,
            stopPriceType: 'MP',
            leverage: LEVERAGE,
            type: 'market',
            size,
            closeOrder: true,
        })

        await client.placeOrder({
            clientOid: uuidv4(),
            symbol: contract.symbol,
            side: 'sell',
            stop: 'down',
            stopPrice: price,
            stopPriceType: 'MP',
            leverage: LEVERAGE,
            type: 'market',
            size,
            closeOrder: true,
        })

}


async function StopShort()
{

    const amountBuyPAIR2 = AMOUNT * LEVERAGE

    const amountBuyPAIR1 = parseFloat(amountBuyPAIR2) / parseFloat(price)
    //const orders = await client.getOrders()
    const contracts = await client.getAllContracts()
    const contract = contracts.data.find(contract => contract.baseCurrency === PAIR1 &&
        contract.quoteCurrency === PAIR2)
    

        var { price, pricePlace, lotSize, multiplier } = {
            price: contract.markPrice,
            pricePlace: contract.markPrice.toString().includes('.')
                ? contract.markPrice.toString().split('.')[1].length : 0,
            lotSize: contract.lotSize,
            tickSize: contract.indexPriceTickSize,
            multiple: contract.tickSize,
            multiplier: contract.multiplier
        }

        console.log(price+  " :El precio ");

        await sleep(1000)

        const size = parseInt((lotSize * amountBuyPAIR1) / multiplier)
        await client.placeOrder({
            clientOid: uuidv4(),
            symbol: contract.symbol,
            side: 'sell',
            stop: 'down',
            stopPrice: price,
            stopPriceType: 'MP',
            leverage: LEVERAGE,
            type: 'market',
            size,
            closeOrder: true,
        })

        await client.placeOrder({
            clientOid: uuidv4(),
            symbol: contract.symbol,
            side: 'sell',
            stop: 'up',
            stopPrice: price,
            stopPriceType: 'MP',
            leverage: LEVERAGE,
            type: 'market',
            size,
            closeOrder: true,
        })

}



const cancelall = async (attemps = 0) => {
    await sleep(1000)
    const orders = await client.getStopOrders()

    console.log(orders.data.items.length+ " odenes 0");
    try {

        if(orders.data.items.length>0)
        {
            for(var i=0; orders.data.items.length>= i; i++)
            {
                var id = orders.data.items[i].id
               var order = await client.cancelOrder({ id })
               console.log(orders.data.items[i].id + "odenes ");
    
            }
        }

        if(orders.data.items.length==0)
        {
            console.log( "sin ordenes ");
        }
                return
         
    } catch (err) {
        if (attemps < 5)
            return checkOrdersStatus(++attemps)
    }
}
/// Suscribete 
//StopShort();
//StopLong();
//placeShortPosition()
//placeLongPosition();

function ordergoo(){
    console.log('order status');
    client.getStopOrders(uuidv4());
}
//ordergoo();


mmmm =function(){

    
    console.log('mmmm 6 ');
}

Longkoin =function(){

    placeLongPosition();
    console.log('Long kukoin ');
}

Shortkoin =function(){

    placeShortPosition();
    console.log('Short kukoin');
}

StopLongkoin =function(){

    StopLong();
    console.log('Stop Long kukoin');
}
StopShortkoin =function(){

    StopShort();
    console.log('Stop Short Kukoin');
}



