import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';
import Config from './config.json';
import Web3 from 'web3';

export default class Contract {
    constructor(network, callback) {

        let config = Config[network];
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.flightSuretyData = new this.web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);
        this.initialize(callback);
        this.owner = null;
        this.airlines = [];
        this.passengers = [];
        this.flights = [{name: 'Flight A', timestamp: Date.now()},{name: 'Flight B', timestamp: Date.now()},{name: 'Flight C', timestamp: Date.now()}];
        

    }

      initialize(callback) {
         this.web3.eth.getAccounts( async (error, accts) => {
           
            try{
            this.owner = accts[0];
            this.airline1 =accts[1];
            this.passenger = accts[2];

             await this.flightSuretyData.methods.authorizeCaller(this.flightSuretyApp.options.address).send({
                 from: this.owner,
                 gas: 9999999,
                 gasPrice: 20000000000
            });
           
           
            
            alert(this.owner);

            let counter = 3;
            
            while(this.airlines.length < 5) {
                this.airlines.push(accts[counter++]);
            }

            while(this.passengers.length < 5) {
                this.passengers.push(accts[counter++]);
            }
            for(let i = 0 ; i < this.flights.length;i++){
              await this.flightSuretyApp.methods.registerFlight(this.flights[i].name,this.flights[i].timestamp).send({from:this.airline1, gas: 9999999,
                gasPrice: 20000000000}, async (error)=>{
                if(error){ alert(error);

                }else{

                 await this.flightSuretyApp.methods.buy(this.airline1,this.flights.name,this.flights.timestamp).send({from:this.passenger,value:web3.eth.toWei('1','ether'), gas: 9999999,
                 gasPrice: 20000000000});
                
                }
            });
        }
        }catch(error){
            alert(error);
        }   
            
            callback();
        });
    }

    isOperational(callback) {
       let self = this;
       self.flightSuretyApp.methods
            .isOperational()
            .call({ from: self.owner, gas: 9999999,
                gasPrice: 20000000000}, callback);
    }

    fetchFlightStatus(flight, callback) {
        let self = this;
        let payload = {
            airline: self.airline1,
            flight: flight.name,
            timestamp: flight.timestamp
        } 
        self.flightSuretyApp.methods
            .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
            .send({ from: self.owner}, (error, result) => {
                if(!erorr){
                    self.events.FlightStatusInfo()
                }
                callback(error, payload);
            });
    }   

    
            buy(flight,callback){
                
                let self = this;
                let payload ={
                    airline : self.airline1,
                    flight : flight.name,
                    timestamp : flight.timestamp
                }   
                self.flightSuretyApp.methods.buy(payload.airline,payload.flight,payload.timestamp).send({from:this.passenger,value:web3.eth.toWei('1','ether'), gas: 9999999,
                gasPrice: 20000000000})
        
            }



    
}