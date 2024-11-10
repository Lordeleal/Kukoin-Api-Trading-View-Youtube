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

async function placeShortPosition() {
    cancel4();
    await sleep(4000);
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

    const amountBuyPAIR2 = AMOUNT * LEVERAGE

    const amountBuyPAIR1 = parseFloat(amountBuyPAIR2) / parseFloat(price)

    const size = parseInt((lotSize * amountBuyPAIR1) / multiplier)
    const SellOrder = await client.placeOrder({
        clientOid: uuidv4(),
        symbol: contract.symbol,
        side: 'sell',
        type: 'market',
        leverage: LEVERAGE,
        size,
    })

    if ('data' in SellOrder && 'orderId' in SellOrder.data) {
        var order = await client.getOrderById({ oid: SellOrder.data.orderId })
        const buyPrice = parseFloat((order.data.filledValue / order.data.filledSize)
            / multiplier).toFixed(pricePlace)
        /// short
        var sl = parseFloat(parseFloat(buyPrice)
        + (parseFloat(buyPrice) * STOP_LOSS_PERCENT / 100)).toFixed(pricePlace)

        var tp = parseFloat(parseFloat(buyPrice)
        - (parseFloat(buyPrice) * TAKE_PROFIT_PERCENT / 100)).toFixed(pricePlace)

            

        await sleep(1000)

        await client.placeOrder({
            clientOid: uuidv4(),
            symbol: contract.symbol,
            side: 'sell',
            stop: 'down',
            stopPrice: tp,
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
            stopPrice: sl,
            stopPriceType: 'MP',
            leverage: LEVERAGE,
            type: 'market',
            size,
            closeOrder: true,
        })
    } else {
        console.log('¡Order not executed!')
    }
}



/////////////////////////////////////////long 

async function placeLongPosition() {
    
    cancel4();
    await sleep(4000);
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

    const amountBuyPAIR2 = AMOUNT * LEVERAGE

    const amountBuyPAIR1 = parseFloat(amountBuyPAIR2) / parseFloat(price)

    const size = parseInt((lotSize * amountBuyPAIR1) / multiplier)
    const BuyOrder = await client.placeOrder({
        clientOid: uuidv4(),
        symbol: contract.symbol,
        side: 'buy',
        type: 'market',
        leverage: LEVERAGE,
        size,
    })

    if ('data' in BuyOrder && 'orderId' in BuyOrder.data) {
        var order = await client.getOrderById({ oid: BuyOrder.data.orderId })
        const buyPrice = parseFloat((order.data.filledValue / order.data.filledSize)
            / multiplier).toFixed(pricePlace)
        ///// long 
        var tp = parseFloat(parseFloat(buyPrice)
            + (parseFloat(buyPrice) * TAKE_PROFIT_PERCENT / 100)).toFixed(pricePlace)

        var sl = parseFloat(parseFloat(buyPrice)
            - (parseFloat(buyPrice) * STOP_LOSS_PERCENT / 100)).toFixed(pricePlace)

       

        await sleep(1000)

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
        })

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
        })
    } else {
        console.log('¡Order not executed!')
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
















async function ordergoo44548(){
    var order = await client.getOrderById({ oid: BuyOrder.data.orderId })
        const buyPrice = parseFloat((order.data.filledValue / order.data.filledSize)
            / multiplier).toFixed(pricePlace)

            TAKE_PROFIT_PERCENT4close= buyPrice
            STOP_LOSS_PERCENT4close = buyPrice

        var tp = parseFloat(parseFloat(buyPrice)
            + (parseFloat(buyPrice) * TAKE_PROFIT_PERCENT4close / 100)).toFixed(pricePlace)

        var sl = parseFloat(parseFloat(buyPrice)
            - (parseFloat(buyPrice) * TAKE_PROFIT_PERCENT4close / 100)).toFixed(pricePlace)

        client.initSocket({ topic: "advancedOrders", symbols: [`${PAIR1}-${PAIR2}`] }, (msg) => {
            const res = JSON.parse(msg)
            if ('data' in res) {

                process.exit()
                const order = res.data
                console.log(order.orderId, ': ', order.stop, order.type)
                if (order.type === 'triggered') {
                   /// checkOrdersStatus()
                   process.exit()
                } else if (order.type === 'cancel') {
                    process.exit()
                }
            }
        })

        await sleep(1000)

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
        })

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
        })
}