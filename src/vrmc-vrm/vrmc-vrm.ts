import { Extension, ReaderContext, WriterContext } from '@gltf-transform/core';
import type { VRMCVRM } from '@pixiv/types-vrmc-vrm-1.0';
import { Vrm } from './vrm.js';
import { VRMC_VRM } from '../constants.js';
import { Meta } from './meta.js';
import { Humanoid } from './humanoid.js';

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

    /** @hidden */
	public read(context: ReaderContext): this {
		const jsonDoc = context.jsonDoc;

		if (!jsonDoc.json.extensions || !jsonDoc.json.extensions[NAME]) return this;

		const rootDef = jsonDoc.json.extensions[NAME] as VRMCVRM;

		const vrm = this.createVrm();
		vrm.setSpecVersion(rootDef.specVersion);

		const meta = this.createMeta().read(rootDef.meta, context);
		vrm.setMeta(meta);

		const humanoid = this.createHumanoid().read(rootDef.humanoid, context);
		vrm.setHumanoid(humanoid);

		// Add to root for easy access
		this.document.getRoot().setExtension(NAME, vrm);

		return this;
	}

	/** @hidden */
	public write(context: WriterContext): this {
		const jsonDoc = context.jsonDoc;

		const vrm = this.document.getRoot().getExtension<Vrm>(NAME);
		if (!vrm) return this;

		const vrmDef = {
			specVersion: vrm.getSpecVersion(),
			meta: vrm.getMeta()!.write(context),
			humanoid: vrm.getHumanoid()!.write(context),
		} as VRMCVRM;

	   jsonDoc.json.extensions = jsonDoc.json.extensions || {};
	   jsonDoc.json.extensions[NAME] = vrmDef;

		return this;
	}
}