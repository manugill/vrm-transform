import { Extension, ReaderContext, WriterContext } from '@gltf-transform/core';
import { VRMC_NODE_CONSTRAINT } from '../constants.js';
import { NodeConstraint } from './node-constraint.js';
import { type AimConstraint, type RollConstraint, type RotationConstraint, type VRMCNodeConstraint as VRMCNodeConstraintDef } from '@pixiv/types-vrmc-node-constraint-1.0';

const NAME = VRMC_NODE_CONSTRAINT;

export class VRMCNodeConstraint extends Extension {
    public readonly extensionName = NAME;
	public static readonly EXTENSION_NAME = NAME;

	public createNodeConstraint(): NodeConstraint {
		return new NodeConstraint(this.document.getGraph());
	}

    /** @hidden */
	public read(context: ReaderContext): this {
		const jsonDoc = context.jsonDoc;

		jsonDoc.json.nodes!.forEach((nodeDef, nodeIndex) => {
			if (!nodeDef.extensions || !nodeDef.extensions[NAME]) return;
			const nodeConstraintDef = nodeDef.extensions[NAME] as VRMCNodeConstraintDef;
			const nodeConstraint = this.createNodeConstraint();
			nodeConstraint.setSpecVersion(nodeConstraintDef.specVersion);

			const instanceDef = (
				nodeConstraintDef.constraint.aim ??
				nodeConstraintDef.constraint.roll ??
				nodeConstraintDef.constraint.rotation
			) as AimConstraint&RollConstraint&RotationConstraint;
			nodeConstraint.setSource(context.nodes[instanceDef.source]);
			nodeConstraint.setWeight(instanceDef.weight ?? 1.0);
			nodeConstraint.setAimAxis(instanceDef.aimAxis ?? null);
			nodeConstraint.setRollAxis(instanceDef.rollAxis ?? null);

			context.nodes[nodeIndex].setExtension(NAME, nodeConstraint);
		});

		return this;
	}

	/** @hidden */
	public write(context: WriterContext): this {
		const jsonDoc = context.jsonDoc;

		this.document
			.getRoot()
			.listNodes()
			.forEach((node) => {
				const nodeConstraint = node.getExtension<NodeConstraint>(NAME);
				if(nodeConstraint) {
					const nodeIndex = context.nodeIndexMap.get(node)!;
					const nodeDef = jsonDoc.json.nodes![nodeIndex];
					nodeDef.extensions = nodeDef.extensions || {};

					const baseProperties: {source: number, weight: number} = {
						source: context.nodeIndexMap.get(nodeConstraint.getSource()!)!,
						weight: nodeConstraint.getWeight()
					}
					const instanceDef: VRMCNodeConstraintDef['constraint'] = {};
					if(nodeConstraint.getRollAxis()) {
						instanceDef.roll = {...baseProperties, rollAxis: nodeConstraint.getRollAxis()! };
					} else if(nodeConstraint.getAimAxis()) {
						instanceDef.aim = {...baseProperties, aimAxis: nodeConstraint.getAimAxis()! };
					} else { // Rotation constraint
						instanceDef.rotation = {...baseProperties};
					}
					nodeDef.extensions[NAME] = {
						specVersion: nodeConstraint.getSpecVersion(),
						constraint: instanceDef
					} satisfies VRMCNodeConstraintDef;
				}
			});

		return this;
	}
}