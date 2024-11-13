import { ExtensionProperty, type IProperty, type Nullable, type vec3, PropertyType, TextureInfo, Texture, TextureChannel } from '@gltf-transform/core';
import { VRMC_MATERIALS_MTOON } from '../constants.js';

const { R, G, B } = TextureChannel;

interface IMToon extends IProperty {
  specVersion: SpecVersion;
  transparentWithZWrite: boolean;
  renderQueueOffsetNumber: number;
  shadeColorFactor: vec3;
  shadeMultiplyTexture: Texture;
  shadeMultiplyTextureInfo: TextureInfo;
  shadingShiftFactor: number;
  // TODO: Implement support for 'scale' property
  //       https://github.com/vrm-c/vrm-specification/blob/master/specification/VRMC_materials_mtoon-1.0/schema/mtoon.shadingShiftTexture.schema.json#L9
  shadingShiftTexture: Texture;
  shadingShiftTextureInfo: TextureInfo;
  shadingToonyFactor: number;
  giEqualizationFactor: number;
  matcapFactor: vec3;
  matcapTexture: Texture;
  matcapTextureInfo: TextureInfo;
  parametricRimColorFactor: vec3;
  rimMultiplyTexture: Texture;
  rimMultiplyTextureInfo: TextureInfo;
  rimLightingMixFactor: number;
  parametricRimFresnelPowerFactor: number;
  parametricRimLiftFactor: number;
  outlineWidthMode: OutlineWidthMode;
  outlineWidthFactor: number;
  outlineWidthMultiplyTexture: Texture;
  outlineWidthMultiplyTextureInfo: TextureInfo;
  outlineColorFactor: vec3;
  outlineLightingMixFactor: number;
  uvAnimationMaskTexture: Texture;
  uvAnimationMaskTextureInfo: TextureInfo;
  uvAnimationScrollXSpeedFactor: number;
  uvAnimationScrollYSpeedFactor: number;
  uvAnimationRotationSpeedFactor: number;
}

type SpecVersion = '1.0'|'1.0-beta';
type OutlineWidthMode = 'none'|'worldCoordinates'|'screenCoordinates';

export class MToon extends ExtensionProperty<IMToon> {
  public static EXTENSION_NAME = VRMC_MATERIALS_MTOON;
  public declare extensionName: typeof VRMC_MATERIALS_MTOON;
  public declare propertyType: 'MToon';
  public declare parentTypes: [PropertyType.MATERIAL];

  protected init(): void {
    this.extensionName = VRMC_MATERIALS_MTOON;
    this.propertyType = 'MToon';
    this.parentTypes = [PropertyType.MATERIAL];
  }

  protected getDefaults(): Nullable<IMToon> {
    return Object.assign(super.getDefaults() as IProperty, {
      specVersion: '1.0' as SpecVersion,
      transparentWithZWrite: false,
      renderQueueOffsetNumber: 0,
      shadeColorFactor: [1, 1, 1] as vec3,
      shadeMultiplyTexture: null,
      shadeMultiplyTextureInfo: new TextureInfo(this.graph, 'shadeMultiplyTexture'),
      shadingShiftFactor: 0,
      shadingShiftTexture: null,
      shadingShiftTextureInfo: new TextureInfo(this.graph, 'shadingShiftTexture'),
      shadingToonyFactor: 0.9,
      giEqualizationFactor: 0.9,
      matcapFactor: [1, 1, 1] as vec3,
      matcapTexture: null,
      matcapTextureInfo: new TextureInfo(this.graph, 'matcapTexture'),
      parametricRimColorFactor: [0, 0, 0] as vec3,
      rimMultiplyTexture: null,
      rimMultiplyTextureInfo: new TextureInfo(this.graph, 'rimMultiplyTexture'),
      rimLightingMixFactor: 1.0,
      parametricRimFresnelPowerFactor: 5.0,
      parametricRimLiftFactor: 0.0,
      outlineWidthMode: 'none' as OutlineWidthMode,
      outlineWidthFactor: 0.0,
      outlineWidthMultiplyTexture: null,
      outlineWidthMultiplyTextureInfo: new TextureInfo(this.graph, 'outlineWidthMultiplyTexture'),
      outlineColorFactor: [0, 0, 0] as vec3,
      outlineLightingMixFactor: 1.0,
      uvAnimationMaskTexture: null,
      uvAnimationMaskTextureInfo: new TextureInfo(this.graph, 'uvAnimationMaskTexture'),
      uvAnimationScrollXSpeedFactor: 0,
      uvAnimationScrollYSpeedFactor: 0,
      uvAnimationRotationSpeedFactor: 0,
    });
  }

