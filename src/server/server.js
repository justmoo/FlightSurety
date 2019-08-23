import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';


let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);




  //register 20 oracles
  let oracles = [];
  for (var i = 0 ; i < 20 ; i++){
      (async () => {
          try{
            let accounts =  await web3.eth.getAccounts();
            await flightSuretyApp.methods.registerOracle().send({from:accounts[i + 10], value:web3.utils.toWei('1', 'ether'), gas: 9999999,
            gasPrice: 20000000000
      });
            let indexes = await flightSuretyApp.methods.getMyIndexes().call({from: accounts[i + 10]});
            oracles.push({address:accounts[i + 10], ids:indexes});
            
        }catch(error){console.log(error)}
             })();
  }
  
let randomStatus = () => { // select the number at random
  let status = [10, 20, 30, 40, 50];
  number = Math.floor(Math.random() * 4);
  return status[number];
}
flightSuretyApp.events.OracleRequest({
    fromBlock: 0
  }, async function (error, event) {
    try{
     if (error) return console.log(error);
      for(var i=0; i<oracles.length;i++){
        let returns = await event.returnValues;
        if(oracles.ids.indexOf(returns.index) !== -1){
          let status = randomStatus();
          await flightSuretyApp.methods.submitOracleResponse(returns.index,returns.airline,returns.flight,returns.timestamp,status).send({
            from:oracles[i].address,
            gas: 9999999,
            gasPrice: 20000000000

          });
        }
      }
    }catch(error){console.log(error); console.log("it didnt submit")}
    
    
    console.log(event)
});

const app = express();
app.get('/api', (req, res) => {
    res.send({
      message: 'well hello there!'
    })
})

export default app;


