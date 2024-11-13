import { NodeIO, Document, VertexLayout } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import * as fs from 'fs';
import { VRMCVrm } from './vrmc-vrm';
import { VRMCNodeConstraint } from './vrmc-node-constraint';
import { VRMCSpringBone } from './vrmc-springbone';
import { prune } from '@gltf-transform/functions';
import { combineSkins, pruneMorphTargets } from './functions';
import { VRMCMaterialsMToon } from './vrmc-materials-mtoon';
import { pruneSpringbones } from './functions/pruneSpringbones';

function i(strings: TemplateStringsArray, ...parts: (string|number)[]) {
  let res = '';
  for(let i = 0; i < parts.length; i++) {
    res += strings[i];
    if(typeof parts[i] === 'number') {
      const padded = '        '+parts[i];
      res += padded.substring(padded.length - 6) + ' ';
    } else {
      res += parts[i];
    }
  }
  return res;
}

function documentStats(document: Document) {
  let totalTriangles = 0;
  let totalVertices = 0;
  let totalMorphTargets = 0;
  console.log();
  console.log('------------------------------------');
  document.getRoot().listMeshes().forEach(m => {
    console.log(m.getName());
    m.listPrimitives().forEach(p => {
      const triangles = p.getIndices()!.getCount()/3;
      const vertices = p.listAttributes()[0].getCount();
      const morphTargets = p.listTargets().length;

      totalTriangles += triangles;
      totalVertices += vertices;
      totalMorphTargets = Math.max(totalMorphTargets, morphTargets);

      console.log(i`\t${triangles}/${vertices}/${morphTargets}`);
    })
  });
  console.log('------------------------------------');
  console.log(i`\t${totalTriangles}/${totalVertices}/${totalMorphTargets}`);
  console.log('------------------------------------');
  // Skeletons/skins
  document.getRoot().listSkins().forEach(s => {
    const joints = s.listJoints().length;
    const parents = s.listParents().length;
    console.log(i`${s.getName()}: ${joints}/${parents}`);
  });
  console.log('------------------------------------');
  console.log();
}

// Configure I/O.
const io = new NodeIO()
  .registerExtensions([...ALL_EXTENSIONS, VRMCVrm, VRMCMaterialsMToon, VRMCNodeConstraint, VRMCSpringBone]);

// Read from URL.
const document = await io.read('examples/avatar_c.vrm');
documentStats(document);

await document.transform(
  combineSkins(),
  pruneSpringbones(),
  pruneMorphTargets(),
  prune({
    // NOTE: The normal attribute is needed for MToon material, but prune assumes it goes unused due to KHR_materials_unlit
    keepAttributes: true
  }),
);
documentStats(document);

// Use SEPARATE vertex layout as this has better compatibility (e.g. UniVRM only supports this >v0.127.2)
io.setVertexLayout(VertexLayout.SEPARATE);

// Write to byte array (Uint8Array).
const glb = await io.writeBinary(document);

fs.writeFileSync('examples/out.vrm', glb);