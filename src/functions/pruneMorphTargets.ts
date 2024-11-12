import { Mesh, type Document, type Transform } from '@gltf-transform/core';
import { createTransform } from '@gltf-transform/functions';
import { VRMC_VRM } from '../constants';
import type { Vrm } from '../vrmc-vrm';
import type { ExpressionMorphTargetBind } from '../vrmc-vrm/expression-morph-target-bind';

const NAME = 'pruneMorphTargets';

/**
 * VRM models may contain morph targets that are driven by expressions.
 * This transform checks which morph targets are used by expressions and removes any unused morph targets.
 */
export function pruneMorphTargets(): Transform {
  return createTransform(NAME, async (document: Document): Promise<void> => {
    const logger = document.getLogger();
    const root = document.getRoot();

    const vrm = root.getExtension<Vrm>(VRMC_VRM);
    if(!vrm) {
      logger.warn('pruneMorphTargets requires VRMC_vrm extension to determine which morph targets are in use');
      return;
    }

    const meshToIndexToBind: Map<Mesh, Record<number, ExpressionMorphTargetBind[]>> = new Map();
    const expressions = vrm.listExpressions();
    for(const expression of expressions) {
      const morphTargetBinds = expression.listMorphTargetBinds();
      morphTargetBinds.forEach(bind => {
        const mesh = bind.getNode()?.getMesh();
        if(!mesh) {
          return;
        }

        if(!meshToIndexToBind.has(mesh)) {
          meshToIndexToBind.set(mesh, {});
        }
        const indexToBind = meshToIndexToBind.get(mesh)!;
        const index = bind.getIndex();
        if(!indexToBind[index]) {
          indexToBind[index] = [];
        }
        indexToBind[index].push(bind);
      });
    }

    // Iterate over the meshes
    root.listMeshes().forEach(mesh => {
      const primitives = mesh.listPrimitives();
      const targetCount = primitives[0]?.listTargets()?.length;
      if(targetCount === 0) {
        return;
      }

      const indexToBind = meshToIndexToBind.get(mesh) ?? {};

      // Compact morph targets
      primitives.forEach(primitive => {
        const targets = primitive.listTargets();
        for(let i = 0; i < targetCount; i++) {
          if(!(i in indexToBind)) {
            primitive.removeTarget(targets[i]);
          }
        }
      });

      // Compact target names, if available
      const targetNames = mesh.getExtras()['targetNames'] as string[]|undefined;
      if(targetNames) {
        const newTargetNames: string[] = [];
        for(let i = 0; i < targetCount; i++) {
          if(i in indexToBind) {
            newTargetNames.push(targetNames[i]);
          }
        }
        mesh.getExtras()['targetNames'] = newTargetNames;
      }

      // Update bindings
      for(let i = 0, newIndex = 0; i < targetCount; i++) {
        if(i in indexToBind) {
          indexToBind[i].forEach(bind => bind.setIndex(newIndex));
          newIndex++;
        }
      }
    });
  });
}
