#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { URL } = require('url');

class ParserTester {
    constructor() {
        this.parsers = new Map();
        this.results = [];
    }

    // Load all parsers from the parsers directory
    async loadParsers() {
        const parsersDir = path.join(__dirname, 'parsers');
        
        if (!fs.existsSync(parsersDir)) {
            console.error('❌ Parsers directory not found:', parsersDir);
            process.exit(1);
        }

        const files = fs.readdirSync(parsersDir).filter(file => file.endsWith('.js'));
        
        console.log(`📁 Found ${files.length} parser files in ${parsersDir}`);
        
        for (const file of files) {
            try {
                const filePath = path.join(parsersDir, file);
                const content = fs.readFileSync(filePath, 'utf8');
                
                // Convert ES6 module to CommonJS for Node.js compatibility
                const commonjsContent = content
                    .replace(/export\s+const\s+parser\s*=\s*/, 'const parser = ')
                    .replace(/export\s*{\s*parser\s*}/, 'module.exports = { parser }');
                
                // Create a module from the content using eval
                const module = { exports: {} };
                const parserModule = eval(`(function() { ${commonjsContent}; return { parser }; })()`);
                
                if (parserModule && parserModule.parser) {
                    this.parsers.set(parserModule.parser.id, parserModule.parser);
                    console.log(`✅ Loaded parser: ${parserModule.parser.name} (${parserModule.parser.id})`);
                } else {
                    console.warn(`⚠️  Could not load parser from ${file}`);
                }
            } catch (error) {
                console.error(`❌ Error loading parser from ${file}:`, error.message);
            }
        }
        
        console.log(`\n📊 Total parsers loaded: ${this.parsers.size}`);
    }

    // Test a parser with a URL
    async testParserWithUrl(parserId, url) {
        const parser = this.parsers.get(parserId);
        if (!parser) {
            throw new Error(`Parser not found: ${parserId}`);
        }

        console.log(`\n🌐 Testing ${parser.name} with URL: ${url}`);
        
        try {
            // Fetch the URL
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const html = await response.text();
            const dom = new JSDOM(html);
            const doc = dom.window.document;
            
            // Mock window object for parsers that might use it
            global.window = dom.window;
            global.location = dom.window.location;
            
            // Test URL pattern matching
            const urlMatches = parser.urlPattern.test(url);
            console.log(`🔍 URL pattern match: ${urlMatches ? '✅' : '❌'}`);
            
            if (!urlMatches) {
                console.log(`⚠️  URL doesn't match pattern: ${parser.urlPattern}`);
            }
            
            // Parse the document
            const startTime = Date.now();
            const result = parser.parse(doc);
            const parseTime = Date.now() - startTime;
            
            console.log(`⏱️  Parse time: ${parseTime}ms`);
            console.log(`📝 Extracted fields: ${Object.keys(result).length}`);
            
            return {
                parserId,
                parserName: parser.name,
                url,
                success: true,
                parseTime,
                fieldCount: Object.keys(result).length,
                data: result,
                urlPatternMatch: urlMatches
            };
            
        } catch (error) {
            console.error(`❌ Error testing parser: ${error.message}`);
            return {
                parserId,
                parserName: parser.name,
                url,
                success: false,
                error: error.message,
                parseTime: 0,
                fieldCount: 0,
                data: {}
            };
        }
    }

    // Test a parser with local HTML file
    async testParserWithFile(parserId, filePath) {
        const parser = this.parsers.get(parserId);
        if (!parser) {
            throw new Error(`Parser not found: ${parserId}`);
        }

        console.log(`\n📄 Testing ${parser.name} with file: ${filePath}`);
        
        try {
            if (!fs.existsSync(filePath)) {
                throw new Error(`File not found: ${filePath}`);
            }
            
            const html = fs.readFileSync(filePath, 'utf8');
            const dom = new JSDOM(html);
            const doc = dom.window.document;
            
            // Mock window object for parsers that might use it
            global.window = dom.window;
            global.location = dom.window.location;
            
            // Parse the document
            const startTime = Date.now();
            const result = parser.parse(doc);
            const parseTime = Date.now() - startTime;
            
            console.log(`⏱️  Parse time: ${parseTime}ms`);
            console.log(`📝 Extracted fields: ${Object.keys(result).length}`);
            
            return {
                parserId,
                parserName: parser.name,
                file: filePath,
                success: true,
                parseTime,
                fieldCount: Object.keys(result).length,
                data: result
            };
            
        } catch (error) {
            console.error(`❌ Error testing parser: ${error.message}`);
            return {
                parserId,
                parserName: parser.name,
                file: filePath,
                success: false,
                error: error.message,
                parseTime: 0,
                fieldCount: 0,
                data: {}
            };
        }
    }

