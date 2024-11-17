import { ExtensionProperty, type IProperty, type Nullable, type vec3 } from '@gltf-transform/core';
import { VRMC_VRM } from '../constants';
import type { LookAtRangeMap, VRMCVRM } from '@pixiv/types-vrmc-vrm-1.0';

interface ILookAt extends IProperty {
  offsetFromHeadBone: vec3|null;
  type: LookAtType|null;
  rangeMapHorizontalInner: RangeMap|null;
  rangeMapHorizontalOuter: RangeMap|null;
  rangeMapVerticalDown: RangeMap|null;
  rangeMapVerticalUp: RangeMap|null;
}

type LookAtType = 'bone' | 'expression';

export class LookAt extends ExtensionProperty<ILookAt> {
  public static EXTENSION_NAME = VRMC_VRM;
  public declare extensionName: typeof VRMC_VRM;
  public declare propertyType: 'VrmLookAt';
  public declare parentTypes: ['Vrm'];

  protected init(): void {
    this.extensionName = VRMC_VRM;
    this.propertyType = 'VrmLookAt';
    this.parentTypes = ['Vrm'];
  }

  protected getDefaults(): Nullable<ILookAt> {
    return Object.assign(super.getDefaults() as IProperty, {
      offsetFromHeadBone: null,
      type: null,
      rangeMapHorizontalInner: null,
      rangeMapHorizontalOuter: null,
      rangeMapVerticalDown: null,
      rangeMapVerticalUp: null,
    });
  }

  public getOffsetFromHeadBone(): vec3|null {
    return this.get('offsetFromHeadBone');
  }

  public setOffsetFromHeadBone(offsetFromHeadBone: vec3|null): this {
    return this.set('offsetFromHeadBone', offsetFromHeadBone);
  }

  public getType(): LookAtType|null {
    return this.get('type');
  }

  public setType(type: LookAtType|null): this {
    return this.set('type', type);
  }

  public getRangeMapHorizontalInner(): RangeMap|null {
    return this.get('rangeMapHorizontalInner');
  }

  public setRangeMapHorizontalInner(rangeMapHorizontalInner: RangeMap|null): this {
    return this.set('rangeMapHorizontalInner', rangeMapHorizontalInner);
  }

  public getRangeMapHorizontalOuter(): RangeMap|null {
    return this.get('rangeMapHorizontalOuter');
  }

  public setRangeMapHorizontalOuter(rangeMapHorizontalOuter: RangeMap|null): this {
    return this.set('rangeMapHorizontalOuter', rangeMapHorizontalOuter);
  }

  public getRangeMapVerticalDown(): RangeMap|null {
    return this.get('rangeMapVerticalDown');
  }

  public setRangeMapVerticalDown(rangeMapVerticalDown: RangeMap|null): this {
    return this.set('rangeMapVerticalDown', rangeMapVerticalDown);
  }

  public getRangeMapVerticalUp(): RangeMap|null {
    return this.get('rangeMapVerticalUp');
  }

  public setRangeMapVerticalUp(rangeMapVerticalUp: RangeMap|null): this {
    return this.set('rangeMapVerticalUp', rangeMapVerticalUp);
  }

  public read(lookAtDef: Exclude<VRMCVRM['lookAt'], undefined>): this {
    console.log(lookAtDef);
    this.set('offsetFromHeadBone', (lookAtDef.offsetFromHeadBone as vec3) ?? null);
    this.set('type', lookAtDef.type ?? null);
    this.set('rangeMapHorizontalInner', parseRangeMap(lookAtDef.rangeMapHorizontalInner));
    this.set('rangeMapHorizontalOuter', parseRangeMap(lookAtDef.rangeMapHorizontalOuter));
    this.set('rangeMapVerticalDown', parseRangeMap(lookAtDef.rangeMapVerticalDown));
    this.set('rangeMapVerticalUp', parseRangeMap(lookAtDef.rangeMapVerticalUp));
    return this;
  }

  public write(): VRMCVRM['lookAt'] {
    const lookAtDef: VRMCVRM['lookAt'] = {};

    if(this.getOffsetFromHeadBone()) {
      lookAtDef.offsetFromHeadBone = this.getOffsetFromHeadBone()!;
    }
    if(this.getType()) {
      lookAtDef.type = this.getType()!;
    }
    writeRangeMap(this.getRangeMapHorizontalInner(), lookAtDef, 'rangeMapHorizontalInner');
    writeRangeMap(this.getRangeMapHorizontalOuter(), lookAtDef, 'rangeMapHorizontalOuter');
    writeRangeMap(this.getRangeMapVerticalDown(), lookAtDef, 'rangeMapVerticalDown');
    writeRangeMap(this.getRangeMapVerticalUp(), lookAtDef, 'rangeMapVerticalUp');

    console.log(lookAtDef);
    return lookAtDef;
  }
}

function parseRangeMap(rangeMapJson: RangeMap|null|undefined): RangeMap|null {
  if(!rangeMapJson) { return null; }

  return rangeMapJson;
}

function writeRangeMap(rangeMap: RangeMap|null, target: Exclude<VRMCVRM['lookAt'], undefined>, name: keyof Exclude<VRMCVRM['lookAt'], undefined>): void {
  if(!rangeMap) {
    return;
  }

  if(rangeMap.inputMaxValue === undefined && rangeMap.outputScale === undefined) {
    return;
  }
  const result = {} as LookAtRangeMap;
  if(rangeMap.inputMaxValue !== undefined) {
    result.inputMaxValue = rangeMap.inputMaxValue;
  }
  if(rangeMap.outputScale !== undefined) {
    result.outputScale = rangeMap.outputScale;
  }
  target[name] = result;
}

export type RangeMap = {
  inputMaxValue?: number;
  outputScale?: number;
}