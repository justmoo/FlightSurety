import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';

export default class Contract {
    constructor(network, callback) {

        let config = Config[network];
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.initialize(callback);
        this.owner = null;
        this.airlines = [];
        this.passengers = [];
        this.flight = {name: 'FlightA', timestamp: Date.now()};
        

    }

      initialize(callback) {
         this.web3.eth.getAccounts((error, accts) => {
           
            this.owner = accts[0];
            this.airline1 =accts[1];
            this.flightA = "NA132";
            this.flightB = "NA152";
            this.passenger = accts[2];
            
            alert(this.owner);

            let counter = 1;
            
            while(this.airlines.length < 5) {
                this.airlines.push(accts[counter++]);
            }

            while(this.passengers.length < 5) {
                this.passengers.push(accts[counter++]);
            }
            
              this.flightSuretyApp.methods.registerFlight(this.flight.name,this.flight.timestamp).send({from:this.airline1, gas: 9999999,
                gasPrice: 20000000000},(error)=>{
                if(error){ console.log(error)
                }else{
                    this.flightSuretyApp.methods.buy(this.flight.name,this.passenger);
                }
            });
            

            
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
            airline: self.airlines[0],
            flight: flight,
            timestamp: Math.floor(Date.now() / 1000)
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

        




    
}