    // Test all parsers with a URL
    async testAllParsersWithUrl(url) {
        console.log(`\n🧪 Testing all parsers with URL: ${url}`);
        const results = [];
        
        for (const [parserId, parser] of this.parsers) {
            try {
                const result = await this.testParserWithUrl(parserId, url);
                results.push(result);
            } catch (error) {
                results.push({
                    parserId,
                    parserName: parser.name,
                    url,
                    success: false,
                    error: error.message,
                    parseTime: 0,
                    fieldCount: 0,
                    data: {}
                });
            }
        }
        
        return results;
    }

    // Validate parser structure
    validateParser(parserId) {
        const parser = this.parsers.get(parserId);
        if (!parser) {
            return { valid: false, errors: [`Parser not found: ${parserId}`] };
        }

        const errors = [];
        
        // Check required properties
        if (!parser.id) errors.push('Missing id property');
        if (!parser.name) errors.push('Missing name property');
        if (!parser.urlPattern) errors.push('Missing urlPattern property');
        if (!parser.parse || typeof parser.parse !== 'function') {
            errors.push('Missing or invalid parse function');
        }
        
        // Check URL pattern is a RegExp
        if (parser.urlPattern && !(parser.urlPattern instanceof RegExp)) {
            errors.push('urlPattern must be a RegExp');
        }
        
        return {
            valid: errors.length === 0,
            errors,
            parser: {
                id: parser.id,
                name: parser.name,
                urlPattern: parser.urlPattern?.toString(),
                hasParseFunction: typeof parser.parse === 'function'
            }
        };
    }

    // Format results for output
    formatResults(results, format = 'table') {
        switch (format) {
            case 'json':
                return JSON.stringify(results, null, 2);
            
            case 'verbose':
                return this.formatVerboseResults(results);
            
            case 'table':
            default:
                return this.formatTableResults(results);
        }
    }

    formatTableResults(results) {
        if (results.length === 0) return 'No results to display.';
        
        const headers = ['Parser', 'URL/File', 'Status', 'Fields', 'Time (ms)'];
        const rows = results.map(result => [
            result.parserName || result.parserId,
            result.url || result.file || 'N/A',
            result.success ? '✅ Success' : '❌ Failed',
            result.fieldCount || 0,
            result.parseTime || 0
        ]);
        
        // Simple table formatting
        const colWidths = headers.map((_, i) => 
            Math.max(headers[i].length, ...rows.map(row => String(row[i] || '').length))
        );
        
        const separator = colWidths.map(width => '-'.repeat(width)).join(' | ');
        const headerRow = headers.map((header, i) => 
            header.padEnd(colWidths[i])
        ).join(' | ');
        
        const dataRows = rows.map(row => 
            row.map((cell, i) => String(cell || '').padEnd(colWidths[i])
        ).join(' | '));
        
        return [headerRow, separator, ...dataRows].join('\n');
    }

    formatVerboseResults(results) {
        return results.map(result => {
            let output = `\n📊 Parser: ${result.parserName || result.parserId}\n`;
            output += `🔗 URL/File: ${result.url || result.file || 'N/A'}\n`;
            output += `✅ Status: ${result.success ? 'Success' : 'Failed'}\n`;
            output += `📝 Fields: ${result.fieldCount || 0}\n`;
            output += `⏱️  Time: ${result.parseTime || 0}ms\n`;
            
            if (result.error) {
                output += `❌ Error: ${result.error}\n`;
            }
            
            if (result.urlPatternMatch !== undefined) {
                output += `🔍 URL Pattern Match: ${result.urlPatternMatch ? 'Yes' : 'No'}\n`;
            }
            
            if (result.success && result.data && Object.keys(result.data).length > 0) {
                output += `📋 Extracted Data:\n`;
                Object.entries(result.data).forEach(([key, value]) => {
                    const displayValue = typeof value === 'string' && value.length > 100 
                        ? value.substring(0, 100) + '...' 
                        : value;
                    output += `  ${key}: ${displayValue}\n`;
                });
            }
            
            return output;
        }).join('\n');
    }

