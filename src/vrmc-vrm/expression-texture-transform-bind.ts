import { ExtensionProperty, Material, type IProperty, type Nullable, type vec2 } from '@gltf-transform/core';
import { VRMC_VRM } from '../constants';

interface IExpressionTextureTransformBind extends IProperty {
  material: Material;
  scale: vec2;
  offset: vec2;
}

export class ExpressionTextureTransformBind extends ExtensionProperty<IExpressionTextureTransformBind> {
  public static EXTENSION_NAME = VRMC_VRM;
  public declare extensionName: typeof VRMC_VRM;
  public declare propertyType: 'VrmExpressionTextureTransformBind';
  public declare parentTypes: ['VrmExpression'];

  protected init(): void {
    this.extensionName = VRMC_VRM;
    this.propertyType = 'VrmExpressionTextureTransformBind';
    this.parentTypes = ['VrmExpression'];
  }

  protected getDefaults(): Nullable<IExpressionTextureTransformBind> {
    return Object.assign(super.getDefaults() as IProperty, {
      material: null,
      scale: [1, 1] as vec2,
      offset: [0, 0] as vec2,
    });
  }

  public getMaterial(): Material|null {
    return this.getRef('material');
  }

  public setMaterial(material: Material|null): this {
    return this.setRef('material', material);
  }

  public getScale(): vec2 {
    return this.get('scale');
  }

  public setScale(scale: vec2): this {
    return this.set('scale', scale);
  }

  public getOffset(): vec2 {
    return this.get('offset');
  }

  public setOffset(offset: vec2): this {
    return this.set('offset', offset);
  }

}