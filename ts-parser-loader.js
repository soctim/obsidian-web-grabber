const fs = require('fs');
const path = require('path');
const ts = require('typescript');

class TypeScriptParserLoader {
    constructor() {
        this.tsConfig = {
            target: ts.ScriptTarget.ES2020,
            module: ts.ModuleKind.CommonJS,
            moduleResolution: ts.ModuleResolutionKind.NodeJs,
            allowSyntheticDefaultImports: true,
            esModuleInterop: true,
            skipLibCheck: true,
            strict: false,
            forceConsistentCasingInFileNames: true,
            resolveJsonModule: true,
            declaration: false,
            outDir: undefined,
            noEmit: true
        };
    }

    loadParser(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Compile TypeScript to JavaScript
            const compiled = ts.transpile(content, this.tsConfig);
            
            // Convert ES6 module to CommonJS
            const commonjsContent = compiled
                .replace(/export\s+const\s+parser\s*=\s*/, 'const parser = ')
                .replace(/export\s*{\s*parser\s*}/, 'module.exports = { parser }');
            
            // Create a module from the content using eval
            const module = { exports: {} };
            const parserModule = eval(`(function() { ${commonjsContent}; return { parser }; })()`);
            
            return parserModule;
        } catch (error) {
            console.error(`❌ Error loading TS parser from ${filePath}:`, error.message);
            return null;
        }
    }
}

module.exports = TypeScriptParserLoader;