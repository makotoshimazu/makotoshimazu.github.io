export function generatePrimes(max) {
    const sieve = new Array(max + 1).fill(true);
    sieve[0] = sieve[1] = false;
    
    for (let i = 2; i * i <= max; i++) {
        if (sieve[i]) {
            for (let j = i * i; j <= max; j += i) {
                sieve[j] = false;
            }
        }
    }
    
    const primes = [];
    for (let i = 2; i <= max; i++) {
        if (sieve[i]) primes.push(i);
    }
    return primes;
}

export function generateComposite(min, max, primes) {
    let num;
    do {
        num = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (isPrime(num) || num === 1);
    
    const factors = [];
    let temp = num;
    for (const prime of primes) {
        while (temp % prime === 0) {
            factors.push(prime);
            temp /= prime;
        }
        if (temp === 1) break;
    }
    
    return { value: num, factors };
}

export function isPrime(n) {
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 === 0 || n % 3 === 0) return false;
    
    for (let i = 5; i * i <= n; i += 6) {
        if (n % i === 0 || n % (i + 2) === 0) return false;
    }
    return true;
}

export function lerp(start, end, t) {
    return start + (end - start) * t;
}

export function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}