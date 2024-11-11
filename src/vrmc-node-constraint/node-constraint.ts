import { ExtensionProperty, type IProperty, type Nullable, PropertyType, type Node } from '@gltf-transform/core';
import { VRMC_NODE_CONSTRAINT } from '../constants.js';

interface INodeConstraint extends IProperty {
  specVersion: SpecVersion;
  source: Node;
  weight: number;
  // Roll constraint
  rollAxis: RollAxis|null;
  // Aim constraint
  aimAxis: AimAxis|null;
}

type SpecVersion = '1.0'|'1.0-beta';
type RollAxis = 'X'|'Y'|'Z';
type AimAxis =  'PositiveX'|'NegativeX'|'PositiveY'|'NegativeY'|'PositiveZ'|'NegativeZ';

export class NodeConstraint extends ExtensionProperty<INodeConstraint> {
  public static EXTENSION_NAME = VRMC_NODE_CONSTRAINT;
  public declare extensionName: typeof VRMC_NODE_CONSTRAINT;
  public declare propertyType: 'NodeConstraint';
  public declare parentTypes: [PropertyType.NODE];

  protected init(): void {
    this.extensionName = VRMC_NODE_CONSTRAINT;
    this.propertyType = 'NodeConstraint';
    this.parentTypes = [PropertyType.NODE];
  }

  protected getDefaults(): Nullable<INodeConstraint> {
    return Object.assign(super.getDefaults() as IProperty, {
      specVersion: '1.0' as SpecVersion,
      source: null,
      weight: 1.0,
      rollAxis: null,
      aimAxis: null,
    });
  }

  public getSpecVersion(): SpecVersion {
    return this.get('specVersion');
  }

  public setSpecVersion(specVersion: SpecVersion): this {
    return this.set('specVersion', specVersion);
  }

  public getSource(): Node|null {
    return this.getRef('source');
  }

  public setSource(source: Node|null): this {
    return this.setRef('source', source);
  }

  public getWeight(): number {
    return this.get('weight');
  }

  public setWeight(weight: number): this {
    return this.set('weight', weight);
  }

  public getRollAxis(): RollAxis|null {
    return this.get('rollAxis');
  }

  public setRollAxis(rollAxis: RollAxis|null): this {
    return this.set('rollAxis', rollAxis);
  }

  public getAimAxis(): AimAxis|null {
    return this.get('aimAxis');
  }

  public setAimAxis(aimAxis: AimAxis|null): this {
    return this.set('aimAxis', aimAxis);
  }
}