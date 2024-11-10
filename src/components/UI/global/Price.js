export function Price(value) {
    let answer = String(Math.round(value * 100) / 100).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ');
    if (answer[answer.length - 2] === '.') answer = answer + '0';
    if (answer.includes('.')) answer = answer.replace('.',',');
    return answer;
}