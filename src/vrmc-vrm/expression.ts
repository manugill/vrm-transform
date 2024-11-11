import { ExtensionProperty, ReaderContext, RefList, WriterContext, type IProperty, type Nullable, type vec2 } from '@gltf-transform/core';
import { VRMC_VRM } from '../constants';
import type { ExpressionOverrideType, Expression as ExpressionDef, ExpressionMorphTargetBind as ExpressionMorphTargetBindDef, ExpressionMaterialColorBind as ExpressionMaterialColorBindDef, ExpressionTextureTransformBind as ExpressionTextureTransformBindDef } from '@pixiv/types-vrmc-vrm-1.0';
import { ExpressionMorphTargetBind } from './expression-morph-target-bind.js';
import { ExpressionTextureTransformBind } from './expression-texture-transform-bind.js';
import { ExpressionMaterialColorBind } from './expression-material-color-bind.js';

interface IExpression extends IProperty {
  morphTargetBinds: RefList<ExpressionMorphTargetBind>;
  materialColorBinds: RefList<ExpressionMaterialColorBind>;
  textureTransformBinds: RefList<ExpressionTextureTransformBind>;
  isBinary: boolean;
  overrideBlink: ExpressionOverrideType;
  overrideLookAt: ExpressionOverrideType;
  overrideMouth: ExpressionOverrideType;
}

export class Expression extends ExtensionProperty<IExpression> {
  public static EXTENSION_NAME = VRMC_VRM;
  public declare extensionName: typeof VRMC_VRM;
  public declare propertyType: 'VrmExpression';
  public declare parentTypes: ['Vrm'];

  protected init(): void {
    this.extensionName = VRMC_VRM;
    this.propertyType = 'VrmExpression';
    this.parentTypes = ['Vrm'];
  }

  protected getDefaults(): Nullable<IExpression> {
    return Object.assign(super.getDefaults() as IProperty, {
      morphTargetBinds: new RefList<ExpressionMorphTargetBind>(),
      materialColorBinds: new RefList<ExpressionMaterialColorBind>(),
      textureTransformBinds: new RefList<ExpressionTextureTransformBind>(),
      isBinary: false,
      overrideBlink: 'none' as ExpressionOverrideType,
      overrideLookAt: 'none' as ExpressionOverrideType,
      overrideMouth: 'none' as ExpressionOverrideType,
    });
  }

  public listMorphTargetBinds(): ExpressionMorphTargetBind[] {
    return this.listRefs('morphTargetBinds');
  }

  public addMorphTargetBind(morphTargetBind: ExpressionMorphTargetBind): this {
    return this.addRef('morphTargetBinds', morphTargetBind);
  }

  public removeMorphTargetBind(morphTargetBind: ExpressionMorphTargetBind): this {
    return this.removeRef('morphTargetBinds', morphTargetBind);
  }

  public listMaterialColorBinds(): ExpressionMaterialColorBind[] {
    return this.listRefs('materialColorBinds');
  }

  public addMaterialColorBind(materialColorBind: ExpressionMaterialColorBind): this {
    return this.addRef('materialColorBinds', materialColorBind);
  }

  public removeMaterialColorBind(materialColorBind: ExpressionMaterialColorBind): this {
    return this.removeRef('materialColorBinds', materialColorBind);
  }

  public listTextureTransformBinds(): ExpressionTextureTransformBind[] {
    return this.listRefs('textureTransformBinds');
  }

  public addTextureTransformBind(textureTransformBind: ExpressionTextureTransformBind): this {
    return this.addRef('textureTransformBinds', textureTransformBind);
  }

  public removeTextureTransformBind(textureTransformBind: ExpressionTextureTransformBind): this {
    return this.removeRef('textureTransformBinds', textureTransformBind);
  }

  public getIsBinary(): boolean {
    return this.get('isBinary');
  }

  public setIsBinary(isBinary: boolean): this {
    return this.set('isBinary', isBinary);
  }

  public getOverrideBlink(): ExpressionOverrideType {
    return this.get('overrideBlink');
  }

  public setOverrideBlink(overrideBlink: ExpressionOverrideType): this {
    return this.set('overrideBlink', overrideBlink);
  }

  public getOverrideLookAt(): ExpressionOverrideType {
    return this.get('overrideLookAt');
  }

  public setOverrideLookAt(overrideLookAt: ExpressionOverrideType): this {
    return this.set('overrideLookAt', overrideLookAt);
  }

  public getOverrideMouth(): ExpressionOverrideType {
    return this.get('overrideMouth');
  }

  public setOverrideMouth(overrideMouth: ExpressionOverrideType): this {
    return this.set('overrideMouth', overrideMouth);
  }

  public read(expressionDef: ExpressionDef, context: ReaderContext): this {
    for(const bindDef of expressionDef.morphTargetBinds ?? []) {
      const bind = new ExpressionMorphTargetBind(this.getGraph());
      bind.setNode(context.nodes[bindDef.node]);
      bind.setIndex(bindDef.index); // FIXME: this is a weak link
      bind.setWeight(bindDef.weight);
      this.addMorphTargetBind(bind);
    }

    for(const bindDef of expressionDef.materialColorBinds ?? []) {
      const bind = new ExpressionMaterialColorBind(this.getGraph());
      bind.setMaterial(context.materials[bindDef.material]);
      bind.setType(bindDef.type);
      bind.setTargetValue(bindDef.targetValue);
      this.addMaterialColorBind(bind);
    }

    for(const bindDef of expressionDef.textureTransformBinds ?? []) {
      const bind = new ExpressionTextureTransformBind(this.getGraph());
      bind.setMaterial(context.materials[bindDef.material]);
      bind.setScale(bindDef.scale ?? [1, 1] as vec2);
      bind.setOffset(bindDef.offset ?? [0, 0] as vec2);
      this.addTextureTransformBind(bind);
    }

    this.setIsBinary(expressionDef.isBinary ?? false);
    this.setOverrideBlink(expressionDef.overrideBlink ?? 'none');
    this.setOverrideLookAt(expressionDef.overrideLookAt ?? 'none');
    this.setOverrideMouth(expressionDef.overrideMouth ?? 'none');
    return this;
  }

  public write(context: WriterContext): ExpressionDef {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: ExpressionDef = {} as any;

    result.morphTargetBinds = [];
    for(const bind of this.listMorphTargetBinds()) {
      result.morphTargetBinds!.push({
        node: context.nodeIndexMap.get(bind.getNode()!)!,
        index: bind.getIndex(),
        weight: bind.getWeight(),
      } satisfies ExpressionMorphTargetBindDef);
    }

    result.materialColorBinds = [];
    for(const bind of this.listMaterialColorBinds()) {
      result.materialColorBinds!.push({
        material: context.materialIndexMap.get(bind.getMaterial()!)!,
        type: bind.getType(),
        targetValue: bind.getTargetValue(),
      } satisfies ExpressionMaterialColorBindDef);
    }

    result.textureTransformBinds = [];
    for(const bind of this.listTextureTransformBinds()) {
      result.textureTransformBinds!.push({
        material: context.materialIndexMap.get(bind.getMaterial()!)!,
        scale: bind.getScale(),
        offset: bind.getOffset(),
      } satisfies ExpressionTextureTransformBindDef);
    }

    result.isBinary = this.getIsBinary();
    result.overrideBlink = this.getOverrideBlink();
    result.overrideLookAt = this.getOverrideLookAt();
    result.overrideMouth = this.getOverrideMouth();

    return result;
  }
}