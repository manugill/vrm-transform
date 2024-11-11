import { ExtensionProperty, Node, ReaderContext, RefMap, WriterContext, type IProperty, type Nullable } from '@gltf-transform/core';
import { VRMC_VRM } from '../constants';
import type { HumanoidHumanBone, HumanoidHumanBoneName, VRMCVRM } from '@pixiv/types-vrmc-vrm-1.0';

interface IHumanoid extends IProperty {
  // In practice the json structure is more layered:
  //   VMRC_vrm.humanoid.humanBones[BONE_NAME].node
  // For simplicity we treat it as a refmap
  humanBones: RefMap<Node>;
}

export class Humanoid extends ExtensionProperty<IHumanoid> {
  public static EXTENSION_NAME = VRMC_VRM;
  public declare extensionName: typeof VRMC_VRM;
  public declare propertyType: 'VrmHumanoid';
  public declare parentTypes: ['Vrm'];

  protected init(): void {
    this.extensionName = VRMC_VRM;
    this.propertyType = 'VrmHumanoid';
    this.parentTypes = ['Vrm'];
  }

  protected getDefaults(): Nullable<IHumanoid> {
    return Object.assign(super.getDefaults() as IProperty, {
      humanBones: new RefMap<Node>(),
    });
  }

  public getBone(boneName: HumanoidHumanBoneName): Node|null {
    return this.getRefMap('humanBones', boneName);
  }

  public setBone(boneName: HumanoidHumanBoneName, node: Node | null): this {
    return this.setRefMap('humanBones', boneName, node);
  }

  public read(metaDef: VRMCVRM['humanoid'], context: ReaderContext): this {
    for(const boneName in metaDef.humanBones) {
      const node = context.nodes[metaDef.humanBones[boneName as HumanoidHumanBoneName]!.node];
      this.setRefMap('humanBones', boneName, node);
    }
    return this;
  }

  public write(context: WriterContext): VRMCVRM['humanoid'] {
    const humanBones: Record<string, HumanoidHumanBone> = {};
    for(const boneName of this.listRefMapKeys('humanBones')) {
      const ref = this.getRefMap('humanBones', boneName);
      if(ref && context.nodeIndexMap.get(ref)) {
        humanBones[boneName] = { node: context.nodeIndexMap.get(ref)! };
      }
    }
    return { humanBones } satisfies VRMCVRM['humanoid'];
  }
}