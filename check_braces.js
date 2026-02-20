const fs = require('fs');
const path = require('path');

const filePath = 'D:/Prototype (3)/Prototype/src/components/OccasionMenuPage.jsx';
const content = fs.readFileSync(filePath, 'utf8');

let braceCount = 0;
let parenCount = 0;
let bracketCount = 0;
const lines = content.split('\n');

console.log('Line | Braces | Parens | Brackets | Content Preview');
console.log('-'.repeat(80));

lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // Count opening/closing
    const openBraces = (line.match(/{/g) || []).length;
    const closeBraces = (line.match(/}/g) || []).length;
    const openParens = (line.match(/\(/g) || []).length;
    const closeParens = (line.match(/\)/g) || []).length;
    const openBrackets = (line.match(/\[/g) || []).length;
    const closeBrackets = (line.match(/\]/g) || []).length;
    
    braceCount += openBraces - closeBraces;
    parenCount += openParens - closeParens;
    bracketCount += openBrackets - closeBrackets;
    
    // Show lines with significant brace changes
    if (Math.abs(openBraces - closeBraces) > 0 || lineNum <= 10 || lineNum >= lines.length - 10) {
        console.log(`${lineNum.toString().padStart(4)} | ${braceCount.toString().padStart(6)} | ${parenCount.toString().padStart(6)} | ${bracketCount.toString().padStart(8)} | ${line.trim().substring(0, 50)}`);
    }
});

console.log('\n' + '='.repeat(80));
console.log(`Final counts - Braces: ${braceCount}, Parens: ${parenCount}, Brackets: ${bracketCount}`);
console.log('='.repeat(80));

if (braceCount !== 0) console.log(`❌ UNMATCHED BRACES: ${braceCount}`);
if (parenCount !== 0) console.log(`❌ UNMATCHED PARENS: ${parenCount}`);
if (bracketCount !== 0) console.log(`❌ UNMATCHED BRACKETS: ${bracketCount}`);
