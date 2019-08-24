
var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');

contract('Flight Surety Tests', async (accounts) => {

  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);
    await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);
  });

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

  it(`(multiparty) has correct initial isOperational() value`, async function () {

    // Get operating status
    let status = await config.flightSuretyData.isOperational.call();
    assert.equal(status, true, "Incorrect initial operating status value");

  });

  it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

      // Ensure that access is denied for non-Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, true, "Access not restricted to Contract Owner");
            
  });

  it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {

      // Ensure that access is allowed for Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyData.setOperatingStatus(false);
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, false, "Access not restricted to Contract Owner");
      
  });

  it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {

      await config.flightSuretyData.setOperatingStatus(false);

      let reverted = false;
      try 
      {
          await config.flightSurety.setTestingMode(true);
      }
      catch(e) {
          reverted = true;
      }
      assert.equal(reverted, true, "Access not blocked for requireIsOperational");      

      // Set it back for other tests to work
      await config.flightSuretyData.setOperatingStatus(true);

  });

  it('(airline) cannot register an Airline using registerAirline() if it is not funded', async () => {
    
    // ARRANGE
    let newAirline = accounts[2];
    let name = "new airline";

    // ACT
    try {
        await config.flightSuretyApp.registerAirline(newAirline, name, {from: config.firstAirline, gas: 6666666,
            gasPrice: 20000000000});
    }
    catch(e) {
    console.log(e)
    }
    let result = await config.flightSuretyData.isAirline.call(newAirline); 



    // ASSERT
    assert.equal(result, true, "Airline should not be able to register another airline if it hasn't provided funding");
   
    


  });

  // it('(airline) cannot register an Airline using registerAirline() if there is more than 4 without voting', async () => {


  //   let newAirline = accounts[3];
  //   let newAirline2 = accounts[4];
  //   let newAirline3 = accounts[5];
  //   let newAirline4 = accounts[6];
  //   let newAirline5 = accounts[7];
  //   let name1 = "less than 4"
  //   let name2 ="==4"
  //   let name3 ="needs voting"
  //   let name4 ="123"
  //   let name5 ="23g"

  //     try {
  //       await config.flightSuretyData.registerAirline(newAirline, name1, {from: config.firstAirline});
  //       await config.flightSuretyData.registerAirline(newAirline2, name2, {from: config.firstAirline});
  //       await config.flightSuretyData.registerAirline(newAirline3, name3, {from: config.firstAirline});
  //       await config.flightSuretyData.registerAirline(newAirline4, name4, {from: config.firstAirline});
  //       await config.flightSuretyData.registerAirline(newAirline5, name5, {from: config.firstAirline});
        
  //   }
  //   catch(e) {

  //   }
  //   let result1 = await config.flightSuretyData.isAirline.call(newAirline);
  //   let result2 = await config.flightSuretyData.isAirline.call(newAirline2);
  //   let result3 = await config.flightSuretyData.isAirline.call(newAirline3);
  //   let result4 = await config.flightSuretyData.isAirline.call(newAirline4);
  //   let result5 = await config.flightSuretyData.isAirline.call(newAirline5);
  //   assert.equal(result1, true, "less than 4 airlines");
  //   assert.equal(result2, true, "less than 4 airlines");
  //   assert.equal(result3, true, "less than 4 airlines");
  //   assert.equal(result4, false, "more then four airlies");
  //   assert.equal(result5, false, "Airline should not be able to register unless there is more than 50% voting");
  // });

  // it('(airline)can fund it self ', async () => {
  //   let newAirline  = accounts[2];
  //   let newAirline2 = accounts[3];
  //   let newAirline3 = accounts[4];
    

  //     try{
  //       await config.flightSuretyData.fundAirline({from: newAirline,value:10});
  //       await config.flightSuretyData.fundAirline({from: newAirline2,value:10});
  //       await config.flightSuretyData.fundAirline({from: newAirline3,value:10});
        
  //     }
  //     catch(e){
  //       console.log(e)
  //     }
      
  //      let result1 = await config.flightSuretyData.isFunded.call(newAirline);
  //      let result2 = await config.flightSuretyData.isFunded.call(newAirline2);
  //      let result3 = await config.flightSuretyData.isFunded.call(newAirline3);
      
      

  //     assert.equal(result1, true, "the airline1 isn't funded"); 
  //     assert.equal(result2, true, "the airline2 isn't funded"); 
  //     assert.equal(result3, true, "the airline3 isn't funded"); 


  //     });

  //     it('(airline) can vote to pending airline', async () => {
  //       let newAirline = accounts[3];
  //       let newAirline2 = accounts[4];
  //       let newAirline3 = accounts[5];
  //       let newAirline4 = accounts[6];
  //       try{
  //           await config.flightSuretyData.voteToAirline(newAirline4,{from: config.firstAirline});
  //           await config.flightSuretyData.voteToAirline(newAirline4,{from: newAirline});
  //           await config.flightSuretyData.voteToAirline(newAirline4,{from: newAirline2});
  //           await config.flightSuretyData.voteToAirline(newAirline4,{from: newAirline3});
                
  //     }
  //     catch(e){

  //     }

  //      let result = await config.flightSuretyData.isAirline.call(newAirline4);
       
  //      assert.equal(result, true, "not enough votes");


  //     });


 

});
