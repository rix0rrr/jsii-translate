export interface GenTreeOptions {
  newline?: boolean;
  indentChildren?: number;
  childrenSeparator?: string;
  suffix?: string;
}

export class GenTree {
  constructor(private readonly prefix: string, private readonly children?: GenTree[], private readonly options: GenTreeOptions = {}) {
  }

  public toString(): string {
    const text = this.prefix + (this.options.newline ? '\n' : '');
    const children = (this.children || []).map(c => c.toString()).join('');

    const indent = ' '.repeat(this.options.indentChildren || 0);
    const sep = (children ? this.options.childrenSeparator : '') || '';
    return (text + sep + children).replace(/\n/g, '\n' + indent) + (this.options.suffix || '');
  }
}

export const EMPTY_NODE = new GenTree('');

export class UnknownSyntax extends GenTree {
}