    // Print help information
    printHelp() {
        console.log(`
🔧 Parser Testing CLI Tool

USAGE:
  node cli-test-parsers.js <command> [options]

COMMANDS:
  test-url <parser-id> <url>           Test a specific parser with a URL
  test-file <parser-id> <file>         Test a specific parser with a local HTML file
  test-all <url>                       Test all parsers with a URL
  validate <parser-id>                 Validate a parser's structure
  list                                 List all available parsers
  help                                 Show this help message

OPTIONS:
  --format <format>                    Output format: table, json, verbose (default: table)
  --output <file>                      Save results to file
  --timeout <ms>                       Request timeout in milliseconds (default: 10000)

EXAMPLES:
  node cli-test-parsers.js test-url github "https://github.com/microsoft/vscode"
  node cli-test-parsers.js test-file reddit "./test-page.html"
  node cli-test-parsers.js test-all "https://reddit.com/r/programming"
  node cli-test-parsers.js validate github
  node cli-test-parsers.js list

OUTPUT FORMATS:
  table    - Human-readable table format (default)
  json     - JSON format for programmatic use
  verbose  - Detailed output with extracted data
        `);
    }
}

// Main CLI execution
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0 || args[0] === 'help' || args[0] === '--help' || args[0] === '-h') {
        const tester = new ParserTester();
        tester.printHelp();
        return;
    }
    
    const command = args[0];
    const tester = new ParserTester();
    
    // Parse options
    const options = {
        format: 'table',
        output: null,
        timeout: 10000
    };
    
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--format' && args[i + 1]) {
            options.format = args[i + 1];
            i++;
        } else if (args[i] === '--output' && args[i + 1]) {
            options.output = args[i + 1];
            i++;
        } else if (args[i] === '--timeout' && args[i + 1]) {
            options.timeout = parseInt(args[i + 1]);
            i++;
        }
    }
    
    try {
        await tester.loadParsers();
        
        let results = [];
        
        switch (command) {
            case 'list':
                console.log('\n📋 Available Parsers:');
                for (const [id, parser] of tester.parsers) {
                    console.log(`  ${id}: ${parser.name}`);
                }
                return;
            
            case 'validate':
                if (args.length < 2) {
                    console.error('❌ Parser ID required for validate command');
                    process.exit(1);
                }
                const validation = tester.validateParser(args[1]);
                console.log(`\n🔍 Validation for parser: ${args[1]}`);
                if (validation.valid) {
                    console.log('✅ Parser is valid');
                } else {
                    console.log('❌ Parser has errors:');
                    validation.errors.forEach(error => console.log(`  - ${error}`));
                }
                console.log('\nParser info:', validation.parser);
                return;
            
            case 'test-url':
                if (args.length < 3) {
                    console.error('❌ Parser ID and URL required for test-url command');
                    process.exit(1);
                }
                results = [await tester.testParserWithUrl(args[1], args[2])];
                break;
            
            case 'test-file':
                if (args.length < 3) {
                    console.error('❌ Parser ID and file path required for test-file command');
                    process.exit(1);
                }
                results = [await tester.testParserWithFile(args[1], args[2])];
                break;
            
            case 'test-all':
                if (args.length < 2) {
                    console.error('❌ URL required for test-all command');
                    process.exit(1);
                }
                results = await tester.testAllParsersWithUrl(args[1]);
                break;
            
            default:
                console.error(`❌ Unknown command: ${command}`);
                console.log('Run "node cli-test-parsers.js help" for usage information');
                process.exit(1);
        }
        
        // Output results
        const output = tester.formatResults(results, options.format);
        console.log(output);
        
        // Save to file if requested
        if (options.output) {
            fs.writeFileSync(options.output, output);
            console.log(`\n💾 Results saved to: ${options.output}`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Run the CLI
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    });
}

module.exports = ParserTester;