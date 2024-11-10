


const Binance = require('node-binance-api');
const binance = new Binance().options({
    APIKEY: 'oWb4GJrpi5HlV8zqaERCP5t8CPg4RaMO3iqMFWzdWLCPUFGr5U88OVQWy91lUi1i',
    APISECRET: '0OacSe9e5fC57OqQsFCm2bjU1DXwH4A3uovTZtkTDooeX2HU30L6yyo3EO0OUH8m'
});


///// APIKEY: 'oWb4GJrpi5HlV8zqaERCP5t8CPg4RaMO3iqMFWzdWLCPUFGr5U88OVQWy91lUi1i',
 //// APISECRET: '0OacSe9e5fC57OqQsFCm2bjU1DXwH4A3uovTZtkTDooeX2HU30L6yyo3EO0OUH8m'


 


const PAIR1 = process.argv[2] || 'BTC'
const PAIR2 = process.argv[3] || 'USDT'
var AMOUNT = process.argv[4] || 80
const LEVERAGE = process.argv[5] || 5           /// apalancamiento 
const TAKE_PROFIT_PERCENT = process.argv[6] || 6 
const STOP_LOSS_PERCENT = process.argv[7] || 1

const market = `${PAIR1}${PAIR2}`



  
async function placeLongPosition() {
   
   /// const balance = (await binance.futuresBalance()).filter(item => {
    //    return item.asset === PAIR2
   // })[0].availableBalance

   const balance = 120 //(await binance.futuresBalance())[6].availableBalance

    console.log(balance);

    const amountBuyPAIR2 = AMOUNT * LEVERAGE
    await binance.futuresLeverage(market, LEVERAGE)
    const price = (await binance.futuresMarkPrice(market)).markPrice
    const amountBuyPAIR1 = parseFloat(amountBuyPAIR2) / parseFloat(price)

    if (balance >= amountBuyPAIR2 / LEVERAGE) {
        var orders = [{
            symbol: market,
            side: "BUY",
            type: "LIMIT",
            price: parseFloat(price).toFixed(0),
            positionSide: 'BOTH',
            reduceOnly: 'false',
            timeInForce: 'GTC',
            quantity: parseFloat(amountBuyPAIR1).toFixed(3)
        }]

        var result = await binance.futuresMultipleOrders(orders)
        console.log(result)
        orders = [{
                symbol: market,
                side: "SELL",
                type: "TAKE_PROFIT_MARKET",
                priceProtect: 'true',
                reduceOnly: 'true',
                workingType: 'MARK_PRICE',
                timeInForce: 'GTE_GTC',
                stopPrice: parseFloat(parseFloat(price) + (parseFloat(price) * TAKE_PROFIT_PERCENT / 100)).toFixed(0),
                quantity: parseFloat(amountBuyPAIR1).toFixed(3),
                closePossition: 'true'
            },
            {
                symbol: market,
                side: "SELL",
                type: "STOP_MARKET",
                priceProtect: 'true',
                reduceOnly: 'true',
                workingType: 'MARK_PRICE',
                timeInForce: 'GTE_GTC',
                stopPrice: parseFloat(parseFloat(price) - (parseFloat(price) * STOP_LOSS_PERCENT / 100)).toFixed(0),
                quantity: parseFloat(amountBuyPAIR1).toFixed(3),
                closePossition: 'true'
            }
        ]
        result = await binance.futuresMultipleOrders(orders)
        console.log(result)
       // process.exit();
    }
}


async function placeShortPosition() {
    const market = `${PAIR1}${PAIR2}`
    //const balance = (await binance.futuresBalance()).filter(item => {
   //     return item.asset === PAIR2
    //})[0].availableBalance
    const balance = 120
    console.log(balance);

    const amountBuyPAIR2 = AMOUNT * LEVERAGE
    await binance.futuresLeverage(market, LEVERAGE)
    const price = (await binance.futuresMarkPrice(market)).markPrice
    const amountBuyPAIR1 = parseFloat(amountBuyPAIR2) / parseFloat(price)

    if (balance >= amountBuyPAIR2 / LEVERAGE) {
        var orders = [{
            symbol: market,
            side: "SELL",
            type: "LIMIT",
            price: parseFloat(price).toFixed(0),
            positionSide: 'BOTH',
            reduceOnly: 'false',
            timeInForce: 'GTC',
            quantity: parseFloat(amountBuyPAIR1).toFixed(3)
        }]

        var result = await binance.futuresMultipleOrders(orders)
        console.log(result)
        orders = [{
                symbol: market,
                side: "BUY",
                type: "TAKE_PROFIT_MARKET",
                priceProtect: 'true',
                reduceOnly: 'true',
                workingType: 'MARK_PRICE',
                timeInForce: 'GTE_GTC',
                stopPrice: parseFloat(parseFloat(price) - (parseFloat(price) * TAKE_PROFIT_PERCENT / 100)).toFixed(0),
                quantity: parseFloat(amountBuyPAIR1).toFixed(3),
                closePossition: 'true'
            },
            {
                symbol: market,
                side: "BUY",
                type: "STOP_MARKET",
                priceProtect: 'true',
                reduceOnly: 'true',
                workingType: 'MARK_PRICE',
                timeInForce: 'GTE_GTC',
                stopPrice: parseFloat(parseFloat(price) + (parseFloat(price) * STOP_LOSS_PERCENT / 100)).toFixed(0),
                quantity: parseFloat(amountBuyPAIR1).toFixed(3),
                closePossition: 'true'
            }
        ]
        result = await binance.futuresMultipleOrders(orders)
        console.log(result)
       // process.exit();
    }
}




