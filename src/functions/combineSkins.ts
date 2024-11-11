import { Accessor, Mesh, Node, Skin, type Document, type Transform } from "@gltf-transform/core";
import { createTransform } from "@gltf-transform/functions";

const NAME = 'combineSkins';

interface ProcessContext {
    newSkin: Skin;
    boneIndexMap: Map<Node, number>;
    inverseBindMatrices: number[];
    processedMeshes: Set<Mesh>;
}

/**
 * Since a VRM avatar is centred around a single humanoid, there is generally only one skeleton.
 * In practice the file might define multiple skins for this skeleton for different meshes. This
 * function combines these skins into a singular one.
 *
 * The main benefit is that at runtime the same bone inverses won't have to be computed multiple
 * times (per skin), but only once per frame.
 */
export function combineSkins(): Transform {
    return createTransform(NAME, async (document: Document): Promise<void> => {
        const logger = document.getLogger();
		const root = document.getRoot();
		const graph = document.getGraph();

        const processedSkeletons: Map<Node, ProcessContext> = new Map();

        for(const skin of root.listSkins()) {
            const skeleton = skin.getSkeleton();
            if(!skeleton) {
                logger.debug('Skipping skin without skeleton');
                continue;
            }

            // Fetch processing context
            if(!processedSkeletons.has(skeleton)) {
                const newSkin = new Skin(graph, skin.getName());
                newSkin.setSkeleton(skeleton);
                const inverseBindMatrices = new Accessor(graph);
                inverseBindMatrices.setType('MAT4');
                inverseBindMatrices.setBuffer(skin.getInverseBindMatrices()!.getBuffer());
                newSkin.setInverseBindMatrices(inverseBindMatrices);
                processedSkeletons.set(skeleton, {newSkin, boneIndexMap: new Map(), inverseBindMatrices: [], processedMeshes: new Set()});
            }
            const ctx = processedSkeletons.get(skeleton)!;
            const srcJoints = skin.listJoints();

            // Find all skinned meshes for this skeleton
            for(const skinnedMesh of skin.listParents().filter(x => x instanceof Node)) {
                const mesh = skinnedMesh.getMesh();
                if(!mesh) {
                    logger.warn('Skin attached to node without mesh!');
                    continue;
                }

                if(ctx.processedMeshes.has(mesh)) {
                    logger.debug('Mesh already processed for skin');
                    continue;
                }
                ctx.processedMeshes.add(mesh)

                for(const primitive of mesh.listPrimitives()) {
                    for(const semantic of primitive.listSemantics()) {
                        if(!semantic.startsWith('JOINTS_')) {
                            continue;
                        }
                        const weightArray = primitive.getAttribute('WEIGHTS_' + semantic.substring('JOINTS_'.length))!.getArray()!;

                        const srcAttribute = primitive.getAttribute(semantic)!;
                        const dstAttribute = srcAttribute.clone();

                        const srcArray = srcAttribute.getArray()!;
                        const dstArray = dstAttribute.getArray()!;
                        for(let i = 0; i < srcArray.length; i++) {
                            const oldIndex = srcArray[i];
                            // In case no weight is associated with this bone, leave it at 0
                            if(weightArray[i] === 0) {
                                dstArray[i] = 0;
                                continue;
                            }

                            // Lookup new index for bone
                            const oldBone = srcJoints[oldIndex]!;
                            if(!ctx.boneIndexMap.has(oldBone)) {
                                ctx.boneIndexMap.set(oldBone, ctx.boneIndexMap.size);
                                ctx.newSkin.addJoint(oldBone);

                                skin.getInverseBindMatrices()!.getElement(oldIndex, mat4);
                                for(let j = 0; j < mat4.length; j++) {
                                    ctx.inverseBindMatrices.push(mat4[j]);
                                }
                            }
                            dstArray[i] = ctx.boneIndexMap.get(oldBone)!;
                        }

                        primitive.setAttribute(semantic, dstAttribute);
                    }
                }

                skinnedMesh.setSkin(ctx.newSkin);
            }

            // Note: The following two lines would allow reducing skins to only the relevant joints
            //       Perhaps make this an option for this Transform.
            //ctx.newSkin.getInverseBindMatrices()!.setArray(new Float32Array(ctx.inverseBindMatrices));
            //processedSkeletons.delete(skeleton);
        }

        // Set the inverse bind matrices
        processedSkeletons.forEach(ctx => {
            ctx.newSkin.getInverseBindMatrices()!.setArray(new Float32Array(ctx.inverseBindMatrices));
        })
    });
}
const mat4 = new Array(16);