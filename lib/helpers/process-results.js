'use strict';

const Linter = require('../linter');

/**
  Expects a single argument which is expected to be in the format of `Message[]` (the result of
 `this.log` from within a rule). Emits the following interface:

  interface Message {
    rule: string;
    severity: 0 | 1 | 2;
    filePath?: string;
    moduleId?: string;
    message: string;
    line: number;
    column: number;
    source: string;
    isFixable?: boolean;
  }

  interface FileResult {
    filePath: string;
    messages: Message[];
    errorCount: number;
    warningCount: number;
    fixableErrorCount: number;
    fixableWarningCount: number;
  }

  interface TemplateLintResult {
    files: {
      [filePath: string]: FileResult;
    }

    errorCount: number;
    warningCount: number;
    fixableErrorCount: number;
    fixableWarningCount: number;
  }
 */
module.exports = function(messages) {
  let errorCount = 0;
  let fixableErrorCount = 0;
  let warningCount = 0;
  let fixableWarningCount = 0;
  let files = {};

  for (let item of messages) {
    let filePath = item.filePath || item.moduleId;
    let fileResults = files[filePath];
    if (fileResults === undefined) {
      fileResults = {
        filePath,
        messages: [],
        errorCount: 0,
        warningCount: 0,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
      };
    }

    fileResults.messages.push(item);

    switch (item.severity) {
      case Linter.IGNORE_SEVERITY:
        continue;
      case Linter.ERROR_SEVERITY:
        errorCount++;
        fileResults.errorCount++;
        if (item.isFixable) {
          fixableErrorCount++;
          fileResults.fixableErrorCount++;
        }
        break;
      case Linter.WARNING_SEVERITY:
        warningCount++;
        fileResults.warningCount++;
        if (item.isFixable) {
          fixableWarningCount++;
          fileResults.fixableWarningCount++;
        }
        break;
    }

    files[filePath] = fileResults;
  }

  let output = {
    files,
    errorCount,
    warningCount,
    fixableErrorCount,
    fixableWarningCount,
  };

  return output;
};
