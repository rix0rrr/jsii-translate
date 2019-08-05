import ts = require('typescript');
import { GenTree, UnknownSyntax } from './gentree';

export interface AstContext {
  sourceFile: ts.SourceFile;

  all(): GenTree[];
  node(node: ts.Node | undefined): GenTree;
  nodes<A extends ts.Node>(node: ReadonlyArray<A>): GenTree;
  textOf(node: ts.Node): string;
}

export interface AstVisitor {
  importEqualsDeclaration(node: ts.ImportEqualsDeclaration, context: AstContext): GenTree;
  stringLiteral(node: ts.StringLiteral, children: AstContext): GenTree;
  functionDeclaration(node: ts.FunctionDeclaration, children: AstContext): GenTree;
  identifier(node: ts.Identifier, children: AstContext): GenTree;
  syntaxList(node: ts.SyntaxList, children: AstContext): GenTree;
  block(node: ts.Block, children: AstContext): GenTree;
  parameterDeclaration(node: ts.ParameterDeclaration, children: AstContext): GenTree;
  returnStatement(node: ts.ReturnStatement, context: AstContext): GenTree;
  binaryExpression(node: ts.BinaryExpression, context: AstContext): GenTree;
  ifStatement(node: ts.IfStatement, context: AstContext): GenTree;
  propertyAccessExpression(node: ts.PropertyAccessExpression, context: AstContext): GenTree;
  callExpression(node: ts.CallExpression, context: AstContext): GenTree;
  expressionStatement(node: ts.ExpressionStatement, context: AstContext): GenTree;
  token<A extends ts.SyntaxKind>(node: ts.Token<A>, context: AstContext): GenTree;
}

export class IdentityVisitor implements AstVisitor {
  public importEqualsDeclaration(node: ts.ImportEqualsDeclaration, children: AstContext): GenTree {
    return nimpl(node, children);
  }

  public functionDeclaration(node: ts.FunctionDeclaration, children: AstContext): GenTree {
    return nimpl(node, children);
  }

  public stringLiteral(node: ts.StringLiteral, children: AstContext): GenTree {
    return nimpl(node, children);
  }

  public identifier(node: ts.Identifier, children: AstContext): GenTree {
    return nimpl(node, children);
  }

  public syntaxList(node: ts.SyntaxList, children: AstContext): GenTree {
    return nimpl(node, children);
  }

  public block(node: ts.Block, children: AstContext): GenTree {
    return nimpl(node, children);
  }

  public parameterDeclaration(node: ts.ParameterDeclaration, children: AstContext): GenTree {
    return nimpl(node, children);
  }

  public returnStatement(node: ts.ReturnStatement, children: AstContext): GenTree {
    return nimpl(node, children);
  }

  public binaryExpression(node: ts.BinaryExpression, children: AstContext): GenTree {
    return nimpl(node, children);
  }

  public ifStatement(node: ts.IfStatement, context: AstContext): GenTree {
    return nimpl(node, context);
  }

  public propertyAccessExpression(node: ts.PropertyAccessExpression, context: AstContext): GenTree {
    return nimpl(node, context);
  }

  public callExpression(node: ts.CallExpression, context: AstContext): GenTree {
    return nimpl(node, context);
  }

  public expressionStatement(node: ts.ExpressionStatement, context: AstContext): GenTree {
    return nimpl(node, context);
  }

  public token<A extends ts.SyntaxKind>(node: ts.Token<A>, context: AstContext): GenTree {
    return nimpl(node, context);
  }
}

export class DefaultVisitor implements AstVisitor {
  public importEqualsDeclaration(node: ts.ImportEqualsDeclaration, children: AstContext): GenTree {
    return nimpl(node, children);
  }

  public functionDeclaration(node: ts.FunctionDeclaration, children: AstContext): GenTree {
    return nimpl(node, children);
  }

  public stringLiteral(node: ts.StringLiteral, _children: AstContext): GenTree {
    return new GenTree(JSON.stringify(node.text));
  }

  public identifier(node: ts.Identifier, _children: AstContext): GenTree {
    return new GenTree(node.text);
  }

  public syntaxList(_node: ts.SyntaxList, children: AstContext): GenTree {
    // This groups nodes together, don't really know the purpose but we don't need it.
    return new GenTree('', children.all());
  }

  public block(_node: ts.Block, children: AstContext): GenTree {
    return new GenTree('{ ', children.all(), {
      newline: true,
      indentChildren: 4,
      suffix: '}',
    });
  }

  public parameterDeclaration(node: ts.ParameterDeclaration, children: AstContext): GenTree {
    return nimpl(node, children);
  }

  public returnStatement(node: ts.ReturnStatement, children: AstContext): GenTree {
    return new GenTree(`return ${children.node(node.expression)}`);
  }

  public binaryExpression(node: ts.BinaryExpression, context: AstContext): GenTree {
    return new GenTree(`${context.node(node.left)} ${context.textOf(node.operatorToken)} ${context.node(node.right)}`);
  }

  public ifStatement(node: ts.IfStatement, context: AstContext): GenTree {
    return nimpl(node, context);
  }

  public propertyAccessExpression(node: ts.PropertyAccessExpression, context: AstContext): GenTree {
    return new GenTree(`${context.node(node.expression)}.${context.node(node.name)}`);
  }

  public callExpression(node: ts.CallExpression, context: AstContext): GenTree {
    return new GenTree(`${context.node(node.expression)}(${context.nodes(node.arguments)})`);
  }

  public expressionStatement(node: ts.ExpressionStatement, context: AstContext): GenTree {
    return context.node(node.expression);
  }

  public token<A extends ts.SyntaxKind>(node: ts.Token<A>, context: AstContext): GenTree {
    return new GenTree(context.textOf(node));
  }
}

export function nimpl(node: ts.Node, context: AstContext) {
  return new UnknownSyntax(`(${ts.SyntaxKind[node.kind]} ${context.textOf(node)})`, context.all(), {
    newline: true,
    indentChildren: 2,
  });
}