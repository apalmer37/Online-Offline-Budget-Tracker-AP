let db,
tx,
store;

// open new db request for "budgetDB" database
const request = indexedDB.open("budgetDB", 1)

request.onupgradeneeded = function(e) {
    const db = e.target.result;
    //create object store 
    db.createObjectStore(["incTx"], { autoIncrement: true });
}
    request.onsuccess = function(e) {
      db = e.target.result;
      // make sure app is online before checking db
      if (navigator.onLine){
          console.log('app online');
          checkDatabase();
        }
    };
    request.onerror = function(e) {
        console.log("There was an error");
    };

    function checkDatabase() {
        tx = db.transaction(["incTx"], "readwrite");
        // object store access
        store = tx.objectStore(["incTx"]);
        // all records set to variable all
        all = store.getAll();

        all.onsuccess = function (){
            if(all.result.length > 0){
                fetch("/api/transaction/bulk",{
                    method: "POST",
                    body: JSON.stringify(all.result),
                    headers:{
                        Accept: "application/json, text/plain, */*",
                        "Content-Type": "application/json"
                    }
                })
                .then(response => response.json())
                .then(() =>{
                    tx = db.transaction(["incTx"], "readwrite");
                    store = tx.objectStore(["incTx"]);
                    store.clear();
                })
            }
        }
    }
    
    function saveRecord(record){
        // create create incomming transaction incTx db
        tx = db.transaction(["incTx"], "readwrite");
        // object store access
        store = tx.objectStore(["incTx"]);
        // add record
        store.add(record);
    }



window.addEventListener("online", checkDatabase);
