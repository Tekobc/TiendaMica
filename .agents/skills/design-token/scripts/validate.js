#!/usr/bin/env node
/**
 * W3C DTCG Design Tokens Validator
 * Validates JSON files against DTCG specification rules.
 */

const fs = require('fs');
const path = require('path');

const VALID_TYPES = new Set([
  'color',
  'dimension',
  'fontFamily',
  'fontWeight',
  'duration',
  'cubicBezier',
  'number',
  'shadow',
  'border',
  'transition',
  'strokeStyle',
  'gradient',
  'typography',
]);

function validateTokens(filePath) {
  if (!filePath) {
    console.error('Usage: node validate.js <path-to-tokens.json>');
    process.exit(1);
  }

  const resolvedPath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`Error: File not found at ${resolvedPath}`);
    process.exit(1);
  }

  let content;
  try {
    content = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
  } catch (err) {
    console.error(`JSON Parse Error in ${filePath}:`, err.message);
    process.exit(1);
  }

  const errors = [];
  const warnings = [];
  const tokenMap = new Map();

  function collectNodes(node, currentPath = []) {
    if (typeof node !== 'object' || node === null) return;

    if (node.hasOwnProperty('$value')) {
      const tokenName = currentPath.join('.');
      tokenMap.set(tokenName, node);
      return;
    }

    for (const [key, value] of Object.entries(node)) {
      if (key.startsWith('$')) continue;
      collectNodes(value, [...currentPath, key]);
    }
  }

  collectNodes(content);

  function validateNode(node, currentPath = [], inheritedType = null) {
    if (typeof node !== 'object' || node === null) return;

    const currentType = node.$type || inheritedType;

    if (node.hasOwnProperty('$value')) {
      const tokenPath = currentPath.join('.');
      const val = node.$value;

      if (!currentType) {
        errors.push(`${tokenPath}: Missing $type (neither declared nor inherited)`);
      } else if (!VALID_TYPES.has(currentType)) {
        errors.push(`${tokenPath}: Invalid $type "${currentType}". Must be one of: ${Array.from(VALID_TYPES).join(', ')}`);
      }

      // Check aliases {path.to.token}
      if (typeof val === 'string' && val.startsWith('{') && val.endsWith('}')) {
        const refPath = val.slice(1, -1);
        if (!tokenMap.has(refPath)) {
          warnings.push(`${tokenPath}: Broken alias reference "${val}". Target "${refPath}" not found.`);
        }
      }

      // Dimension unit check
      if (currentType === 'dimension' && typeof val === 'string' && !val.startsWith('{')) {
        if (!/^-?\d+(\.\d+)?(px|rem|em|%|pt|vh|vw|ms|s)$/.test(val)) {
          errors.push(`${tokenPath}: Invalid dimension format "${val}". Must include unit (e.g. px, rem, em).`);
        }
      }

      return;
    }

    for (const [key, value] of Object.entries(node)) {
      if (key.startsWith('$')) continue;
      validateNode(value, [...currentPath, key], currentType);
    }
  }

  validateNode(content);

  console.log(`\nValidating: ${filePath}`);
  console.log(`Found ${tokenMap.size} design tokens.\n`);

  if (warnings.length > 0) {
    console.warn('⚠️  Warnings:');
    warnings.forEach((w) => console.warn(`  - ${w}`));
  }

  if (errors.length > 0) {
    console.error('❌ Validation Errors:');
    errors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }

  console.log('✅ Validation Passed: All tokens conform to DTCG specification.\n');
}

const target = process.argv[2];
validateTokens(target);
