import { ExtensionProperty, type IProperty, type Nullable, RefList } from '@gltf-transform/core';
import { VRMC_SPRINGBONE } from '../constants.js';
import type { Collider } from './collider.js';

interface IColliderGroup extends IProperty {
  colliders: RefList<Collider>;
}

export class ColliderGroup extends ExtensionProperty<IColliderGroup> {
  public static EXTENSION_NAME = VRMC_SPRINGBONE;
  public declare extensionName: typeof VRMC_SPRINGBONE;
  public declare propertyType: 'SpringboneColliderGroup';
  public declare parentTypes: ['VrmSpringbones'];

  protected init(): void {
    this.extensionName = VRMC_SPRINGBONE;
    this.propertyType = 'SpringboneColliderGroup';
    this.parentTypes = ['VrmSpringbones'];
  }

  protected getDefaults(): Nullable<IColliderGroup> {
    return Object.assign(super.getDefaults() as IProperty, {
      colliders: new RefList<Collider>(),
    });
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
}