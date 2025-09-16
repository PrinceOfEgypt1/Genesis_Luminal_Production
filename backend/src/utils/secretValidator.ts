/**
 * GENESIS LUMINAL - SECRET VALIDATOR
 * Validação e detecção de secrets em código (versão inicial)
 */

import fs from 'fs/promises';
import path from 'path';

interface SecretPattern {
  name: string;
  pattern: RegExp;
  severity: 'high' | 'medium' | 'low';
  description: string;
}

interface SecretDetectionResult {
  file: string;
  line: number;
  match: string;
  pattern: SecretPattern;
  maskedMatch: string;
}

class SecretValidator {
  private readonly patterns: SecretPattern[] = [
    {
      name: 'Anthropic API Key',
      pattern: /sk-ant-api03-[a-zA-Z0-9\-_]{95}[a-zA-Z0-9]/g,
      severity: 'high',
      description: 'Anthropic Claude API Key'
    },
    {
      name: 'OpenAI API Key',
      pattern: /sk-[a-zA-Z0-9]{48}/g,
      severity: 'high',
      description: 'OpenAI API Key'
    },
    {
      name: 'AWS Access Key',
      pattern: /AKIA[0-9A-Z]{16}/g,
      severity: 'high',
      description: 'AWS Access Key ID'
    },
    {
      name: 'Generic API Key',
      pattern: /[a-zA-Z0-9_-]*[Aa][Pp][Ii][_-]?[Kk][Ee][Yy]['"]*\s*[:=]\s*['"][a-zA-Z0-9_-]{16,}['"]/g,
      severity: 'medium',
      description: 'Generic API Key pattern'
    }
  ];

  private readonly excludePatterns: RegExp[] = [
    /test[_-]?key/i,
    /example[_-]?key/i,
    /fake[_-]?key/i,
    /placeholder/i,
    /your[_-]?key[_-]?here/i
  ];

  private readonly excludeFiles: string[] = [
    '.git',
    'node_modules',
    'dist',
    'build',
    '.env.example',
    'package-lock.json'
  ];

  maskSecret(secret: string): string {
    if (secret.length <= 6) {
      return '*'.repeat(secret.length);
    }
    
    const visibleChars = 3;
    const prefix = secret.substring(0, visibleChars);
    const suffix = secret.substring(secret.length - visibleChars);
    const maskedLength = secret.length - (visibleChars * 2);
    
    return `${prefix}${'*'.repeat(maskedLength)}${suffix}`;
  }

  private isExcluded(content: string, match: string): boolean {
    return this.excludePatterns.some(pattern => 
      pattern.test(content) || pattern.test(match)
    );
  }

  private shouldSkipFile(filePath: string): boolean {
    return this.excludeFiles.some(exclude => 
      filePath.includes(exclude)
    );
  }

  async scanFile(filePath: string): Promise<SecretDetectionResult[]> {
    if (this.shouldSkipFile(filePath)) {
      return [];
    }

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const results: SecretDetectionResult[] = [];

      for (const pattern of this.patterns) {
        pattern.pattern.lastIndex = 0;
        let match;

        while ((match = pattern.pattern.exec(content)) !== null) {
          const matchText = match[0];
          
          if (this.isExcluded(content, matchText)) {
            continue;
          }

          const beforeMatch = content.substring(0, match.index);
          const lineNumber = beforeMatch.split('\n').length;

          results.push({
            file: filePath,
            line: lineNumber,
            match: matchText,
            pattern: pattern,
            maskedMatch: this.maskSecret(matchText)
          });
        }
      }

      return results;
    } catch (error) {
      console.error(`Failed to scan file ${filePath}:`, error);
      return [];
    }
  }

  generateReport(results: SecretDetectionResult[]): string {
    if (results.length === 0) {
      return '✅ No secrets detected in scanned files.';
    }

    let report = `🚨 SECRET DETECTION REPORT\n`;
    report += `Total secrets found: ${results.length}\n\n`;

    for (const result of results) {
      report += `📄 ${result.file}:${result.line}\n`;
      report += `   Pattern: ${result.pattern.name}\n`;
      report += `   Match: ${result.maskedMatch}\n\n`;
    }

    return report;
  }

  async validateProject(projectPath: string): Promise<SecretDetectionResult[]> {
    console.log(`Validating project for secrets: ${projectPath}`);
    const results: SecretDetectionResult[] = [];

    async function scanRecursive(dir: string) {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);

          if (entry.isDirectory() && !this.shouldSkipFile(fullPath)) {
            await scanRecursive(fullPath);
          } else if (entry.isFile()) {
            const fileResults = await this.scanFile(fullPath);
            results.push(...fileResults);
          }
        }
      } catch (error) {
        console.error(`Failed to scan directory ${dir}:`, error);
      }
    }

    await scanRecursive.call(this, projectPath);
    return results;
  }
}

export { SecretValidator, SecretDetectionResult, SecretPattern };
export default SecretValidator;
