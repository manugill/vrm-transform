import { ExtensionProperty, type IProperty, type Nullable, type Node, type vec3 } from '@gltf-transform/core';
import { VRMC_SPRINGBONE } from '../constants.js';

interface ICollider extends IProperty {
    node: Node;
    // shape
    offset: vec3;
    radius: number;
    tail: vec3|null;
}

export class Collider extends ExtensionProperty<ICollider> {
	public static EXTENSION_NAME = VRMC_SPRINGBONE;
	public declare extensionName: typeof VRMC_SPRINGBONE;
	public declare propertyType: 'SpringboneCollider';
	public declare parentTypes: ['VrmSpringbones'];

	protected init(): void {
		this.extensionName = VRMC_SPRINGBONE;
		this.propertyType = 'SpringboneCollider';
		this.parentTypes = ['VrmSpringbones'];
	}

	protected getDefaults(): Nullable<ICollider> {
		return Object.assign(super.getDefaults() as IProperty, {
            node: null,
            offset: [0, 0, 0] as vec3,
            radius: 0,
            tail: null,
		});
	}

    public getNode(): Node|null {
        return this.getRef('node');
    }

    public setNode(node: Node|null): this {
        return this.setRef('node', node);
    }

    public getOffset(): vec3 {
        return this.get('offset');
    }

    public setOffset(offset: vec3): this {
        return this.set('offset', offset);
    }

    public getRadius(): number {
        return this.get('radius');
    }

    public setRadius(radius: number): this {
        return this.set('radius', radius);
    }

    public getTail(): vec3|null {
        return this.get('tail');
    }

    public setTail(tail: vec3|null): this {
        return this.set('tail', tail);
    }

}