import { Caller, ColumnSchema, ConditionTree } from '@servequery/datasource-toolkit';
import { CharStream, CommonTokenStream, ParseTreeWalker } from 'antlr4';

import ConditionTreeQueryWalker from './custom-parser/condition-tree-query-walker';
import CustomQueryParser from './custom-parser/custom-query-parser';
/**
 * All these classes are generated by antlr (the command line)
 * In order to support new syntax:
 * 1. Update the grammar file (src/parser/Query.g4)
 * 2. Run `yarn build:parser` to generate the new classes
 * 3. Manually update the parser to add `override` on the EOF line (needed by TS)
 *
 * The grammar syntax is documented here: https://www.antlr.org/
 * And can be tested online here: http://lab.antlr.org/
 */
import FieldsQueryWalker from './custom-parser/fields-query-walker';
import QueryLexer from './generated-parser/QueryLexer';
import { QueryContext } from './generated-parser/QueryParser';

export function parseQuery(query: string): QueryContext {
  const chars = new CharStream(query?.trim()); // replace this with a FileStream as required
  const lexer = new QueryLexer(chars);
  const tokens = new CommonTokenStream(lexer);
  const parser = new CustomQueryParser(tokens);

  return parser.query();
}

export function generateConditionTree(
  caller: Caller,
  tree: QueryContext,
  fields: [string, ColumnSchema][],
): ConditionTree {
  const walker = new ConditionTreeQueryWalker(caller, fields);

  ParseTreeWalker.DEFAULT.walk(walker, tree);

  const result = walker.conditionTree;

  if (result) {
    return result;
  }

  // Parsing error, fallback
  return walker.generateDefaultFilter(tree.getText());
}

export function extractSpecifiedFields(tree: QueryContext) {
  const walker = new FieldsQueryWalker();
  ParseTreeWalker.DEFAULT.walk(walker, tree);

  return walker.fields;
}
