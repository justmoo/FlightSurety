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
        this.flights = [{name: 'Flight A', timestamp: Date.now()},{name: 'Flight B', timestamp: Date.now()},{name: 'Flight C', timestamp: Date.now()}];
        

    }

      initialize(callback) {
         this.web3.eth.getAccounts((error, accts) => {
           
            this.owner = accts[0];
            this.airline1 =accts[1];
            this.passenger = accts[2];
            
            alert(this.owner);

            let counter = 3;
            
            while(this.airlines.length < 5) {
                this.airlines.push(accts[counter++]);
            }

            while(this.passengers.length < 5) {
                this.passengers.push(accts[counter++]);
            }
            for(let i = 0 ; i < this.flights.length;i++){
              this.flightSuretyApp.methods.registerFlight(this.flights[i].name,this.flights[i].timestamp).send({from:this.airline1, gas: 9999999,
                gasPrice: 20000000000},(error)=>{
                if(error){ console.log(error);
                }else{
                    this.flightSuretyApp.methods.buy(this.airline1,this.flights.name,this.flights.timestamp).send({from:this.passenger,value:web3.eth.toWei('1','ether')});
                }
            
            });
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

    ttrackFlight(callback) {
        this.flightSuretyApp.events.FlightStatusInfo({
            fromBlock: 0
        }, (err, event) => {
            console.log('EVENT', err, event);

            if (err) {
                console.log(err);
                callback(err);
            }

        })
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