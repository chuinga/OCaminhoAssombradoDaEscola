
const fs = require('fs');
const path = require('path');

try {
  const content = fs.readFileSync('components_lint.json', 'utf16le'); // Try utf16le first
  const results = JSON.parse(content);
  
  results.forEach(result => {
    if (result.errorCount > 0 || result.warningCount > 0) {
      console.log(`File: ${result.filePath}`);
      result.messages.forEach(msg => {
        console.log(`  [${msg.ruleId}] Line ${msg.line}: ${msg.message}`);
      });
    }
  });
} catch (e) {
  console.error("Error parsing JSON:", e);
  // Try reading as utf8 if utf16le fails or if it was actually utf8
  try {
      const content = fs.readFileSync('components_lint.json', 'utf8');
      const results = JSON.parse(content);
      results.forEach(result => {
        if (result.errorCount > 0 || result.warningCount > 0) {
          console.log(`File: ${result.filePath}`);
          result.messages.forEach(msg => {
            console.log(`  [${msg.ruleId}] Line ${msg.line}: ${msg.message}`);
          });
        }
      });
  } catch (e2) {
      console.error("Error parsing JSON as utf8:", e2);
  }
}
