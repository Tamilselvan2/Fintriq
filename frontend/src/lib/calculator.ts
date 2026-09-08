export function evaluateExpression(expression: string): number | null {
  try {
    const sanitized = expression.replace(/\s+/g, '');
    if (!sanitized) return null;
    if (/[^0-9+\-*/.]/.test(sanitized)) return null;

    // Simple tokenizer
    const tokens: string[] = [];
    let currentNumber = '';
    
    for (let i = 0; i < sanitized.length; i++) {
      const char = sanitized[i];
      if ('+-*/'.includes(char)) {
        if (currentNumber) {
          tokens.push(currentNumber);
          currentNumber = '';
        }
        tokens.push(char);
      } else {
        currentNumber += char;
      }
    }
    if (currentNumber) tokens.push(currentNumber);

    // Filter out incomplete expressions
    if (tokens.length === 0 || '+-*/'.includes(tokens[tokens.length - 1])) {
      return null;
    }
    
    // Evaluate * and /
    let tempTokens: string[] = [];
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i] === '*' || tokens[i] === '/') {
        const op = tokens[i];
        const prev = Number(tempTokens.pop());
        const next = Number(tokens[++i]);
        if (isNaN(prev) || isNaN(next)) return null;
        if (op === '/' && next === 0) return null;
        
        const result = op === '*' ? prev * next : prev / next;
        tempTokens.push(result.toString());
      } else {
        tempTokens.push(tokens[i]);
      }
    }
    
    // Evaluate + and -
    let finalResult = Number(tempTokens[0]);
    if (isNaN(finalResult)) return null;

    for (let i = 1; i < tempTokens.length; i += 2) {
      const op = tempTokens[i];
      const next = Number(tempTokens[i + 1]);
      if (isNaN(next)) return null;
      if (op === '+') {
        finalResult += next;
      } else if (op === '-') {
        finalResult -= next;
      }
    }
    
    // Round to 2 decimal places and prevent NaN/Infinity
    if (!isFinite(finalResult)) return null;
    
    return Math.round(finalResult * 100) / 100;
  } catch (e) {
    return null;
  }
}
