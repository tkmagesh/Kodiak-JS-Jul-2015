function add(x,y){
    console.log("[SP] - processing ", x , " and ", y);
    var result = x + y;
    console.log("[SP] - returning result");
    return result;
}

function addClient(x,y){
    console.log("[SC] - triggering add operation for ", x , " and ", y);
    var result = add(x,y);
    console.log("[SC] - result = ", result);
}

/*Async - Using Callbacks*/

function addAsync(x,y, onResult){
    console.log("[SP] - processing ", x , " and ", y);
    setTimeout(function(){
        var result = x + y;
        console.log("[SP] - returning result");
        if (typeof onResult === "function")
            onResult(result);
    },3000);
}

function addAsyncClient(x,y){
    console.log("[SC] - triggering add operation for ", x , " and ", y);
    addAsync(x,y, function(result){
        console.log("[SC] - result = ", result);
    });
}

/*Handling Exceptions*/

//2 parameters are mandatory

function add(x,y){
    if (!(x && y))
        throw new Error("Invalid number of parameters");
    console.log("[SP] - processing ", x , " and ", y);
    var result = x + y;
    console.log("[SP] - returning result");
    return result;
}

function addClient(x,y){
    try {
        console.log("[SC] - triggering add operation for ", x , " and ", y);
        var result = add(x,y);
        console.log("[SC] - result = ", result);
    } catch (e){
        console.dir(e.message);
    }
}

//Wrong implementation
function addAsync(x,y, onResult){
    console.log("[SP] - processing ", x , " and ", y);
    setTimeout(function(){
        if (!(x && y))
            throw new Error("Invalid number of parameters");
        var result = x + y;
        console.log("[SP] - returning result");
        if (typeof onResult === "function")
            onResult(result);
    },3000);
}

function addAsyncClient(x,y){
    try {
        console.log("[SC] - triggering add operation for ", x , " and ", y);
        addAsync(x,y, function(result){
            console.log("[SC] - result = ", result);
        });
    } catch (e) {
        console.log(e.message);
    }
    console.log("Out of try catch block");
}

//Right implementation
function addAsync(x,y, onResult){
    console.log("[SP] - processing ", x , " and ", y);
    setTimeout(function(){
        if (!(x && y)){
            var err = new Error("Invalid number of parameters");
            onResult(err, null);
            return;
        }
        var result = x + y;
        console.log("[SP] - returning result");
        if (typeof onResult === "function")
            onResult(null, result);
    },3000);
}

function addAsyncClient(x,y){
    console.log("[SC] - triggering add operation for ", x , " and ", y);
    addAsync(x,y, function(err, result){
        if (err){
            console.log(err.message);
            return;
        }
        console.log("[SC] - result = ", result);
    });

}

/* Events */
function getAdder(){
    var callbacks = [];
    function triggerCallbacks(err, result){
        /*callbacks.forEach(function(callback){
            setTimeout(function(){
                callback(err, result);
            })
            
        });*/
        
        for(var i=0; i<callbacks.length;i++){
            setTimeout((function(index){
                return function(){
                    callbacks[index](err, result);
                };
            })(i))
        }
    }
    
    return {
        addResultCallback : function(callback){
            callbacks.push(callback);
        },
        add : function(x,y){
            console.log("[SP] - processing ", x , " and ", y);
            setTimeout(function(){
                if (!(x && y)){
                    var err = new Error("Invalid number of parameters");
                    triggerCallbacks(err, null);
                    return;
                }
                var result = x + y;
                console.log("[SP] - returning result");
                triggerCallbacks(null, result);
            },3000);
        }
    }
}

var adder = getAdder()

adder.addResultCallback(function(err, result){
  console.log("Client - 1, Result = ", result); 
});

adder.addResultCallback(function(err, result){
  console.log("Client - 2");
  throw new Error("A very intentional disruptive error!");
});

adder.addResultCallback(function(err, result){
  console.log("Client - 3, Result = ", result); 
});

adder.add(100,200)

/* Promise */

function addPromise(x,y){
   var p = new Promise(function(resolve, reject){
       console.log("[SP] Processing ", x , " ", y);
       setTimeout(function(){
          console.log("[SP] returning result");
          if (!(x && y)){
              reject(new Error("Invalid arguments"));
              return;
          }
          var result = x + y;
          resolve(result);
       }, 3000);
   });
   return p;
}