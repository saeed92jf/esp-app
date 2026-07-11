// src/modules/claude-flow/utils/operators.ts
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// operatorNode's operations have real, different arities â€” sqrt only makes
// sense with one input, divide/subtract/power need exactly two IN A SPECIFIC
// ORDER (aÃ·b, not bÃ·a). This is the single source of truth for that, shared
// by the component (which handles to render) and the store (how to combine
// the values arriving on those handles).
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

import type { ArithmeticOperation, OperatorArity } from '../types';

export const OPERATOR_ARITY: Record<ArithmeticOperation, OperatorArity> = {
  add: 'nary',
  multiply: 'nary',
  average: 'nary',
  subtract: 'binary',
  divide: 'binary',
  power: 'binary',
  sqrt: 'unary',
  square: 'unary',
  abs: 'unary',
  negate: 'unary',
};

export const OPERATOR_SYMBOL: Record<ArithmeticOperation, string> = {
  add: '+',
  multiply: 'Ã—',
  average: 'avg',
  subtract: 'a âˆ’ b',
  divide: 'a Ã· b',
  power: 'a ^ b',
  sqrt: 'âˆšx',
  square: 'xÂ²',
  abs: '|x|',
  negate: 'âˆ’x',
};

export const OPERATOR_LABEL: Record<ArithmeticOperation, string> = {
  add: 'Add (sum all inputs)',
  multiply: 'Multiply (product of all inputs)',
  average: 'Average',
  subtract: 'Subtract (a âˆ’ b)',
  divide: 'Divide (a Ã· b)',
  power: 'Power (a ^ b)',
  sqrt: 'Square root (âˆšx)',
  square: 'Square (xÂ²)',
  abs: 'Absolute value (|x|)',
  negate: 'Negate (âˆ’x)',
};

/** Given the resolved input value(s), computes an operator's result â€” used
 *  identically by the store (numeric recompute) so behavior never drifts
 *  from what the node visually implies. */
export function evaluateOperator(op: ArithmeticOperation, values: number[]): number | undefined {
  const arity = OPERATOR_ARITY[op];

  if (arity === 'unary') {
    const x = values[0];
    if (typeof x !== 'number') return undefined;
    if (op === 'sqrt') return x < 0 ? undefined : Math.sqrt(x);
    if (op === 'square') return x * x;
    if (op === 'abs') return Math.abs(x);
    if (op === 'negate') return -x;
    return undefined;
  }

  if (arity === 'binary') {
    const [a, b] = values;
    if (typeof a !== 'number' || typeof b !== 'number') return undefined;
    if (op === 'subtract') return a - b;
    if (op === 'divide') return b === 0 ? undefined : a / b;
    if (op === 'power') return a ** b;
    return undefined;
  }

  // nary
  if (values.length === 0) return undefined;
  if (op === 'add') return values.reduce((a, b) => a + b, 0);
  if (op === 'multiply') return values.reduce((a, b) => a * b, 1);
  if (op === 'average') return values.reduce((a, b) => a + b, 0) / values.length;
  return undefined;
}


