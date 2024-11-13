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
import { AnimationChannel, ExtensionProperty, Material, Primitive, PrimitiveTarget, Property, Root, Texture, TextureInfo, type Document, type Transform } from '@gltf-transform/core';
import { createTransform, listTextureInfoByMaterial } from '@gltf-transform/functions';

const NAME = 'pruneVrmVertexAttributes';

/**
 * The built-in `prune` function incorrectly determines the relevant semantics for attributes.
 * This method provides an alternative that correctly identifies which vertex attributes to keep
 * and which to prune in the case of VRM files.
 */
export function pruneVrmVertexAttributes(): Transform {
  return createTransform(NAME, async (document: Document): Promise<void> => {
    //const logger = document.getLogger();
    const root = document.getRoot();

    // Prune unused vertex attributes.
    const materialPrims = new Map<Material, Set<Primitive>>();
    for(const mesh of root.listMeshes()) {
      for(const prim of mesh.listPrimitives()) {
        const material = prim.getMaterial();
        if(!material) continue;

        const required = listRequiredSemantics(document, prim, material);
        const unused = listUnusedSemantics(prim, required);
        pruneAttributes(prim, unused);
        prim.listTargets().forEach((target) => pruneAttributes(target, unused));
        if(materialPrims.has(material)) {
          materialPrims.get(material)!.add(prim);
        } else {
          materialPrims.set(material, new Set([prim]));
        }
      }
    }
    for(const [material, prims] of materialPrims) {
      shiftTexCoords(material, Array.from(prims));
    }

    // Tree-shake accessors
    root.listAccessors().forEach((accessor) => treeShake(accessor, true));
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

function pruneAttributes(prim: Primitive | PrimitiveTarget, unused: string[]) {
  for(const semantic of unused) {
    prim.setAttribute(semantic, null);
  }
}

/**
 * Lists vertex attribute semantics that are unused when rendering a given primitive.
 */
function listUnusedSemantics(prim: Primitive | PrimitiveTarget, required: Set<string>): string[] {
  const unused = [];
  for(const semantic of prim.listSemantics()) {
    if(semantic === 'NORMAL' && !required.has(semantic)) {
      unused.push(semantic);
    } else if(semantic === 'TANGENT' && !required.has(semantic)) {
      unused.push(semantic);
    } else if(semantic.startsWith('TEXCOORD_') && !required.has(semantic)) {
      unused.push(semantic);
    } else if(semantic.startsWith('COLOR_') && semantic !== 'COLOR_0') {
      unused.push(semantic);
    }
  }
  return unused;
}

/**
 * Lists vertex attribute semantics required by a material. Does not include
 * attributes that would be used unconditionally, like POSITION or NORMAL.
 */
function listRequiredSemantics(
  document: Document,
  prim: Primitive,
  material: Material | ExtensionProperty,
  semantics = new Set<string>(),
): Set<string> {
  const graph = document.getGraph();

  const edges = graph.listChildEdges(material);
  const textureNames = new Set<string>();

  for(const edge of edges) {
    if(edge.getChild() instanceof Texture) {
      textureNames.add(edge.getName());
    }
  }

  for(const edge of edges) {
    const name = edge.getName();
    const child = edge.getChild();

    if(child instanceof TextureInfo) {
      if(textureNames.has(name.replace(/Info$/, ''))) {
        semantics.add(`TEXCOORD_${child.getTexCoord()}`);
      }
    }

    // NOTE: Never include TANGENT as the VRM spec indicates that it's expected
    //       that tangents are calculated using the MikkTSpace algorithm upon import.

    if(child instanceof ExtensionProperty) {
      listRequiredSemantics(document, prim, child, semantics);
    }

    // TODO(#748): Does KHR_materials_anisotropy imply required vertex attributes?
  }

  // NOTE: built-in prune omits NORMAL attributes in case of KHR_materials_unlit,
  //       but for MToon its needed and unlit only serves as a fallback.
  if(prim.getMode() !== Primitive.Mode.POINTS) {
    semantics.add('NORMAL');
  }

  return semantics;
}

/**
 * Shifts texCoord indices on the given material and primitives assigned to
 * that material, such that indices start at zero and ascend without gaps.
 * Prior to calling this function, the implementation must ensure that:
 * - All TEXCOORD_n attributes on these prims are used by the material.
 * - Material does not require any unavailable TEXCOORD_n attributes.
 *
 * TEXCOORD_n attributes on morph targets are shifted alongside the parent
 * prim, but gaps may remain in their semantic lists.
 */
function shiftTexCoords(material: Material, prims: Primitive[]) {
  // Create map from srcTexCoord → dstTexCoord.
  const textureInfoList = listTextureInfoByMaterial(material);
  const texCoordSet = new Set(textureInfoList.map((info: TextureInfo) => info.getTexCoord()));
  const texCoordList = Array.from(texCoordSet).sort();
  const texCoordMap = new Map(texCoordList.map((texCoord, index) => [texCoord, index]));
  const semanticMap = new Map(texCoordList.map((texCoord, index) => [`TEXCOORD_${texCoord}`, `TEXCOORD_${index}`]));

  // Update material.
  for(const textureInfo of textureInfoList) {
    const texCoord = textureInfo.getTexCoord();
    textureInfo.setTexCoord(texCoordMap.get(texCoord)!);
  }

  // Update prims.
  for(const prim of prims) {
    const semantics = prim
      .listSemantics()
      .filter((semantic) => semantic.startsWith('TEXCOORD_'))
      .sort();
    updatePrim(prim, semantics);
    prim.listTargets().forEach((target) => updatePrim(target, semantics));
  }

  function updatePrim(prim: Primitive | PrimitiveTarget, srcSemantics: string[]) {
    for(const srcSemantic of srcSemantics) {
      const uv = prim.getAttribute(srcSemantic);
      if(!uv) continue;

      const dstSemantic = semanticMap.get(srcSemantic)!;
      if(dstSemantic === srcSemantic) continue;

      prim.setAttribute(dstSemantic, uv);
      prim.setAttribute(srcSemantic, null);
    }
  }
}