import { ExtensionProperty, ReaderContext, RefSet, WriterContext, type IProperty, type Nullable } from '@gltf-transform/core';
import { VRMC_VRM } from '../constants';
import type { VRMCVRM } from '@pixiv/types-vrmc-vrm-1.0';
import { MeshAnnotation } from './mesh-annotation.js';

interface IFirstPerson extends IProperty {
  meshAnnotations: RefSet<MeshAnnotation>;
}

export class FirstPerson extends ExtensionProperty<IFirstPerson> {
  public static EXTENSION_NAME = VRMC_VRM;
  public declare extensionName: typeof VRMC_VRM;
  public declare propertyType: 'VrmFirstPerson';
  public declare parentTypes: ['Vrm'];

  protected init(): void {
    this.extensionName = VRMC_VRM;
    this.propertyType = 'VrmFirstPerson';
    this.parentTypes = ['Vrm'];
  }

  protected getDefaults(): Nullable<IFirstPerson> {
    return Object.assign(super.getDefaults() as IProperty, {
      meshAnnotations: new RefSet<MeshAnnotation>()
    });
  }

  public listMeshAnnotations(): MeshAnnotation[] {
    return this.listRefs('meshAnnotations');
  }

  public addMeshAnnotation(meshAnnotation: MeshAnnotation): this {
    return this.addRef('meshAnnotations', meshAnnotation);
  }

  public removeMeshAnnotation(meshAnnotation: MeshAnnotation): this {
    return this.removeRef('meshAnnotations', meshAnnotation);
  }

  public read(firstPersonDef: Exclude<VRMCVRM['firstPerson'], undefined>, context: ReaderContext): this {
    if(firstPersonDef.meshAnnotations) {
      for(const meshAnnotationDef of firstPersonDef.meshAnnotations) {
        const meshAnnotation = new MeshAnnotation(this.getGraph());
        meshAnnotation.setNode(context.nodes[meshAnnotationDef.node] ?? null);
        meshAnnotation.setType(meshAnnotationDef.type ?? 'auto');
        this.addMeshAnnotation(meshAnnotation);
      }
    }
    return this;
  }

  public write(context: WriterContext): VRMCVRM['firstPerson'] {
    const firstPersonDef: VRMCVRM['firstPerson'] = {};

    const meshAnnotations = this.listMeshAnnotations();
    if(meshAnnotations.length > 0) {
      firstPersonDef.meshAnnotations = meshAnnotations.map(meshAnnotation => ({
        node: context.nodeIndexMap.get(meshAnnotation.getNode()!)!,
        type: meshAnnotation.getType(),
      }));
    }

    return firstPersonDef;
  }
}
