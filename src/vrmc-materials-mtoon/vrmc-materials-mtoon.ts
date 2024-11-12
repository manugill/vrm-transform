import { Extension, ReaderContext, WriterContext, type vec3 } from '@gltf-transform/core';
import { VRMC_MATERIALS_MTOON } from '../constants.js';
import { type VRMCMaterialsMToon as VRMCMaterialsMToonDef } from '@pixiv/types-vrmc-materials-mtoon-1.0';
import { MToon } from './mtoon.js';

const NAME = VRMC_MATERIALS_MTOON;

export class VRMCMaterialsMToon extends Extension {
  public readonly extensionName = NAME;
  public static readonly EXTENSION_NAME = NAME;

  public createMToon(): MToon {
    return new MToon(this.document.getGraph());
  }

  /** @hidden */
  public read(context: ReaderContext): this {
    const jsonDoc = context.jsonDoc;
    const textureDefs = jsonDoc.json.textures || [];

    jsonDoc.json.materials!.forEach((materialDef, materialIndex) => {
      if(!materialDef.extensions || !materialDef.extensions[NAME]) return;
      const mtoonDef = materialDef.extensions[NAME] as VRMCMaterialsMToonDef;
      const mtoon = this.createMToon();
      mtoon.setSpecVersion(mtoonDef.specVersion);

      mtoon.setTransparentWithZWrite(mtoonDef.transparentWithZWrite ?? false);
      mtoon.setRenderQueueOffsetNumber(mtoonDef.renderQueueOffsetNumber ?? 0);
      mtoon.setShadeColorFactor(mtoonDef.shadeColorFactor as vec3 ?? [1, 1, 1]);
      if(mtoonDef.shadeMultiplyTexture) {
        const textureInfoDef = mtoonDef.shadeMultiplyTexture;
        const texture = context.textures[textureDefs[textureInfoDef.index].source!];
        mtoon.setShadeMultiplyTexture(texture);
        context.setTextureInfo(mtoon.getShadeMultiplyTextureInfo()!, textureInfoDef);
      }
      mtoon.setShadingShiftFactor(mtoonDef.shadingShiftFactor ?? 0);
      if(mtoonDef.shadingShiftTexture) {
        const textureInfoDef = mtoonDef.shadingShiftTexture;
        const texture = context.textures[textureDefs[textureInfoDef.index].source!];
        mtoon.setShadingShiftTexture(texture);
        context.setTextureInfo(mtoon.getShadingShiftTextureInfo()!, textureInfoDef);
      }
      mtoon.setShadingToonyFactor(mtoonDef.shadingToonyFactor ?? 0.9);
      mtoon.setGiEqualizationFactor(mtoonDef.giEqualizationFactor ?? 0.9);
      mtoon.setMatcapFactor(mtoonDef.matcapFactor as vec3 ?? [1, 1, 1]);
      if(mtoonDef.matcapTexture) {
        const textureInfoDef = mtoonDef.matcapTexture;
        const texture = context.textures[textureDefs[textureInfoDef.index].source!];
        mtoon.setMatcapTexture(texture);
        context.setTextureInfo(mtoon.getMatcapTextureInfo()!, textureInfoDef);
      }
      mtoon.setParametricRimColorFactor(mtoonDef.parametricRimColorFactor as vec3 ?? [0, 0, 0]);
      if(mtoonDef.rimMultiplyTexture) {
        const textureInfoDef = mtoonDef.rimMultiplyTexture;
        const texture = context.textures[textureDefs[textureInfoDef.index].source!];
        mtoon.setRimMultiplyTexture(texture);
        context.setTextureInfo(mtoon.getRimMultiplyTextureInfo()!, textureInfoDef);
      }
      mtoon.setRimLightingMixFactor(mtoonDef.rimLightingMixFactor ?? 1.0);
      mtoon.setParametricRimFresnelPowerFactor(mtoonDef.parametricRimFresnelPowerFactor ?? 5.0);
      mtoon.setParametricRimLiftFactor(mtoonDef.parametricRimLiftFactor ?? 0.0);
      mtoon.setOutlineWidthMode(mtoonDef.outlineWidthMode ?? 'none');
      mtoon.setOutlineWidthFactor(mtoonDef.outlineWidthFactor ?? 0.0);
      if(mtoonDef.outlineWidthMultiplyTexture) {
        const textureInfoDef = mtoonDef.outlineWidthMultiplyTexture;
        const texture = context.textures[textureDefs[textureInfoDef.index].source!];
        mtoon.setOutlineWidthMultiplyTexture(texture);
        context.setTextureInfo(mtoon.getOutlineWidthMultiplyTextureInfo()!, textureInfoDef);
      }
      mtoon.setOutlineColorFactor(mtoonDef.outlineColorFactor as vec3 ?? [0, 0, 0]);
      mtoon.setOutlineLightingMixFactor(mtoonDef.outlineLightingMixFactor ?? 1.0);
      if(mtoonDef.uvAnimationMaskTexture) {
        const textureInfoDef = mtoonDef.uvAnimationMaskTexture;
        const texture = context.textures[textureDefs[textureInfoDef.index].source!];
        mtoon.setUvAnimationMaskTexture(texture);
        context.setTextureInfo(mtoon.getUvAnimationMaskTextureInfo()!, textureInfoDef);
      }
      mtoon.setUvAnimationScrollXSpeedFactor(mtoonDef.uvAnimationScrollXSpeedFactor ?? 0.0);
      mtoon.setUvAnimationScrollYSpeedFactor(mtoonDef.uvAnimationScrollYSpeedFactor ?? 0.0);
      mtoon.setUvAnimationRotationSpeedFactor(mtoonDef.uvAnimationRotationSpeedFactor ?? 0.0);

      context.materials[materialIndex].setExtension(NAME, mtoon);
    });

    return this;
  }

