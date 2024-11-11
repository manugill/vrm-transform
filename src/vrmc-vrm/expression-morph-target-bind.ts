import { ExtensionProperty, Node, PrimitiveTarget, RefSet, type IProperty, type Nullable } from '@gltf-transform/core';
import { VRMC_VRM } from '../constants';

interface IExpressionMorphTargetBind extends IProperty {
  node: Node;
  index: number;
  morphTargets: RefSet<PrimitiveTarget>;
  weight: number;
}

export class ExpressionMorphTargetBind extends ExtensionProperty<IExpressionMorphTargetBind> {
  public static EXTENSION_NAME = VRMC_VRM;
  public declare extensionName: typeof VRMC_VRM;
  public declare propertyType: 'VrmExpressionMorphTargetBind';
  public declare parentTypes: ['VrmExpression'];

  protected init(): void {
    this.extensionName = VRMC_VRM;
    this.propertyType = 'VrmExpressionMorphTargetBind';
    this.parentTypes = ['VrmExpression'];
  }

  protected getDefaults(): Nullable<IExpressionMorphTargetBind> {
    return Object.assign(super.getDefaults() as IProperty, {
      node: null,
      index: null,
      morphTargets: new RefSet<PrimitiveTarget>(),
      weight: 0.0,
    });
  }

  public getNode(): Node|null {
    return this.getRef('node');
  }

  public setNode(node: Node|null): this {
    return this.setRef('node', node);
  }

  public getIndex(): number {
    return this.get('index');
  }

  public setIndex(index: number): this {
    return this.set('index', index);
  }

  public listMorphTargets(): PrimitiveTarget[] {
    return this.listRefs('morphTargets');
  }

  public addMorphTarget(morphTarget: PrimitiveTarget): this {
    return this.addRef('morphTargets', morphTarget);
  }

  public removeMorphTarget(morphTarget: PrimitiveTarget): this {
    return this.removeRef('morphTargets', morphTarget);
  }

  public getWeight(): number {
    return this.get('weight');
  }

  public setWeight(weight: number): this {
    return this.set('weight', weight);
  }
}