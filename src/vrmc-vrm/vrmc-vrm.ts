import { Extension, ReaderContext, WriterContext } from '@gltf-transform/core';
import type { ExpressionPresetName, VRMCVRM } from '@pixiv/types-vrmc-vrm-1.0';
import { Vrm } from './vrm.js';
import { PRESET_EXPRESSION_NAMES, VRMC_VRM } from '../constants.js';
import { Meta } from './meta.js';
import { Humanoid } from './humanoid.js';
import { Expression } from './expression.js';
import { LookAt } from './look-at.js';
import { FirstPerson } from './first-person.js';

const NAME = VRMC_VRM;

export class VRMCVrm extends Extension {
  public readonly extensionName = NAME;
  public static readonly EXTENSION_NAME = NAME;

  public createVrm(): Vrm {
    return new Vrm(this.document.getGraph());
  }

  public createMeta(): Meta {
    return new Meta(this.document.getGraph());
  }

  public createHumanoid(): Humanoid {
    return new Humanoid(this.document.getGraph());
  }

  public createExpression(): Expression {
    return new Expression(this.document.getGraph());
  }

  public createLookAt(): LookAt {
    return new LookAt(this.document.getGraph());
  }

  public createFirstPerson(): FirstPerson {
    return new FirstPerson(this.document.getGraph());
  }

  /** @hidden */
  public read(context: ReaderContext): this {
    const jsonDoc = context.jsonDoc;

    if(!jsonDoc.json.extensions || !jsonDoc.json.extensions[NAME]) return this;

    const rootDef = jsonDoc.json.extensions[NAME] as VRMCVRM;

    const vrm = this.createVrm();
    vrm.setSpecVersion(rootDef.specVersion);

    const meta = this.createMeta().read(rootDef.meta, context);
    vrm.setMeta(meta);

    const humanoid = this.createHumanoid().read(rootDef.humanoid, context);
    vrm.setHumanoid(humanoid);

    // Expressions (preset and custom)
    const expressionsDef = rootDef.expressions ?? {};
    Object.entries(expressionsDef.preset ?? {})
      .forEach(([expressionName, expressionDef]) => vrm.addExpression(expressionName, this.createExpression().read(expressionDef, context)))
    Object.entries(expressionsDef.custom ?? {})
      .forEach(([expressionName, expressionDef]) => vrm.addExpression(expressionName, this.createExpression().read(expressionDef, context)))

    if(rootDef.lookAt !== undefined) {
      const lookAt = this.createLookAt().read(rootDef.lookAt!);
      vrm.setLookAt(lookAt);
    }

    if(rootDef.firstPerson !== undefined) {
      const firstPerson = this.createFirstPerson().read(rootDef.firstPerson!, context);
      vrm.setFirstPerson(firstPerson);
    }

    // Add to root for easy access
    this.document.getRoot().setExtension(NAME, vrm);

    return this;
  }

  /** @hidden */
  public write(context: WriterContext): this {
    const jsonDoc = context.jsonDoc;

    const vrm = this.document.getRoot().getExtension<Vrm>(NAME);
    if(!vrm) return this;

    const vrmDef = {
      specVersion: vrm.getSpecVersion(),
      meta: vrm.getMeta()!.write(context),
      humanoid: vrm.getHumanoid()!.write(context),
      expressions: {preset: {}, custom: {}},
    } as VRMCVRM;

    for(const expressionName of vrm.getExpressionsNames()) {
      if(PRESET_EXPRESSION_NAMES.includes(expressionName)) {
        vrmDef.expressions!.preset![expressionName as ExpressionPresetName] = vrm.getExpression(expressionName)!.write(context);
      } else {
        vrmDef.expressions!.custom![expressionName] = vrm.getExpression(expressionName)!.write(context);
      }
    }

    const lookAt = vrm.getLookAt();
    if(lookAt !== null) {
      vrmDef.lookAt = lookAt.write();
    }

    const firstPerson = vrm.getFirstPerson();
    if(firstPerson !== null) {
      vrmDef.firstPerson = firstPerson.write(context);
    }

    jsonDoc.json.extensions = jsonDoc.json.extensions || {};
    jsonDoc.json.extensions[NAME] = vrmDef;

    return this;
  }
}