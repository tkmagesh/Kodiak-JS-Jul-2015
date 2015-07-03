

function findPrimes(start, end){
    var primeCount = 0;
    var reportDelta = (end - start)/100; //100
    
    for(var i=start; i<= end; i++){
        if (isPrime(i)) 
            ++primeCount;
        if (((i - start) % reportDelta) === 0){
            var percentCompleted = ((i-start)/reportDelta);
            self.postMessage({
                type : 'progress',
                percentCompleted : percentCompleted
            });
        }
    }
    return primeCount;
}

function isPrime(n){
    if (n <= 3) return true;
    for(var i=2; i <= (n/2); i++)
        if (n % i === 0) return false;
    return true;
}

self.addEventListener("message", function(evtArg){
    
    var data = evtArg.data;
    var result = findPrimes(data.start, data.end);
    self.postMessage({
        type : 'complete',
        primeCount : result
    });
});