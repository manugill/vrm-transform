import { ExtensionProperty, type IProperty, type Nullable, type Node, type vec3 } from '@gltf-transform/core';
import { VRMC_SPRINGBONE } from '../constants.js';

interface IJoint extends IProperty {
  node: Node;
  hitRadius: number;
  stiffness: number;
  gravityPower: number;
  gravityDir: vec3;
  dragForce: number;
}

export class Joint extends ExtensionProperty<IJoint> {
  public static EXTENSION_NAME = VRMC_SPRINGBONE;
  public declare extensionName: typeof VRMC_SPRINGBONE;
  public declare propertyType: 'SpringboneSpringJoint';
  public declare parentTypes: ['SpringboneSpring'];

  protected init(): void {
    this.extensionName = VRMC_SPRINGBONE;
    this.propertyType = 'SpringboneSpringJoint';
    this.parentTypes = ['SpringboneSpring'];
  }

  protected getDefaults(): Nullable<IJoint> {
    return Object.assign(super.getDefaults() as IProperty, {
      node: null,
      hitRadius: 0.0,
      stiffness: 1.0,
      gravityPower: 0.0,
      gravityDir: [0, -1, 0] as vec3,
      dragForce: 0.5,
    });
  }

  public getNode(): Node|null {
    return this.getRef('node');
  }

  public setNode(node: Node|null): this {
    return this.setRef('node', node);
  }

  public getHitRadius(): number {
    return this.get('hitRadius');
  }

  public setHitRadius(hitRadius: number): this {
    return this.set('hitRadius', hitRadius);
  }

  public getStiffness(): number {
    return this.get('stiffness');
  }

  public setStiffness(stiffness: number): this {
    return this.set('stiffness', stiffness);
  }

  public getGravityPower(): number {
    return this.get('gravityPower');
  }

  public setGravityPower(gravityPower: number): this {
    return this.set('gravityPower', gravityPower);
  }

  public getGravityDir(): vec3 {
    return this.get('gravityDir');
  }

  public setGravityDir(gravityDir: vec3): this {
    return this.set('gravityDir', gravityDir);
  }

  public getDragForce(): number {
    return this.get('dragForce');
  }

  public setDragForce(dragForce: number): this {
    return this.set('dragForce', dragForce);
  }
}