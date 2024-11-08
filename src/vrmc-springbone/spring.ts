import { ExtensionProperty, type IProperty, type Nullable, type Node, RefList } from '@gltf-transform/core';
import { VRMC_SPRINGBONE } from '../constants.js';
import type { Joint } from './joint.js';
import type { ColliderGroup } from './collider-group.js';

interface ISpring extends IProperty {
	joints: RefList<Joint>;
    colliderGroups: RefList<ColliderGroup>;
	center: Node;
}

export class Spring extends ExtensionProperty<ISpring> {
	public static EXTENSION_NAME = VRMC_SPRINGBONE;
	public declare extensionName: typeof VRMC_SPRINGBONE;
	public declare propertyType: 'SpringboneSpring';
	public declare parentTypes: ['VrmSpringbones'];

	protected init(): void {
		this.extensionName = VRMC_SPRINGBONE;
		this.propertyType = 'SpringboneSpring';
		this.parentTypes = ['VrmSpringbones'];
	}

	protected getDefaults(): Nullable<ISpring> {
		return Object.assign(super.getDefaults() as IProperty, {
			joints: new RefList<Joint>(),
            colliderGroups: new RefList<ColliderGroup>(),
			center: null,
		});
	}

	public listJoints(): Joint[] {
		return this.listRefs('joints');
	}

	public addJoint(joint: Joint): this {
		return this.addRef('joints', joint);
	}

	public removeJoint(joint: Joint): this {
		return this.removeRef('joints', joint);
	}

	public listColliderGroups(): ColliderGroup[] {
		return this.listRefs('colliderGroups');
	}

	public addColliderGroup(colliderGroup: ColliderGroup): this {
		return this.addRef('colliderGroups', colliderGroup);
	}

	public removeColliderGroup(colliderGroup: ColliderGroup): this {
		return this.removeRef('colliderGroups', colliderGroup);
	}

	public getCenter(): Node|null {
		return this.getRef('center');
	}

	public setCenter(node: Node|null): this {
		return this.setRef('center', node);
	}

}