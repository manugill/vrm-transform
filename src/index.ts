import { NodeIO, Document } from '@gltf-transform/core';
import { MeshoptSimplifier } from 'meshoptimizer';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import * as fs from 'fs';
import { VRMCVrm } from './vrmc-vrm';
import { VRMCNodeConstraint } from './vrmc-node-constraint';
import { VRMCSpringBone } from './vrmc-springbone';
import { dedup, flatten, prune, quantize, simplify, weld } from '@gltf-transform/functions';

function i(strings: TemplateStringsArray, ...parts: any[]) {
    let res = '';
    for(let i = 0; i < parts.length; i++) {
        res += strings[i];
        let padded = '        '+parts[i];
        res += padded.substring(padded.length - 6) + ' ';
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
    console.log();
}

// Configure I/O.
const io = new NodeIO()
    .registerExtensions([...ALL_EXTENSIONS, VRMCVrm, VRMCNodeConstraint, VRMCSpringBone]);

// Read from URL.
const document = await io.read('examples/avatar.vrm');
documentStats(document);

await document.transform(
    // Remove unused nodes, textures, or other data.
    prune(),
    weld(),
    simplify({ simplifier: MeshoptSimplifier, ratio: 0.75, error: 0.001 }),
    quantize({
        quantizePosition: 14,
        quantizeNormal: 10,
    }),
    dedup(),
    flatten(),
);
documentStats(document);

// Write to byte array (Uint8Array).
const glb = await io.writeBinary(document);

fs.writeFileSync('examples/out.vrm', glb);