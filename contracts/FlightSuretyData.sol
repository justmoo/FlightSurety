pragma solidity ^0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/
    
    address private contractOwner;                                      // Account used to deploy contract
    bool private operational = true;
    uint256 private airlinesCount = 1;

                
    struct Airline{ 
        string name;
        bool isRegistered;
        bool isFunded;
        uint256 balance;
    }
    struct passengersPurchase{ 
        uint256 balance;
        uint256 insuranceCredit;
    }
    mapping (address => Airline) airlines; // mapping for the airlines
    mapping (address => address[]) votes; // to see how many votes an airline got
    mapping (address => address[]) voted; // to see how many times an airline voted
    mapping (address => mapping(bytes32 => passengersPurchase)) passengers;
    mapping (address=> bool) authorized;                   
    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/


    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor
                                (
                                    address _firstAirline, string _name
                                ) 
                                public 
    {
        contractOwner = msg.sender;
        Airline memory firstAirline = Airline({name:_name,isRegistered:true,isFunded:true,balance:10});
        airlines[_firstAirline] = firstAirline;
        

    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in 
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational()
    {
        require(operational, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    // /********************************************************************************************/
    // /*                                       UTILITY FUNCTIONS                                  */
    // /********************************************************************************************/

    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */      
    function isOperational() 
                            public 
                            view 
                            returns(bool) 
    {
        return operational;
    }
    function authorizeCaller (address _address) external requireContractOwner {
        authorized[_address] = true;
    }
    function DeAuthorizeCaller (address _address) external requireContractOwner {
        authorized[_address] = false;
    }
    function isAirline (address _address) external view returns (bool){
        bool result = false;
        if(airlines[_address].isRegistered == true){
                result = true;
        }
        return result;
    }
    function isFunded (address _address) external view returns(bool){
        bool result = false;
         if(airlines[_address].isFunded == true){
                   result = true;
        }
        return result;
    }

    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */    
    function setOperatingStatus
                            (
                                bool mode
                            ) 
                            external
                            requireContractOwner 
    {
        operational = mode;
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */   
    function registerAirline
                            (  address _address, string  _name
                            )
                            external
                            
    {
        Airline memory _airline = Airline({name:_name,isRegistered:false,isFunded:false,balance:0});
         require(airlines[msg.sender].isRegistered == true,"the airline registrar must be registered");
         require(airlines[msg.sender].isFunded == true, "fund the airline account with 10 ether");
        if(airlinesCount <= 4) {
        airlines[_address] = _airline;
        airlines[_address].isRegistered = true;
        airlinesCount++;
        }else{
            //if there is more than 4 airlines you have to get consensus
            //checks if the sender voted before
             bool duplicate = false;
            address[]  _addresses = votes[_address];
            if(_addresses.length < 0 ){
            for(uint i = 0 ; i < _addresses.length ; i++){
                 if(_addresses[i] == msg.sender){
                    duplicate = true;
                break;
                }
                }
        require(duplicate == false,"you voted before");
          if (duplicate == false)  {
            votes[_address].push(msg.sender);
            airlines[_address] = _airline;
    
       }
         
      }
            
     }
    }

function voteToAirline (address _address) external
{
    bool duplicate = false;
    require(airlines[_address].isRegistered == false, "already registered");
    require(airlines[msg.sender].isRegistered == true, "you have to be registered");
    require(airlines[msg.sender].isFunded == true, "fund the airline account with 10 ether");
    //check if there is a duplicate, or if he did vote before
     address[]  _addresses = votes[_address];
      for(uint i = 0 ; i < _addresses.length ; i++){
          if(_addresses[i] == msg.sender){
              duplicate = true;
              break;
          }
      }
    // vote
    if(duplicate == false){
    votes[_address].push(msg.sender);
    voted[msg.sender].push(_address);
    }
    //check the votes and if its more than airlinesCount/2 then approve it
        if(votes[_address].length > airlinesCount/2 && duplicate == false)
        {
        airlines[_address].isRegistered = true;
        }
}
   /**
    * @dev Buy insurance for a flight
    *
    */   
    function buy
                            ( bytes32 flight, address _address
                            )
                            external
                            payable
    {
            require(msg.value >= 1, "up to 1 ether no mother");
            passengers[_address][flight] = passengersPurchase({balance: 0, insuranceCredit: msg.value});
    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees
                                (address _address,address airline,string flight, uint256 timestamp, uint256 amount
                                )
                                external
                                
    {
        bytes32 key = getFlightKey(airline,flight,timestamp);
        passengers[_address][key].insuranceCredit = amount;

    }
    

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay
                            ( address _address,address airline,string flight, uint256 timestamp 
                            )
                            external
                            
    {
        bytes32 key = getFlightKey(airline,flight,timestamp);
        uint256 amount;
        passengers[_address][key].insuranceCredit = amount;
        amount = amount * 3/2;
        passengers[_address][key].balance = amount;
    }



    function fundAirline () external payable
    {
        require(airlines[msg.sender].isRegistered == true, "must be registered");
        require(airlines[msg.sender].isFunded == false, "already funded");
       
        airlines[msg.sender].balance += msg.value;
        if (airlines[msg.sender].balance <= 10){
            airlines[msg.sender].isFunded = true;
        }
    }






    function withdraw (address _address,address airline,string flight,uint256 timestamp) external payable
    {
        bytes32 key = getFlightKey(airline,flight,timestamp);
        uint256 amount;
        passengers[_address][key].balance = amount;
        passengers[_address][key].balance = 0;
        _address.transfer(amount);
        
    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */   
    function fund
                            (   
                            )
                            public
                            payable
    {
    }

    function getFlightKey
                        (
                            address airline,
                            string memory flight,
                            uint256 timestamp
                        )
                        pure
                        internal
                        returns(bytes32) 
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function() 
                            external 
                            payable 
    {
        fund();
    }


}

