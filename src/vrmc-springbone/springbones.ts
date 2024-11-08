import { ExtensionProperty, RefList, type IProperty, type Nullable } from "@gltf-transform/core";
import { VRMC_SPRINGBONE } from "../constants.js";
import type { Collider } from "./collider.js";
import type { ColliderGroup } from "./collider-group.js";
import type { Spring } from "./spring.js";

interface ISpringbones extends IProperty {
	specVersion: SpecVersion;
    colliders: RefList<Collider>;
    colliderGroups: RefList<ColliderGroup>;
    springs: RefList<Spring>;
}

type SpecVersion = '1.0'|'1.0-beta';

export class Springbones extends ExtensionProperty<ISpringbones> {
    public static EXTENSION_NAME = VRMC_SPRINGBONE;
	public declare extensionName: typeof VRMC_SPRINGBONE;
	public declare propertyType: 'VrmSpringbones';
	public declare parentTypes: [];

    protected init(): void {
        this.extensionName = VRMC_SPRINGBONE;
		this.propertyType = 'VrmSpringbones';
		this.parentTypes = [];
    }

    protected getDefaults(): Nullable<ISpringbones> {
		return Object.assign(super.getDefaults() as IProperty, {
			specVersion: '1.0' as SpecVersion,
            colliders: new RefList<Collider>(),
            colliderGroups: new RefList<ColliderGroup>(),
            springs: new RefList<Spring>(),
		});
	}

    public getSpecVersion(): SpecVersion {
        return this.get('specVersion');
    }

    public setSpecVersion(specVersion: SpecVersion): this {
        return this.set('specVersion', specVersion);
    }

    public getColliderAt(index: number): Collider|null {
        return this.listRefs('colliders')[index] ?? null;
    }

    public listColliders(): Collider[] {
        return this.listRefs('colliders');
    }

    public addCollider(collider: Collider): this {
        return this.addRef('colliders', collider);
    }

    public removeCollider(collider: Collider): this {
        return this.removeRef('colliders', collider);
    }

    public getColliderGroupAt(index: number): ColliderGroup|null {
        return this.listRefs('colliderGroups')[index] ?? null;
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

    public listSprings(): Spring[] {
        return this.listRefs('springs');
    }

    public addSpring(spring: Spring): this {
        return this.addRef('springs', spring);
    }

    public removeSpring(spring: Spring): this {
        return this.removeRef('springs', spring);
    }

}