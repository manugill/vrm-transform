import { ExtensionProperty, PropertyType, RefMap, type IProperty, type Nullable } from '@gltf-transform/core';
import { VRMC_VRM } from '../constants.js';
import type { Meta } from './meta.js';
import { Humanoid } from './humanoid.js';
import type { Expression } from './expression.js';

interface IVrm extends IProperty {
  specVersion: SpecVersion;
  meta: Meta;
  humanoid: Humanoid;
  expressions: RefMap<Expression>;
}

type SpecVersion = '1.0'|'1.0-beta';

export class Vrm extends ExtensionProperty<IVrm> {
  public static EXTENSION_NAME = VRMC_VRM;
  public declare extensionName: typeof VRMC_VRM;
  public declare propertyType: 'Vrm';
  public declare parentTypes: [PropertyType.ROOT];

  protected init(): void {
    this.extensionName = VRMC_VRM;
    this.propertyType = 'Vrm';
    this.parentTypes = [PropertyType.ROOT];
  }

  protected getDefaults(): Nullable<IVrm> {
    return Object.assign(super.getDefaults() as IProperty, {
      specVersion: '1.0' as SpecVersion,
      meta: null,
      humanoid: null,
      expressions: new RefMap<Expression>(),
    });
  }

  public getSpecVersion(): SpecVersion {
    return this.get('specVersion');
  }

  public setSpecVersion(specVersion: SpecVersion): this {
    return this.set('specVersion', specVersion);
  }

  public getMeta(): Meta | null {
    return this.getRef('meta');
  }

  public setMeta(meta: Meta | null): this {
    return this.setRef('meta', meta);
  }

  public getHumanoid(): Humanoid | null {
    return this.getRef('humanoid');
  }

  public setHumanoid(humanoid: Humanoid | null): this {
    return this.setRef('humanoid', humanoid);
  }

  public getExpressionsNames(): string[] {
    return this.listRefMapKeys('expressions')
  }

  public listExpressions(): Expression[] {
    return this.listRefMapValues('expressions');
  }

  public getExpression(name: string): Expression | null {
    return this.getRefMap('expressions', name);
  }

  public addExpression(name: string, expression: Expression): this {
    return this.setRefMap('expressions', name, expression);
  }

  public removeExpression(name: string): this {
    return this.setRefMap('expressions', name, null);
  }

}