import { ExtensionProperty, Node, type IProperty, type Nullable } from '@gltf-transform/core';
import { VRMC_VRM } from '../constants';

interface IMeshAnnotation extends IProperty {
  node: Node;
  type: FirstPersonType;
}

type FirstPersonType = 'auto' | 'both' | 'thirdPersonOnly' | 'firstPersonOnly';

export class MeshAnnotation extends ExtensionProperty<IMeshAnnotation> {
  public static EXTENSION_NAME = VRMC_VRM;
  public declare extensionName: typeof VRMC_VRM;
  public declare propertyType: 'VrmMeshAnnotation';
  public declare parentTypes: ['VrmFirstPerson'];

  protected init(): void {
    this.extensionName = VRMC_VRM;
    this.propertyType = 'VrmMeshAnnotation';
    this.parentTypes = ['VrmFirstPerson'];
  }

  protected getDefaults(): Nullable<IMeshAnnotation> {
    return Object.assign(super.getDefaults() as IProperty, {
      node: null,
      type: 'auto' as FirstPersonType
    });
  }

  public getNode(): Node|null {
    return this.getRef('node');
  }

  public setNode(node: Node|null) {
    return this.setRef('node', node);
  }

  public getType(): FirstPersonType {
    return this.get('type');
  }

  public setType(type: FirstPersonType): this {
    return this.set('type', type);
  }
}