  public getSpecVersion(): SpecVersion {
    return this.get('specVersion');
  }

  public setSpecVersion(specVersion: SpecVersion): this {
    return this.set('specVersion', specVersion);
  }

  public getTransparentWithZWrite(): boolean {
    return this.get('transparentWithZWrite');
  }

  public setTransparentWithZWrite(transparentWithZWrite: boolean): this {
    return this.set('transparentWithZWrite', transparentWithZWrite);
  }

  public getRenderQueueOffsetNumber(): number {
    return this.get('renderQueueOffsetNumber');
  }

  public setRenderQueueOffsetNumber(renderQueueOffsetNumber: number): this {
    return this.set('renderQueueOffsetNumber', renderQueueOffsetNumber);
  }

  public getShadeColorFactor(): vec3 {
    return this.get('shadeColorFactor');
  }

  public setShadeColorFactor(shadeColorFactor: vec3): this {
    return this.set('shadeColorFactor', shadeColorFactor);
  }

  public getShadeMultiplyTexture(): Texture|null {
    return this.getRef('shadeMultiplyTexture');
  }

  public getShadeMultiplyTextureInfo(): TextureInfo|null {
    return this.getRef('shadeMultiplyTexture') ? this.getRef('shadeMultiplyTextureInfo') : null;;
  }

  public setShadeMultiplyTexture(shadeMultiplyTexture: Texture|null): this {
    return this.setRef('shadeMultiplyTexture', shadeMultiplyTexture, { channels: R | G | B, isColor: true });
  }

  public getShadingShiftFactor(): number {
    return this.get('shadingShiftFactor');
  }

  public setShadingShiftFactor(shadingShiftFactor: number): this {
    return this.set('shadingShiftFactor', shadingShiftFactor);
  }

  public getShadingShiftTexture(): Texture|null {
    return this.getRef('shadingShiftTexture');
  }

  public getShadingShiftTextureInfo(): TextureInfo|null {
    return this.getRef('shadingShiftTexture') ? this.getRef('shadingShiftTextureInfo') : null;
  }

  public setShadingShiftTexture(shadingShiftTexture: Texture|null): this {
    return this.setRef('shadingShiftTexture', shadingShiftTexture, { channels: R });
  }

  public getShadingToonyFactor(): number {
    return this.get('shadingToonyFactor');
  }

  public setShadingToonyFactor(shadingToonyFactor: number): this {
    return this.set('shadingToonyFactor', shadingToonyFactor);
  }

  public getGiEqualizationFactor(): number {
    return this.get('giEqualizationFactor');
  }

  public setGiEqualizationFactor(giEqualizationFactor: number): this {
    return this.set('giEqualizationFactor', giEqualizationFactor);
  }

  public getMatcapFactor(): vec3 {
    return this.get('matcapFactor');
  }

  public setMatcapFactor(matcapFactor: vec3): this {
    return this.set('matcapFactor', matcapFactor);
  }

  public getMatcapTexture(): Texture|null {
    return this.getRef('matcapTexture');
  }

  public getMatcapTextureInfo(): TextureInfo|null {
    return this.getRef('matcapTexture') ? this.getRef('matcapTextureInfo') : null;
  }

  public setMatcapTexture(matcapTexture: Texture|null): this {
    return this.setRef('matcapTexture', matcapTexture, { channels: R | G | B, isColor: true });
  }

  public getParametricRimColorFactor(): vec3 {
    return this.get('parametricRimColorFactor');
  }

  public setParametricRimColorFactor(parametricRimColorFactor: vec3): this {
    return this.set('parametricRimColorFactor', parametricRimColorFactor);
  }

  public getRimMultiplyTexture(): Texture|null {
    return this.getRef('rimMultiplyTexture');
  }

  public getRimMultiplyTextureInfo(): TextureInfo|null {
    return this.getRef('rimMultiplyTexture') ? this.getRef('rimMultiplyTextureInfo') : null;
  }

