

function queueSorting(queue, actorQueue){
    mergeSort(queue, 0, queue.length-1, actorQueue)
    }
		 


function merge(arr, l, m, r, actArr)
{
    var n1 = m - l + 1;
    var n2 = r - m;

    // Create temp arrays
    let L = []; 
    let R = [];
    let L2 = []; 
    let R2 = [];
    // Copy data to temp arrays L[] and R[]
    for (var i = 0; i < n1; i++) {
        L[i] = arr[l + i];
        L2[i] = actArr[l + i];
    }
    for (var j = 0; j < n2; j++) {
        R[j] = arr[m + 1 + j];
        R2[j] = actArr[m + 1 + j];
    }
    // Merge the temp arrays back into arr[l..r]

    
    // Initial index of first subarray
    var i = 0;
    
    // Initial index of second subarray
    var j = 0;
    
    // Initial index of merged subarray
    var k = l;

    while (i < n1 && j < n2) {
        if (L[i].priority <= R[j].priority) {
            arr[k] = L[i];
	    actArr[k] = L2[i];
            i++;
        }
        else {
            arr[k] = R[j];
	    actArr[k] = R2[j];
            j++;
        }
        k++;
    }

    // Copy the remaining elements of
    // L[], if there are any
    while (i < n1) {
        arr[k] = L[i];
    	actArr[k] = L2[i];
        i++;
        k++;
    }

    // Copy the remaining elements of
    // R[], if there are any
    while (j < n2) {
        arr[k] = R[j];
	    actArr[k] = R2[j];
        j++;
        k++;
    }
}

// l is for left index and r is
// right index of the sub-array
// of arr to be sorted
function mergeSort(arr,l, r, actArr){
    if(l>=r){
        return;
    }
    var m =l+ parseInt((r-l)/2);
    mergeSort(arr,l,m, actArr);
    mergeSort(arr,m+1,r, actArr);
    merge(arr,l,m,r, actArr);
}

module.exports = {queueSorting}

