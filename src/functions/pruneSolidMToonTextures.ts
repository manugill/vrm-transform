/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2024 Don McCurdy
 * Copyright (c) 2024 Noeri Huisman
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */
// This file is based on https://github.com/donmccurdy/glTF-Transform/blob/0bb00208e1eaa9d738d125bbc515f1cd9f20fbc6/packages/functions/src/prune.ts
import { AnimationChannel, ColorUtils, ExtensionProperty, Material, Property, Root, Texture, type Document, type Transform, type vec3, type vec4 } from '@gltf-transform/core';
import { createTransform, getTextureColorSpace, listTextureSlots } from '@gltf-transform/functions';
import type { NdArray } from 'ndarray';
import { getPixels } from 'ndarray-pixels';
import { vec3 as glVec3, vec4 as glVec4 } from 'gl-matrix';
import { MToon } from '../vrmc-materials-mtoon/mtoon';
const { mul: mulVec3 } = glVec3
const { add, create, len, scale, sub } = glVec4;

const NAME = 'pruneSolidMToonTextures';

const EPS = 3 / 255;

/**
 * In some cases the textures used in MToon materials end up being a single solid colour.
 * These can often times be removed or simplified. The built-in prune transform does this
 * for many textures already, but lacks the VRM specific knowledge.
 */
export function pruneSolidMToonTextures(): Transform {
  return createTransform(NAME, async (document: Document): Promise<void> => {
    //const logger = document.getLogger();
    const root = document.getRoot();

    root.listTextures().forEach((texture) => treeShake(texture, true));
    await pruneSolidTextures(document);
  });
}

/** Disposes of the given property if it is unused. */
function treeShake(prop: Property, keepExtras: boolean): void {
  // Consider a property unused if it has no references from another property, excluding
  // types Root and AnimationChannel.
  const parents = prop.listParents().filter((p) => !(p instanceof Root || p instanceof AnimationChannel));
  const needsExtras = keepExtras && !isEmptyObject(prop.getExtras());
  if(!parents.length && !needsExtras) {
    prop.dispose();
  }
}

function isEmptyObject(object: Record<string, unknown>): boolean {
  for(const key in object) return false;
  return true;
}

async function pruneSolidTextures(document: Document): Promise<void> {
  const root = document.getRoot();
  const graph = document.getGraph();
  const logger = document.getLogger();
  const textures = root.listTextures();

  const pending = textures.map(async (texture) => {
    const factor = await getTextureFactor(texture);
    // FIXME: It's possible that one texture is used to combine shadingShiftTexture (R), outlineWidthMultiplyTexture (G), uvAnimationMaskTexture (B)
    //        Ideally a solid colour is detected _per_ channel for these textures.
    if(!factor) return;

    if(getTextureColorSpace(texture) === 'srgb') {
      ColorUtils.convertSRGBToLinear(factor, factor);
    }

    const name = texture.getName() || texture.getURI();
    const size = texture.getSize()?.join('x');
    const slots = listTextureSlots(texture);

    for(const edge of graph.listParentEdges(texture)) {
      const parent = edge.getParent();
      if(parent !== root && applyMaterialFactor(parent as Material, factor, edge.getName())) {
        edge.dispose();
      }
    }

    if(texture.listParents().length === 1) {
      texture.dispose();
      logger.info(`${NAME}: Removed solid-color texture "${name}" (${size}px ${slots.join(', ')})`);
    }
  });

  await Promise.all(pending);
}

function applyMaterialFactor(
  material: Material | ExtensionProperty,
  factor: vec4,
  slot: string,
): boolean {
  if(material instanceof MToon) {
    switch (slot) {
      case 'shadeMultiplyTexture':
        // Multiply factor into shade color.
        material.setShadeColorFactor(mulVec3([0, 0, 0], factor.slice(0, 3) as vec3, material.getShadeColorFactor()) as vec3);
        return true;
      case 'matcapTexture':
        // No matcap texture is treated as black on all RGB channels.
        // So only possible to drop this texture if it is a solid black
        // FIXME: Investigate resizing as a solid colour does not have to be larger than 1x1
        return len(sub(create(), factor, [0, 0, 0, 1])) <= EPS;
      case 'shadingShiftTexture':
        // Only care about R component
        material.setShadingShiftFactor(material.getShadingShiftFactor() + factor[0]); // FIXME: multiply with shading shift texture scale
        return true;
      case 'outlineWidthMultiplyTexture':
        // Only care about G component
        material.setOutlineWidthFactor(material.getOutlineWidthFactor() * factor[1]);
        return true;
      case 'uvAnimationMaskTexture':
        // Only care about B component
        material.setUvAnimationRotationSpeedFactor(material.getUvAnimationRotationSpeedFactor() * factor[2]);
        material.setUvAnimationScrollXSpeedFactor(material.getUvAnimationScrollXSpeedFactor() * factor[2]);
        material.setUvAnimationScrollYSpeedFactor(material.getUvAnimationScrollYSpeedFactor() * factor[2]);
        return true;
    }
  }

  return false;
}

async function getTextureFactor(texture: Texture): Promise<vec4 | null> {
  const pixels = await maybeGetPixels(texture);
  if(!pixels) return null;

  const min: vec4 = [Infinity, Infinity, Infinity, Infinity];
  const max: vec4 = [-Infinity, -Infinity, -Infinity, -Infinity];
  const target: vec4 = [0, 0, 0, 0];

  const [width, height] = pixels.shape;

  for(let i = 0; i < width; i++) {
    for(let j = 0; j < height; j++) {
      for(let k = 0; k < 4; k++) {
        min[k] = Math.min(min[k], pixels.get(i, j, k));
        max[k] = Math.max(max[k], pixels.get(i, j, k));
      }
    }

    if(len(sub(target, max, min)) / 255 > EPS) {
      return null;
    }
  }

  return scale(target, add(target, max, min), 0.5 / 255) as vec4;
}

async function maybeGetPixels(texture: Texture): Promise<NdArray<Uint8Array> | null> {
  try {
    return await getPixels(texture.getImage()!, texture.getMimeType());
  } catch {
    return null;
  }
}

