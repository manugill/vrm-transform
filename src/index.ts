import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import * as fs from 'fs';
import { VRMCVrm } from './vrmc-vrm/vrmc-vrm';

// Configure I/O.
const io = new NodeIO()
    .registerExtensions([...ALL_EXTENSIONS, VRMCVrm]);

// Read from URL.
const document = await io.read('examples/avatar.vrm');

// Write to byte array (Uint8Array).
const glb = await io.writeBinary(document);

fs.writeFileSync('examples/out.vrm', glb);