import { ExtensionProperty, Material, type IProperty, type Nullable, type vec4 } from '@gltf-transform/core';
import { VRMC_VRM } from '../constants';
import type { ExpressionMaterialColorType } from '@pixiv/types-vrmc-vrm-1.0';

interface IExpressionMaterialColorBind extends IProperty {
  material: Material;
  type: ExpressionMaterialColorType;
  targetValue: vec4;
}

export class ExpressionMaterialColorBind extends ExtensionProperty<IExpressionMaterialColorBind> {
  public static EXTENSION_NAME = VRMC_VRM;
  public declare extensionName: typeof VRMC_VRM;
  public declare propertyType: 'VrmExpressionMaterialColorBind';
  public declare parentTypes: ['VrmExpression'];

  protected init(): void {
    this.extensionName = VRMC_VRM;
    this.propertyType = 'VrmExpressionMaterialColorBind';
    this.parentTypes = ['VrmExpression'];
  }

  protected getDefaults(): Nullable<IExpressionMaterialColorBind> {
    return Object.assign(super.getDefaults() as IProperty, {
      material: null,
      type: 'color' as ExpressionMaterialColorType,
      targetValue: [0, 0, 0, 1] as vec4,
    });
  }

  public getMaterial(): Material|null {
    return this.getRef('material');
  }

  public setMaterial(material: Material|null): this {
    return this.setRef('material', material);
  }

  public getType(): ExpressionMaterialColorType {
    return this.get('type');
  }

  public setType(type: ExpressionMaterialColorType): this {
    return this.set('type', type);
  }

  public getTargetValue(): vec4 {
    return this.get('targetValue');
  }

  public setTargetValue(targetValue: vec4): this {
    return this.set('targetValue', targetValue);
  }
}