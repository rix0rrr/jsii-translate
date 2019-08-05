import ts = require('typescript');
import { STANDARD_COMPILER_OPTIONS } from './compiler-options';
import { AstVisitor, AstContext } from './visitor';
import { UnknownSyntax, GenTree, EMPTY_NODE } from './gentree';

export function translateFile(filename: string, visitor: AstVisitor) {
  const program = ts.createProgram({
    rootNames: [filename],
    options: STANDARD_COMPILER_OPTIONS,
  });

  const rootFiles = program.getSourceFiles().filter(f => f.fileName === filename);
  if (rootFiles.length === 0) {
    throw new Error(`Oopsie -- couldn't find root file back`);
  }
  const rootFile = rootFiles[0];

  return visitTree(rootFile, rootFile, visitor);
}

function visitTree(file: ts.SourceFile, tree: ts.Node, visitor: AstVisitor): GenTree {
  const children: AstContext = {
    sourceFile: file,
    all() {
      return tree.getChildren(file).map(c => {
        return visitTree(file, c, visitor)
      });
    },
    node(node: ts.Node | undefined): GenTree {
      if (node === undefined) { return EMPTY_NODE; }
      return visitTree(file, node, visitor);
    },
    nodes<A extends ts.Node>(node: ReadonlyArray<A>): GenTree {
      return new GenTree('', node.map(c => visitTree(file, c, visitor)))
    },
    textOf(node: ts.Node): string {
      return node.getText(file);
    }
  }

  if (ts.isSourceFile(tree))  {
    return new GenTree('', children.all());
  }

  // Weird nodes
  if (tree.kind === ts.SyntaxKind.SyntaxList) { return visitor.syntaxList(tree as ts.SyntaxList, children); }
  if (tree.kind === ts.SyntaxKind.FirstPunctuation) {
    return children.nodes(tree.getChildren(file));
  }

  // Nodes with meaning
  if (ts.isImportEqualsDeclaration(tree)) { return visitor.importEqualsDeclaration(tree, children); }
  if (ts.isStringLiteral(tree)) { return visitor.stringLiteral(tree, children); }
  if (ts.isFunctionDeclaration(tree)) { return visitor.functionDeclaration(tree, children); }
  if (ts.isIdentifier(tree)) { return visitor.identifier(tree, children); }
  if (ts.isBlock(tree)) { return visitor.block(tree, children); }
  if (ts.isParameter(tree)) { return visitor.parameterDeclaration(tree, children); }
  if (ts.isReturnStatement(tree)) { return visitor.returnStatement(tree, children); }
  if (ts.isBinaryExpression(tree)) { return visitor.binaryExpression(tree, children); }
  if (ts.isIfStatement(tree)) { return visitor.ifStatement(tree, children); }
  if (ts.isPropertyAccessExpression(tree)) { return visitor.propertyAccessExpression(tree, children); }
  if (ts.isCallExpression(tree)) { return visitor.callExpression(tree, children); }
  if (ts.isExpressionStatement(tree)) { return visitor.expressionStatement(tree, children); }
  if (ts.isToken(tree)) { return visitor.token(tree, children); }

  return new UnknownSyntax(`<${ts.SyntaxKind[tree.kind]}>`, children.all(), {
    newline: true,
    indentChildren: 2,
  });
}