import { ExtensionProperty, type IProperty, type Nullable } from "@gltf-transform/core";
import { VRMC_VRM } from "../constants.js";
import type { Meta } from "./meta.js";
import { Humanoid } from "./humanoid.js";

interface IVrm extends IProperty {
	specVersion: SpecVersion;
    meta: Meta;
    humanoid: Humanoid;
}

type SpecVersion = '1.0'|'1.0-beta';

export class Vrm extends ExtensionProperty<IVrm> {
    public static EXTENSION_NAME = VRMC_VRM;
	public declare extensionName: typeof VRMC_VRM;
	public declare propertyType: 'Vrm';
	public declare parentTypes: [];

    protected init(): void {
        this.extensionName = VRMC_VRM;
		this.propertyType = 'Vrm';
		this.parentTypes = [];
    }

    protected getDefaults(): Nullable<IVrm> {
		return Object.assign(super.getDefaults() as IProperty, {
			specVersion: '1.0' as SpecVersion,
            meta: null,
            humanoid: null,
		});
	}

    public getSpecVersion(): SpecVersion {
        return this.get('specVersion');
    }

    public setSpecVersion(specVersion: SpecVersion): this {
        return this.set('specVersion', specVersion);
    }

    public getMeta(): Meta | null {
        return this.getRef('meta');
    }

    public setMeta(meta: Meta | null): this {
        return this.setRef('meta', meta);
    }

    public getHumanoid(): Humanoid | null {
        return this.getRef('humanoid');
    }

    public setHumanoid(humanoid: Humanoid | null): this {
        return this.setRef('humanoid', humanoid);
    }

}