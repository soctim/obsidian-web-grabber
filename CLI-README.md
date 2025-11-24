# Parser Testing CLI Tool

A comprehensive command-line tool for testing web scrapers and parsers in the Obsidian Web Scraper plugin.

## Features

- 🧪 **Test Individual Parsers**: Test specific parsers with URLs or local HTML files
- 🌐 **Real URL Testing**: Fetch and parse real web pages
- 📄 **Local File Testing**: Test parsers with local HTML files
- 🔍 **Parser Validation**: Validate parser structure and configuration
- 📊 **Multiple Output Formats**: Table, JSON, and verbose output formats
- 🚀 **Batch Testing**: Test all parsers against a single URL
- ⏱️ **Performance Metrics**: Parse time and field extraction statistics
- 🔗 **URL Pattern Matching**: Verify URL patterns work correctly

## Installation

The CLI tool is included with the project. Make sure you have Node.js installed and run:

```bash
npm install
```

## Usage

### Basic Commands

```bash
# List all available parsers
node cli-test-parsers.js list

# Test a specific parser with a URL
node cli-test-parsers.js test-url <parser-id> <url>

# Test a specific parser with a local HTML file
node cli-test-parsers.js test-file <parser-id> <file-path>

# Test all parsers with a URL
node cli-test-parsers.js test-all <url>

# Validate a parser's structure
node cli-test-parsers.js validate <parser-id>

# Show help
node cli-test-parsers.js help
```

### Using npm script

You can also use the npm script:

```bash
npm run test-parsers <command> [options]
```

## Examples

### Test GitHub Parser with Real URL

```bash
node cli-test-parsers.js test-url github "https://github.com/microsoft/vscode"
```

### Test Fanfics.me Parser with Local File

```bash
node cli-test-parsers.js test-file fanficsme test-sample.html --format verbose
```

### Test All Parsers with Reddit URL

```bash
node cli-test-parsers.js test-all "https://reddit.com/r/programming" --format table
```

### Validate Parser Structure

```bash
node cli-test-parsers.js validate fanficsme
```

## Output Formats

### Table Format (Default)
```
Parser            | URL/File                            | Status    | Fields | Time (ms)
----------------- | ----------------------------------- | --------- | ------ | ---------
GitHub Repository | https://github.com/microsoft/vscode | ✅ Success | 14     | 231
```

### JSON Format
```bash
node cli-test-parsers.js test-url github "https://github.com/microsoft/vscode" --format json
```

### Verbose Format
```bash
node cli-test-parsers.js test-file fanficsme test-sample.html --format verbose
```

## Options

- `--format <format>`: Output format (`table`, `json`, `verbose`)
- `--output <file>`: Save results to file
- `--timeout <ms>`: Request timeout in milliseconds (default: 10000)

## Available Parsers

The tool automatically loads all parsers from the `parsers/` directory:

- **archiveofourown**: Archive of Our Own fanfiction parser
- **github**: GitHub repository parser
- **fanficsme**: Fanfics.me parser
- **generic**: Generic web page parser
- **reddit**: Reddit post parser

## Parser Structure

Each parser must export an object with the following structure:

```javascript
export const parser = {
    id: 'unique-id',
    name: 'Human Readable Name',
    urlPattern: /regex-pattern/,
    parse: (doc) => {
        // Parsing logic here
        return extractedData;
    }
};
```

## Testing with Sample Data

The project includes a sample HTML file (`test-sample.html`) for testing parsers locally:

```bash
node cli-test-parsers.js test-file fanficsme test-sample.html --format verbose
```

## Error Handling

The CLI tool provides comprehensive error handling:

- **Parser Loading Errors**: Shows which parsers failed to load and why
- **Network Errors**: Handles HTTP errors and timeouts
- **Parse Errors**: Catches and reports parsing failures
- **Validation Errors**: Shows detailed validation results

## Performance Metrics

The tool tracks and reports:

- **Parse Time**: How long each parser takes to extract data
- **Field Count**: Number of fields successfully extracted
- **URL Pattern Matching**: Whether the URL matches the parser's pattern
- **Success Rate**: Overall success/failure statistics

## Integration with Obsidian Plugin

This CLI tool is designed to work with the Obsidian Web Scraper plugin. It uses the same parser structure and can be used to:

- Test parsers before deploying to Obsidian
- Debug parser issues
- Validate parser configurations
- Benchmark parser performance

## Troubleshooting

### Common Issues

1. **"Parser not found"**: Make sure the parser ID is correct and the parser file exists
2. **"Module loading error"**: Check that the parser file has valid JavaScript syntax
3. **"Network timeout"**: Increase the timeout value with `--timeout`
4. **"Window is not defined"**: This is handled automatically by the CLI tool

### Debug Mode

For detailed debugging, use the verbose format:

```bash
node cli-test-parsers.js test-url <parser-id> <url> --format verbose
```

## Contributing

To add new parsers:

1. Create a new `.js` file in the `parsers/` directory
2. Follow the parser structure outlined above
3. Test with the CLI tool before using in Obsidian

## License

This tool is part of the Obsidian Web Scraper plugin and follows the same MIT license.