const TAKE_PROFIT_PERCENTPrueba = process.argv[6] || 0.01
const STOP_LOSS_PERCENTPrueba = process.argv[7] || 0.01


async function Closelong4 ()
{

    const market = `${PAIR1}${PAIR2}`
 // const balance = (await binance.futuresBalance()).filter(item => {
 //     return item.asset === PAIR2
 // })[0].availableBalance

 const balance = 120
  console.log(balance);

  const amountBuyPAIR2 = AMOUNT * LEVERAGE
  await binance.futuresLeverage(market, LEVERAGE)
  const price = (await binance.futuresMarkPrice(market)).markPrice
  const amountBuyPAIR1 = parseFloat(amountBuyPAIR2) / parseFloat(price)
  orders = [{
    symbol: market,
    side: "SELL",
    type: "TAKE_PROFIT_MARKET",
    priceProtect: 'true',
    reduceOnly: 'true',
    workingType: 'MARK_PRICE',
    timeInForce: 'GTE_GTC',
    stopPrice: parseFloat(parseFloat(price) + (parseFloat(price) * TAKE_PROFIT_PERCENTPrueba / 100)).toFixed(0),
    quantity: parseFloat(amountBuyPAIR1).toFixed(3),
    closePossition: 'true'
},
{
    symbol: market,
    side: "SELL",
    type: "STOP_MARKET",
    priceProtect: 'true',
    reduceOnly: 'true',
    workingType: 'MARK_PRICE',
    timeInForce: 'GTE_GTC',
    stopPrice: parseFloat(parseFloat(price) - (parseFloat(price) * STOP_LOSS_PERCENTPrueba / 100)).toFixed(0),
    quantity: parseFloat(amountBuyPAIR1).toFixed(3),
    closePossition: 'true'
}
]
result = await binance.futuresMultipleOrders(orders)
console.log(result)

//process.exit();
}





async function closeShorts4() {
    const market = `${PAIR1}${PAIR2}`
   // const balance = (await binance.futuresBalance()).filter(item => {
   //     return item.asset === PAIR2
   // })[0].availableBalance

   const balance = 120

    console.log(balance);

    const amountBuyPAIR2 = AMOUNT * LEVERAGE
    await binance.futuresLeverage(market, LEVERAGE)
    const price = (await binance.futuresMarkPrice(market)).markPrice
    const amountBuyPAIR1 = parseFloat(amountBuyPAIR2) / parseFloat(price)

    
        orders = [{
                symbol: market,
                side: "BUY",
                type: "TAKE_PROFIT_MARKET",
                priceProtect: 'true',
                reduceOnly: 'true',
                workingType: 'MARK_PRICE',
                timeInForce: 'GTE_GTC',
                stopPrice: parseFloat(parseFloat(price) - (parseFloat(price) * TAKE_PROFIT_PERCENTPrueba / 100)).toFixed(0),
                quantity: parseFloat(amountBuyPAIR1).toFixed(3),
                closePossition: 'true'
            },
            {
                symbol: market,
                side: "BUY",
                type: "STOP_MARKET",
                priceProtect: 'true',
                reduceOnly: 'true',
                workingType: 'MARK_PRICE',
                timeInForce: 'GTE_GTC',
                stopPrice: parseFloat(parseFloat(price) + (parseFloat(price) * STOP_LOSS_PERCENTPrueba / 100)).toFixed(0),
                quantity: parseFloat(amountBuyPAIR1).toFixed(3),
                closePossition: 'true'
            }
        ]
        result = await binance.futuresMultipleOrders(orders)
        console.log(result)
       // process.exit();
    }


//placeShortPosition()
///closeShorts4();
 //Closelong4();
//binance.forceClosePositions(81916495628);

//placeLongPosition();


 const f =function(){
    console.log('una funcion');
}

bi =function(){
    console.log('Binance una funcion');
}

wow =function(){

   // placeLongPosition()
    console.log('wow una funcion  ');
}


LongOn =function(){

    placeLongPosition()
    console.log('Long On ');
}

ShortOn =function(){

    placeShortPosition()
    console.log('Short on  ');
}

StopShort =function(){

    closeShorts4()
    console.log('Stop Shortg ');
}

Stoplong =function(){

    Closelong4()
    console.log('Stop long ');
}


Cambio =function(hola){

    
    console.log('Stop long '+ hola);

    AMOUNT = hola

    console.log('amaun vale '+ AMOUNT);
}

async function VerBalance() {
    
    const balance = (await binance.futuresBalance())[6].availableBalance
console.log(balance+ "Balance ");

//console.info( await binance.futuresBalance() );

}
//VerBalance();
////placeLongPosition();

//module.exports= f;
///placeLongPosition();

//module.exports= placeLongPosition();

//console.log('amaun vale '+ AMOUNT);