  public setRimMultiplyTexture(rimMultiplyTexture: Texture|null): this {
    return this.setRef('rimMultiplyTexture', rimMultiplyTexture, { channels: R | G | B, isColor: true });
  }

  public getRimLightingMixFactor(): number {
    return this.get('rimLightingMixFactor');
  }

  public setRimLightingMixFactor(rimLightingMixFactor: number): this {
    return this.set('rimLightingMixFactor', rimLightingMixFactor);
  }

  public getParametricRimFresnelPowerFactor(): number {
    return this.get('parametricRimFresnelPowerFactor');
  }

  public setParametricRimFresnelPowerFactor(parametricRimFresnelPowerFactor: number): this {
    return this.set('parametricRimFresnelPowerFactor', parametricRimFresnelPowerFactor);
  }

  public getParametricRimLiftFactor(): number {
    return this.get('parametricRimLiftFactor');
  }

  public setParametricRimLiftFactor(parametricRimLiftFactor: number): this {
    return this.set('parametricRimLiftFactor', parametricRimLiftFactor);
  }

  public getOutlineWidthMode(): OutlineWidthMode {
    return this.get('outlineWidthMode');
  }

  public setOutlineWidthMode(outlineWidthMode: OutlineWidthMode): this {
    return this.set('outlineWidthMode', outlineWidthMode);
  }

  public getOutlineWidthFactor(): number {
    return this.get('outlineWidthFactor');
  }

  public setOutlineWidthFactor(outlineWidthFactor: number): this {
    return this.set('outlineWidthFactor', outlineWidthFactor);
  }

  public getOutlineWidthMultiplyTexture(): Texture|null {
    return this.getRef('outlineWidthMultiplyTexture');
  }

  public getOutlineWidthMultiplyTextureInfo(): TextureInfo|null {
    return this.getRef('outlineWidthMultiplyTexture') ? this.getRef('outlineWidthMultiplyTextureInfo') : null;
  }

  public setOutlineWidthMultiplyTexture(outlineWidthMultiplyTexture: Texture|null): this {
    return this.setRef('outlineWidthMultiplyTexture', outlineWidthMultiplyTexture, { channels: G });
  }

  public getOutlineColorFactor(): vec3 {
    return this.get('outlineColorFactor');
  }

  public setOutlineColorFactor(outlineColorFactor: vec3): this {
    return this.set('outlineColorFactor', outlineColorFactor);
  }

  public getOutlineLightingMixFactor(): number {
    return this.get('outlineLightingMixFactor');
  }

  public setOutlineLightingMixFactor(outlineLightingMixFactor: number): this {
    return this.set('outlineLightingMixFactor', outlineLightingMixFactor);
  }

  public getUvAnimationMaskTexture(): Texture|null {
    return this.getRef('uvAnimationMaskTexture');
  }

  public getUvAnimationMaskTextureInfo(): TextureInfo|null {
    return this.getRef('uvAnimationMaskTexture') ? this.getRef('uvAnimationMaskTextureInfo') : null;
  }

  public setUvAnimationMaskTexture(uvAnimationMaskTexture: Texture|null): this {
    return this.setRef('uvAnimationMaskTexture', uvAnimationMaskTexture, { channels: B });
  }

  public getUvAnimationScrollXSpeedFactor(): number {
    return this.get('uvAnimationScrollXSpeedFactor');
  }

  public setUvAnimationScrollXSpeedFactor(uvAnimationScrollXSpeedFactor: number): this {
    return this.set('uvAnimationScrollXSpeedFactor', uvAnimationScrollXSpeedFactor);
  }

  public getUvAnimationScrollYSpeedFactor(): number {
    return this.get('uvAnimationScrollYSpeedFactor');
  }

  public setUvAnimationScrollYSpeedFactor(uvAnimationScrollYSpeedFactor: number): this {
    return this.set('uvAnimationScrollYSpeedFactor', uvAnimationScrollYSpeedFactor);
  }

  public getUvAnimationRotationSpeedFactor(): number {
    return this.get('uvAnimationRotationSpeedFactor');
  }

  public setUvAnimationRotationSpeedFactor(uvAnimationRotationSpeedFactor: number): this {
    return this.set('uvAnimationRotationSpeedFactor', uvAnimationRotationSpeedFactor);
  }
}