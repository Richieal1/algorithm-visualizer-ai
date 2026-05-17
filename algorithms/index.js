export function binarySteps(arr, target) {
  const steps = [];
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const found = arr[mid] === target;
    steps.push({ lo, hi, mid, found: found ? mid : -1, done: found });
    if (found) break;
    if (arr[mid] < target) lo = mid + 1; else hi = mid - 1;
  }
  if (!steps.length) return [{ lo:0, hi:-1, mid:-1, found:-2, done:true }];
  if (!steps[steps.length-1].done) steps[steps.length-1].done = true;
  return steps;
}

export function bubbleSteps(arr) {
  const steps=[], a=[...arr], n=a.length, sorted=Array(n).fill(false);
  for (let i=0;i<n-1;i++) {
    for (let j=0;j<n-1-i;j++) {
      const [vA,vB]=[a[j],a[j+1]];
      steps.push({arr:[...a],cmp:[j,j+1],swapped:false,sorted:[...sorted],vA,vB});
      if (a[j]>a[j+1]) { [a[j],a[j+1]]=[a[j+1],a[j]]; steps.push({arr:[...a],cmp:[j,j+1],swapped:true,sorted:[...sorted],vA,vB}); }
    }
    sorted[n-1-i]=true;
  }
  sorted[0]=true;
  steps.push({arr:[...a],cmp:[],swapped:false,sorted:[...sorted],done:true});
  return steps;
}

export function selectionSteps(arr) {
  const steps=[], a=[...arr], n=a.length, sorted=Array(n).fill(false);
  for (let i=0;i<n-1;i++) {
    let minI=i;
    for (let j=i+1;j<n;j++) {
      const [vA,vB]=[a[minI],a[j]];
      steps.push({arr:[...a],cmp:[minI,j],swapped:false,sorted:[...sorted],vA,vB,minI});
      if (a[j]<a[minI]) minI=j;
    }
    if (minI!==i) {
      const [vA,vB]=[a[i],a[minI]];
      [a[i],a[minI]]=[a[minI],a[i]];
      steps.push({arr:[...a],cmp:[i,minI],swapped:true,sorted:[...sorted],vA,vB,minI:i});
    }
    sorted[i]=true;
  }
  sorted[n-1]=true;
  steps.push({arr:[...a],cmp:[],swapped:false,sorted:[...sorted],done:true,minI:-1});
  return steps;
}
