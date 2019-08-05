import { AstContext, DefaultVisitor } from "./visitor";
import ts = require('typescript');
import { GenTree } from "./gentree";

export class PythonVisitor extends DefaultVisitor {
  public importEqualsDeclaration(node: ts.ImportEqualsDeclaration, _children: AstContext): GenTree {
    return new GenTree('import ' + node.moduleReference.getText(_children.sourceFile), [], {
      newline: true,
    });
  }

  public identifier(node: ts.Identifier, _context: AstContext) {
    return new GenTree(node.text.replace(/[^A-Z][A-Z]/g, m => m[0].substr(0, 1) + '_' + m.substr(1).toLowerCase()));
  }

  public functionDeclaration(node: ts.FunctionDeclaration, children: AstContext): GenTree {
    return new GenTree(`def ${children.node(node.name)}(${children.nodes(node.parameters)})`, [children.node(node.body)]);
  }

  public block(_node: ts.Block, children: AstContext): GenTree {
    return new GenTree(':', children.all(), {
      newline: true,
      indentChildren: 4,
    });
  }

  public parameterDeclaration(node: ts.ParameterDeclaration, children: AstContext): GenTree {
    return new GenTree(`${children.node(node.name)}`);
  }

  public ifStatement(node: ts.IfStatement, context: AstContext): GenTree {
    const ifStmt = new GenTree(`if ${context.node(node.expression)}`, [context.node(node.thenStatement)]);
    const elseStmt = node.elseStatement ? new GenTree(`else`, [context.node(node.elseStatement)]) : undefined;
    return elseStmt ? new GenTree('', [ifStmt, elseStmt]) : ifStmt;
  }
}