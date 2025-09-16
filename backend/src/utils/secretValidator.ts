/**
 * GENESIS LUMINAL - SECRET VALIDATOR
 * Validação e detecção de secrets em código
 */

import { logger } from './logger';
import crypto from 'crypto';
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
  column: number;
  match: string;
  pattern: SecretPattern;
  maskedMatch: string;
}

class SecretValidator {
  private readonly patterns: SecretPattern[] = [
    {
      name: 'AWS Access Key',
      pattern: /AKIA[0-9A-Z]{16}/g,
      severity: 'high',
      description: 'AWS Access Key ID'
    },
    {
      name: 'AWS Secret Key',
      pattern: /[0-9a-zA-Z/+]{40}/g,
      severity: 'high',
      description: 'AWS Secret Access Key'
    },
    {
      name: 'Azure Storage Key',
      pattern: /[0-9a-zA-Z+/]{88}==/g,
      severity: 'high',
      description: 'Azure Storage Account Key'
    },
    {
      name: 'Google API Key',
      pattern: /AIza[0-9A-Za-z\\-_]{35}/g,
      severity: 'high',
      description: 'Google API Key'
    },
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
      name: 'Generic API Key',
      pattern: /[a-zA-Z0-9_-]*[Aa][Pp][Ii][_-]?[Kk][Ee][Yy]['"]*\s*[:=]\s*['"][a-zA-Z0-9_-]{16,}['"]/g,
      severity: 'medium',
      description: 'Generic API Key pattern'
    },
    {
      name: 'Generic Secret',
      pattern: /[a-zA-Z0-9_-]*[Ss][Ee][Cc][Rr][Ee][Tt]['"]*\s*[:=]\s*['"][a-zA-Z0-9_-]{16,}['"]/g,
      severity: 'medium',
      description: 'Generic Secret pattern'
    },
    {
      name: 'Generic Token',
      pattern: /[a-zA-Z0-9_-]*[Tt][Oo][Kk][Ee][Nn]['"]*\s*[:=]\s*['"][a-zA-Z0-9._-]{16,}['"]/g,
      severity: 'medium',
      description: 'Generic Token pattern'
    },
    {
      name: 'Generic Password',
      pattern: /[a-zA-Z0-9_-]*[Pp][Aa][Ss][Ss][Ww][Oo][Rr][Dd]['"]*\s*[:=]\s*['"][a-zA-Z0-9@#$%^&*!_-]{8,}['"]/g,
      severity: 'low',
      description: 'Generic Password pattern'
    }
  ];

  private readonly excludePatterns: RegExp[] = [
    /test[_-]?key/i,
    /example[_-]?key/i,
    /fake[_-]?key/i,
    /dummy[_-]?key/i,
    /placeholder/i,
    /your[_-]?key[_-]?here/i,
    /replace[_-]?me/i,
    /TODO/i,
    /FIXME/i
  ];

  private readonly excludeFiles: string[] = [
    '.git',
    'node_modules',
    'dist',
    'build',
    '.env.example',
    'package-lock.json',
    'yarn.lock'
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
      const lines = content.split('\n');

      for (const pattern of this.patterns) {
        pattern.pattern.lastIndex = 0; // Reset regex state
        let match;

        while ((match = pattern.pattern.exec(content)) !== null) {
          const matchText = match[0];
          
          // Skip if excluded
          if (this.isExcluded(content, matchText)) {
            continue;
          }

          // Find line and column
          const beforeMatch = content.substring(0, match.index);
          const lineNumber = beforeMatch.split('\n').length;
          const column = beforeMatch.split('\n').pop()?.length || 0;

          results.push({
            file: filePath,
            line: lineNumber,
            column: column + 1,
            match: matchText,
            pattern: pattern,
            maskedMatch: this.maskSecret(matchText)
          });
        }
      }

      return results;
    } catch (error) {
      logger.error(`Failed to scan file ${filePath}:`, error);
      return [];
    }
  }

  async scanDirectory(directory: string): Promise<SecretDetectionResult[]> {
    const results: SecretDetectionResult[] = [];

    async function scanRecursive(dir: string) {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);

          if (entry.isDirectory()) {
            await scanRecursive(fullPath);
          } else if (entry.isFile()) {
            const fileResults = await this.scanFile(fullPath);
            results.push(...fileResults);
          }
        }
      } catch (error) {
        logger.error(`Failed to scan directory ${dir}:`, error);
      }
    }

    await scanRecursive(directory);
    return results;
  }

  generateReport(results: SecretDetectionResult[]): string {
    if (results.length === 0) {
      return '✅ No secrets detected in scanned files.';
    }

    const groupedBySeverity = results.reduce((acc, result) => {
      const severity = result.pattern.severity;
      if (!acc[severity]) acc[severity] = [];
      acc[severity].push(result);
      return acc;
    }, {} as Record<string, SecretDetectionResult[]>);

    let report = `🚨 SECRET DETECTION REPORT\n`;
    report += `Total secrets found: ${results.length}\n\n`;

    for (const severity of ['high', 'medium', 'low'] as const) {
      const secrets = groupedBySeverity[severity] || [];
      if (secrets.length === 0) continue;

      report += `${severity.toUpperCase()} SEVERITY (${secrets.length}):\n`;
      for (const secret of secrets) {
        report += `  📄 ${secret.file}:${secret.line}:${secret.column}\n`;
        report += `     Pattern: ${secret.pattern.name}\n`;
        report += `     Match: ${secret.maskedMatch}\n`;
        report += `     Description: ${secret.pattern.description}\n\n`;
      }
    }

    return report;
  }

  async validateEnvironmentFile(envPath: string): Promise<SecretDetectionResult[]> {
    logger.info(`Validating environment file: ${envPath}`);
    return this.scanFile(envPath);
  }

  async validateProject(projectPath: string): Promise<SecretDetectionResult[]> {
    logger.info(`Validating project for secrets: ${projectPath}`);
    return this.scanDirectory(projectPath);
  }

  generateSecretHash(secret: string): string {
    return crypto.createHash('sha256').update(secret).digest('hex').substring(0, 16);
  }
}

export { SecretValidator, SecretDetectionResult, SecretPattern };
export default SecretValidator;
