import { Extension, ReaderContext, WriterContext } from '@gltf-transform/core';
import { VRMC_SPRINGBONE } from '../constants.js';
import { type SpringBoneCollider, type SpringBoneColliderCapsule, type SpringBoneColliderGroup, type SpringBoneColliderSphere, type SpringBoneJoint, type SpringBoneSpring, type VRMCSpringBone as VRMCSpringBoneDef } from '@pixiv/types-vrmc-springbone-1.0';
import { Springbones } from './springbones.js';
import { Collider } from './collider.js';
import { ColliderGroup } from './collider-group.js';
import { Spring } from './spring.js';
import { Joint } from './joint.js';

const NAME = VRMC_SPRINGBONE;

export class VRMCSpringBone extends Extension {
    public readonly extensionName = NAME;
	public static readonly EXTENSION_NAME = NAME;

	public createSpringbones(): Springbones {
		return new Springbones(this.document.getGraph());
	}

	public createCollider(): Collider {
		return new Collider(this.document.getGraph());
	}

	public createColliderGroup(): ColliderGroup {
		return new ColliderGroup(this.document.getGraph());
	}

	public createSpring(): Spring {
		return new Spring(this.document.getGraph());
	}

	public createJoint(): Joint {
		return new Joint(this.document.getGraph());
	}

    /** @hidden */
	public read(context: ReaderContext): this {
		const jsonDoc = context.jsonDoc;

		if (!jsonDoc.json.extensions || !jsonDoc.json.extensions[NAME]) return this;

		const rootDef = jsonDoc.json.extensions[NAME] as VRMCSpringBoneDef;
		const springbones = this.createSpringbones();

		for(const colliderDef of rootDef.colliders ?? []) {
			const collider = this.createCollider();
			collider.setNode(context.nodes[colliderDef.node!]);
			const colliderShapeDef = colliderDef.shape?.capsule ?? colliderDef.shape?.sphere as SpringBoneColliderCapsule&SpringBoneColliderSphere;
			if(colliderShapeDef.offset) collider.setOffset(colliderShapeDef.offset);
			if(colliderShapeDef.radius) collider.setRadius(colliderShapeDef.radius);
			if(colliderShapeDef.tail) collider.setTail(colliderShapeDef.tail);
			springbones.addCollider(collider);
		}

		for(const colliderGroupDef of rootDef.colliderGroups ?? []) {
			const colliderGroup = this.createColliderGroup();
			colliderGroup.setName(colliderGroupDef.name ?? '');
			for(const colliderIndex of colliderGroupDef.colliders ?? []) {
				colliderGroup.addCollider(springbones.getColliderAt(colliderIndex)!);
			}
			springbones.addColliderGroup(colliderGroup);
		}

		for(const springDef of rootDef.springs ?? []) {
			const spring = this.createSpring();
			spring.setName(springDef.name ?? '');
			for(const jointDef of springDef.joints) {
				const joint = this.createJoint();
				joint.setNode(context.nodes[jointDef.node]);
				joint.setHitRadius(jointDef.hitRadius ?? 0.0);
				joint.setStiffness(jointDef.stiffness ?? 1.0);
				joint.setGravityPower(jointDef.gravityPower ?? 0.0);
				joint.setGravityDir(jointDef.gravityDir ?? [0, -1, 0]);
				joint.setDragForce(jointDef.dragForce ?? 0.5);
				spring.addJoint(joint);
			}
			for(const colliderGroupIndex of springDef.colliderGroups ?? []) {
				spring.addColliderGroup(springbones.getColliderGroupAt(colliderGroupIndex)!);
			}
			if(springDef.center) {
				spring.setCenter(context.nodes[springDef.center]);
			}
			springbones.addSpring(spring);
		}

		return this;
	}

	/** @hidden */
	public write(context: WriterContext): this {
		const jsonDoc = context.jsonDoc;

		// FIXME: How to handle/detect duplicate Springbones or removal from document?
		const springbones = this.listProperties().find(prop => prop instanceof Springbones);
		if (!springbones) return this;

		const springbonesDef = {
			specVersion: springbones.getSpecVersion()
		} as VRMCSpringBoneDef;

		// Colliders
		const colliders = springbones.listColliders();
		const colliderIndexMap = new Map<Collider, number>();
		if(colliders.length > 0) {
			springbonesDef.colliders = [];
			for(const collider of colliders) {
				colliderIndexMap.set(collider, colliderIndexMap.size);

				const colliderDef = {
					node: context.nodeIndexMap.get(collider.getNode()!),
					shape: {}
				} as SpringBoneCollider;

				const baseShapeProperties = {
					offset: collider.getOffset(),
					radius: collider.getRadius(),
				};
				if(collider.getTail()) {
					colliderDef.shape!.capsule = {
						...baseShapeProperties,
						tail: collider.getTail() ?? [0, 0, 0]
					}
				} else {
					colliderDef.shape!.sphere = {...baseShapeProperties};
				}

				springbonesDef.colliders.push(colliderDef)
			}
		}

		// Collider groups
		const colliderGroups = springbones.listColliderGroups().filter(cg => cg.listColliders().length > 0);
		const colliderGroupIndexMap = new Map<ColliderGroup, number>();
		if(colliderGroups.length > 0) {
			springbonesDef.colliderGroups = [];
			for(const colliderGroup of colliderGroups) {
				colliderGroupIndexMap.set(colliderGroup, colliderGroupIndexMap.size);

				const colliderGroupDef = {} as SpringBoneColliderGroup;
				if(colliderGroup.getName()) colliderGroupDef.name = colliderGroup.getName();
				colliderGroupDef.colliders = colliderGroup.listColliders().map(c => colliderIndexMap.get(c)!)

				springbonesDef.colliderGroups.push(colliderGroupDef);
			}
		}

		// Springs
		const springs = springbones.listSprings().filter(s => s.listJoints().length > 0);
		const springIndexMap = new Map<Spring, number>();
		if(springs.length > 0) {
			springbonesDef.springs = [];
			for(const spring of springs) {
				springIndexMap.set(spring, springIndexMap.size);

				const springDef = {joints: []} as SpringBoneSpring;
				if(spring.getName()) springDef.name = spring.getName();
				for(const joint of spring.listJoints()) {
					const jointDef = {} as SpringBoneJoint;
					jointDef.node = context.nodeIndexMap.get(joint.getNode()!)!;
					jointDef.hitRadius = joint.getHitRadius();
					jointDef.stiffness = joint.getStiffness();
					jointDef.gravityPower = joint.getGravityPower();
					jointDef.gravityDir = joint.getGravityDir();
					jointDef.dragForce = joint.getDragForce();
					springDef.joints.push(jointDef);
				}
				if(spring.listColliderGroups().length > 0) {
					springDef.colliderGroups = spring.listColliderGroups().map(cg => colliderGroupIndexMap.get(cg)!);
				}
				if(spring.getCenter()) {
					springDef.center = context.nodeIndexMap.get(spring.getCenter()!);
				}

				springbonesDef.springs.push(springDef);
			}
		}

		// Only set extension in case there are any spring bones
		if(springs.length == 0) return this;

	   	jsonDoc.json.extensions = jsonDoc.json.extensions || {};
	   	jsonDoc.json.extensions[NAME] = springbonesDef;

		return this;
	}
}