import path from 'path';

export default class BootstrapPathManager {
  private readonly _tmp: string;
  private readonly _home: string;
  private _folderName: string;
  private readonly basePath: string;

  constructor(tmp: string, home: string, basePath?: string) {
    this._tmp = tmp;
    this._home = home;
    this._folderName = 'servequery-cloud';
    this.basePath = basePath ?? '.';
  }

  get folderName(): string {
    return this._folderName || 'servequery-cloud';
  }

  set folderName(name: string) {
    this._folderName = name;
  }

  get home(): string {
    return this._home;
  }

  get tmp(): string {
    return this._tmp;
  }

  get zip(): string {
    return path.join(this.tmp, 'cloud-customizer.zip');
  }

  get extracted(): string {
    return path.join(this.tmp, 'cloud-customizer-main');
  }

  get folder(): string {
    return path.join(this.basePath, this.folderName);
  }

  get typings(): string {
    return path.join(this.basePath, 'typings.d.ts');
  }

  get typingsDuringBootstrap(): string {
    return path.join(this.folder, 'typings.d.ts');
  }

  get index(): string {
    return path.join(this.folder, 'src', 'index.ts');
  }

  get env(): string {
    return path.join(this.folder, '.env');
  }

  get dotEnvTemplate(): string {
    return path.join(__dirname, '..', 'templates', 'env.txt');
  }

  get indexTemplate(): string {
    return path.join(__dirname, '..', 'templates', 'index.txt');
  }
}