  /** @hidden */
  public write(context: WriterContext): this {
    const jsonDoc = context.jsonDoc;

    this.document
      .getRoot()
      .listMaterials()
      .forEach((material) => {
        const mtoon = material.getExtension<MToon>(NAME);
        if(mtoon) {
          const materialIndex = context.materialIndexMap.get(material)!;
          const materialDef = jsonDoc.json.materials![materialIndex];
          materialDef.extensions = materialDef.extensions || {};

          const mtoonDef: VRMCMaterialsMToonDef = {
            specVersion: mtoon.getSpecVersion(),
            transparentWithZWrite: mtoon.getTransparentWithZWrite(),
            renderQueueOffsetNumber: mtoon.getRenderQueueOffsetNumber(),
            shadeColorFactor: mtoon.getShadeColorFactor(),
            shadingShiftFactor: mtoon.getShadingShiftFactor(),
            shadingToonyFactor: mtoon.getShadingToonyFactor(),
            giEqualizationFactor: mtoon.getGiEqualizationFactor(),
            //matcapFactor: mtoon.getMatcapFactor(), // See below
            parametricRimColorFactor: mtoon.getParametricRimColorFactor(),
            rimLightingMixFactor: mtoon.getRimLightingMixFactor(),
            parametricRimFresnelPowerFactor: mtoon.getParametricRimFresnelPowerFactor(),
            parametricRimLiftFactor: mtoon.getParametricRimLiftFactor(),
            outlineWidthMode: mtoon.getOutlineWidthMode(),
            outlineWidthFactor: mtoon.getOutlineWidthFactor(),
            outlineColorFactor: mtoon.getOutlineColorFactor(),
            outlineLightingMixFactor: mtoon.getOutlineLightingMixFactor(),
            uvAnimationScrollXSpeedFactor: mtoon.getUvAnimationScrollXSpeedFactor(),
            uvAnimationScrollYSpeedFactor: mtoon.getUvAnimationScrollYSpeedFactor(),
            uvAnimationRotationSpeedFactor: mtoon.getUvAnimationRotationSpeedFactor(),
          } satisfies VRMCMaterialsMToonDef;

          if(mtoon.getShadeMultiplyTexture()) {
            const texture = mtoon.getShadeMultiplyTexture()!;
            const textureInfo = mtoon.getShadeMultiplyTextureInfo()!;
            mtoonDef.shadeMultiplyTexture = context.createTextureInfoDef(texture, textureInfo);
          }

          if(mtoon.getShadingShiftTexture()) {
            const texture = mtoon.getShadingShiftTexture()!;
            const textureInfo = mtoon.getShadingShiftTextureInfo()!;
            mtoonDef.shadingShiftTexture = context.createTextureInfoDef(texture, textureInfo);
          }

          if(mtoon.getMatcapTexture()) {
            const texture = mtoon.getMatcapTexture()!;
            const textureInfo = mtoon.getMatcapTextureInfo()!;
            mtoonDef.matcapTexture = context.createTextureInfoDef(texture, textureInfo);
            // UniVRM defaults to MatcapFactor [0, 0, 0].
            // This shouldn't be a problem, weren't it for the fact that they don't sample the undefined matcap
            // texture as all black.
            // See: https://github.com/vrm-c/UniVRM/issues/2505
            mtoonDef.matcapFactor = mtoon.getMatcapFactor();
          }

          if(mtoon.getRimMultiplyTexture()) {
            const texture = mtoon.getRimMultiplyTexture()!;
            const textureInfo = mtoon.getRimMultiplyTextureInfo()!;
            mtoonDef.rimMultiplyTexture = context.createTextureInfoDef(texture, textureInfo);
          }

          if(mtoon.getOutlineWidthMultiplyTexture()) {
            const texture = mtoon.getOutlineWidthMultiplyTexture()!;
            const textureInfo = mtoon.getOutlineWidthMultiplyTextureInfo()!;
            mtoonDef.outlineWidthMultiplyTexture = context.createTextureInfoDef(texture, textureInfo);
          }

          if(mtoon.getUvAnimationMaskTexture()) {
            const texture = mtoon.getUvAnimationMaskTexture()!;
            const textureInfo = mtoon.getUvAnimationMaskTextureInfo()!;
            mtoonDef.uvAnimationMaskTexture = context.createTextureInfoDef(texture, textureInfo);
          }

          materialDef.extensions[NAME] = mtoonDef;
        }
      });

    return this;
  }
}