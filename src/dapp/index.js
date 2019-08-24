
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';

let boughtFlights= [];
(async() => {

    let result = null;

    let contract = new Contract('localhost', () => {

        // Read transaction
        contract.isOperational((error, result) => {
            console.log(error,result);
            display('Operational Status', 'Check if contract is operational', [ { label: 'Operational Status', error: error, value: result} ]);
        });
    

        // User-submitted transaction
        DOM.elid('submit-oracle').addEventListener('click', () => {
            let flight = DOM.elid('bought-flight').name;

            for(let i = 0 ; i< boughtFlights.length;i++){
                if(flight == boughtFlights[i].name){
                   let value = boughtFlights[i];
                    return value;
                }
            }
            // Write transaction
            contract.fetchFlightStatus(value, (error, result) => {
                display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result.flight + ' ' + result.timestamp} ]);
            });
        })
        
        // buy insurance    
        DOM.elid('buy-insurance').addEventListener('click', () => {
            let flight = contract.flights[DOM.elid('index').value];
            alert(flight.name);
            contract.buy(flight, (error, result) => {
                display('Buy insurance','', [{label: 'Operation',error,value:'successful'}]);
                if(error){alert(error)};
                if (!error) {
                    boughtFlights.push(result);
                    let option = document.createElement('option');
                    option.innerHTML = result.name;
                    DOM.elid('bought-flight').appendChild(option);
                }
            });
        });

    });

    

})();


function display(title, description, results) {
    let displayDiv = DOM.elid("display-wrapper");
    let section = DOM.section();
    section.appendChild(DOM.h2(title));
    section.appendChild(DOM.h5(description));
    results.map((result) => {
        let row = section.appendChild(DOM.div({className:'row'}));
        row.appendChild(DOM.div({className: 'col-sm-4 field'}, result.label));
        row.appendChild(DOM.div({className: 'col-sm-8 field-value'}, result.error ? String(result.error) : String(result.value)));
        section.appendChild(row);
    })
    displayDiv.append(section);

}







