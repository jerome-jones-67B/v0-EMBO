#!/usr/bin/env node

/**
 * Test runner script for source file mapping functionality
 * Run with: node __tests__/run-source-mapping-tests.js
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 Running Source File Mapping Tests...\n');

const testFiles = [
  '__tests__/components/source-files-treeview.test.tsx',
  '__tests__/lib/api-client-delete.test.ts',
  '__tests__/hooks/useManuscriptState.test.ts'
];

let passed = 0;
let failed = 0;

testFiles.forEach((testFile, index) => {
  console.log(`📋 Running ${testFile}...`);

  try {
    execSync(`npx jest ${testFile} --verbose`, {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    console.log(`✅ ${testFile} - PASSED\n`);
    passed++;
  } catch (error) {
    console.log(`❌ ${testFile} - FAILED\n`);
    failed++;
  }
});

console.log('📊 Test Summary:');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📈 Total: ${passed + failed}`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('\n🎉 All tests passed!');
}
