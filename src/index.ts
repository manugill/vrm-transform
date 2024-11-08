import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import * as fs from 'fs';
import { VRMCVrm } from './vrmc-vrm';
import { VRMCNodeConstraint } from './vrmc-node-constraint';
import { VRMCSpringBone } from './vrmc-springbone';

// Configure I/O.
const io = new NodeIO()
    .registerExtensions([...ALL_EXTENSIONS, VRMCVrm, VRMCNodeConstraint, VRMCSpringBone]);

// Read from URL.
const document = await io.read('examples/avatar.vrm');

// Write to byte array (Uint8Array).
const glb = await io.writeBinary(document);

fs.writeFileSync('examples/out.vrm', glb);