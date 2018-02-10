function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

class RandomGenerator {
    constructor(length, options) {
        this._length = length;
        if (!'numbers' in options ||
            !'lower_alphabets' in options ||
            !'upper_alphabets' in options ||
            !'symbols' in options) {
            console.error(`lack of params: ${options}`);
            return;
        }
        let candidates = '';
        if (options['numbers'])
            candidates += '0123456789';
        if (options['lower_alphabets'])
            candidates += 'abcdefghijklmnopqrstuvwxyz';
        if (options['upper_alphabets'])
            candidates += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (options['symbols'])
            candidates += '!@#$%,./?{}'
        this._candidates = candidates;
    }

    generate() {
        if (this._candidates.length === 0) {
            console.error('No type has been specified')
            return '';
        }
        let out = '';
        for (let i = 0; i < this._length; i++) {
            let index = getRandomInt(0, this._candidates.length - 1);
            out += this._candidates[index];
        }
        return out;
    }
}

document.getElementById('btn-generate').addEventListener('click', () => {
    let params = document.getElementById('form-params');
    let length = parseInt(params.length.value, 10);
    let numbers = params.numbers.checked;
    let lower_alphabets = params.lower_alphabets.checked;
    let upper_alphabets = params.upper_alphabets.checked;
    let symbols = params.symbols.checked;
    let generator = new RandomGenerator(length, {
        numbers: numbers,
        lower_alphabets: lower_alphabets,
        upper_alphabets: upper_alphabets,
        symbols: symbols
    });


    let out_div = document.createElement('div');
    out_div.classList.add('password');
    out_div.innerText = generator.generate();

    let passwords = document.querySelector('.passwords');
    passwords.appendChild(out_div);
});

if ('serviceWorker' in navigator &&
    !navigator.serviceWorker.controller) {
    navigator.serviceWorker.register('sw.js');
}
