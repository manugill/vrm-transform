import { ExtensionProperty, ReaderContext, Texture, WriterContext, type IProperty, type Nullable } from "@gltf-transform/core";
import { VRMC_VRM } from "./constants";
import type { VRMCVRM } from "@pixiv/types-vrmc-vrm-1.0";

interface IMeta extends IProperty {
    name: string;
    version: string|null;
    authors: string[];
    copyrightInformation: string|null;
    contactInformation: string|null;
    references: string[]|null;
    thirdPartyLicenses: string|null;
    thumbnailImage: Texture;
    licenseUrl: string;
    avatarPermission: AvatarPermission;
    allowExcessivelyViolentUsage: boolean;
    allowExcessivelySexualUsage: boolean;
    commercialUsage: CommercialUsage;
    allowPoliticalOrReligiousUsage: boolean;
    allowAntisocialOrHateUsage: boolean;
    creditNotation: CreditNotation;
    allowRedistribution: boolean;
    modification: Modification;
    otherLicenseUrl: string|null;
}

type AvatarPermission = 'onlyAuthor' | 'onlySeparatelyLicensedPerson' | 'everyone';
type CommercialUsage = 'personalNonProfit' | 'personalProfit' | 'corporation';
type CreditNotation = 'required' | 'unnecessary';
type Modification = 'prohibited' | 'allowModification' | 'allowModificationRedistribution';

export class Meta extends ExtensionProperty<IMeta> {
    public static EXTENSION_NAME = VRMC_VRM;
	public declare extensionName: typeof VRMC_VRM;
	public declare propertyType: 'VrmMeta';
	public declare parentTypes: ['Vrm'];

    protected init(): void {
        this.extensionName = VRMC_VRM;
		this.propertyType = 'VrmMeta';
		this.parentTypes = ['Vrm'];
    }

    protected getDefaults(): Nullable<IMeta> {
		return Object.assign(super.getDefaults() as IProperty, {
            name: '',
            version: null,
            authors: [''],
            copyrightInformation: null,
            contactInformation: null,
            references: null,
            thirdPartyLicenses: null,
            thumbnailImage: null,
            licenseUrl: 'https://vrm.dev/licenses/1.0/',
            avatarPermission: 'onlyAuthor' as AvatarPermission,
            allowExcessivelyViolentUsage: false,
            allowExcessivelySexualUsage: false,
            commercialUsage: 'personalNonProfit' as CommercialUsage,
            allowPoliticalOrReligiousUsage: false,
            allowAntisocialOrHateUsage: false,
            creditNotation: 'required' as CreditNotation,
            allowRedistribution: false,
            modification: 'prohibited' as Modification,
            otherLicenseUrl: null,
		});
	}

    public getAvatarName(): string {
        return this.get('name');
    }

    public setAvatarName(name: string): this {
        return this.set('name', name);
    }

    public getVersion(): string|null {
        return this.get('version');
    }

    public setVersion(version: string|null): this {
        return this.set('version', version);
    }

    public getAuthors(): string[] {
        return this.get('authors');
    }

    public setAuthors(authors: string[]): this {
        return this.set('authors', authors);
    }

    public getCopyrightInformation(): string|null {
        return this.get('copyrightInformation');
    }

    public setCopyrightInformation(copyrightInformation: string|null): this {
        return this.set('copyrightInformation', copyrightInformation);
    }

    public getContactInformation(): string|null {
        return this.get('contactInformation');
    }

    public setContactInformation(contactInformation: string|null): this {
        return this.set('contactInformation', contactInformation);
    }

    public getReferences(): string[]|null {
        return this.get('references');
    }

    public setReferences(references: string[]|null): this {
        return this.set('references', references);
    }

    public getThirdPartyLicenses(): string|null {
        return this.get('thirdPartyLicenses');
    }

    public setThirdPartyLicenses(thirdPartyLicenses: string|null): this {
        return this.set('thirdPartyLicenses', thirdPartyLicenses);
    }

    public getThumbnailImage(): Texture|null {
        return this.getRef('thumbnailImage');
    }

    public setThumbnailImage(thumbnailImage: Texture|null): this {
        return this.setRef('thumbnailImage', thumbnailImage);
    }

    public getLicenseUrl(): string {
        return this.get('licenseUrl');
    }

    public setLicenseUrl(licenseUrl: string): this {
        return this.set('licenseUrl', licenseUrl);
    }

    public getAvatarPermission(): AvatarPermission {
        return this.get('avatarPermission');
    }

    public setAvatarPermission(avatarPermission: AvatarPermission): this {
        return this.set('avatarPermission', avatarPermission);
    }

    public getAllowExcessivelyViolentUsage(): boolean {
        return this.get('allowExcessivelyViolentUsage');
    }

    public setAllowExcessivelyViolentUsage(allowExcessivelyViolentUsage: boolean): this {
        return this.set('allowExcessivelyViolentUsage', allowExcessivelyViolentUsage);
    }

    public getAllowExcessivelySexualUsage(): boolean {
        return this.get('allowExcessivelySexualUsage');
    }

    public setAllowExcessivelySexualUsage(allowExcessivelySexualUsage: boolean): this {
        return this.set('allowExcessivelySexualUsage', allowExcessivelySexualUsage);
    }

    public getCommercialUsage(): CommercialUsage {
        return this.get('commercialUsage');
    }

    public setCommercialUsage(commercialUsage: CommercialUsage): this {
        return this.set('commercialUsage', commercialUsage);
    }

    public getAllowPoliticalOrReligiousUsage(): boolean {
        return this.get('allowPoliticalOrReligiousUsage');
    }

    public setAllowPoliticalOrReligiousUsage(allowPoliticalOrReligiousUsage: boolean): this {
        return this.set('allowPoliticalOrReligiousUsage', allowPoliticalOrReligiousUsage);
    }

    public getAllowAntisocialOrHateUsage(): boolean {
        return this.get('allowAntisocialOrHateUsage');
    }

    public setAllowAntisocialOrHateUsage(allowAntisocialOrHateUsage: boolean): this {
        return this.set('allowAntisocialOrHateUsage', allowAntisocialOrHateUsage);
    }

    public getCreditNotation(): CreditNotation {
        return this.get('creditNotation');
    }

    public setCreditNotation(creditNotation: CreditNotation): this {
        return this.set('creditNotation', creditNotation);
    }

    public getAllowRedistribution(): boolean {
        return this.get('allowRedistribution');
    }

    public setAllowRedistribution(allowRedistribution: boolean): this {
        return this.set('allowRedistribution', allowRedistribution);
    }

    public getModification(): Modification {
        return this.get('modification');
    }

    public setModification(modification: Modification): this {
        return this.set('modification', modification);
    }

    public getOtherLicenseUrl(): string|null {
        return this.get('otherLicenseUrl');
    }

    public setOtherLicenseUrl(otherLicenseUrl: string|null): this {
        return this.set('otherLicenseUrl', otherLicenseUrl);
    }

    public read(metaDef: VRMCVRM['meta'], context: ReaderContext): this {
        this.setAvatarName(metaDef.name);
        this.setVersion(metaDef.version ?? null);
        this.setAuthors(metaDef.authors);
        this.setCopyrightInformation(metaDef.copyrightInformation ?? null);
        this.setContactInformation(metaDef.contactInformation ?? null);
        this.setReferences(metaDef.references ?? null);
        this.setThirdPartyLicenses(metaDef.thirdPartyLicenses ?? null);
        this.setThumbnailImage(metaDef.thumbnailImage ? context.textures[metaDef.thumbnailImage] : null);
        this.setLicenseUrl(metaDef.licenseUrl);
        this.setAvatarPermission(metaDef.avatarPermission ?? 'onlyAuthor');
        this.setAllowExcessivelyViolentUsage(metaDef.allowExcessivelyViolentUsage ?? false);
        this.setAllowExcessivelySexualUsage(metaDef.allowExcessivelySexualUsage ?? false);
        this.setCommercialUsage(metaDef.commercialUsage ?? 'personalNonProfit');
        this.setAllowPoliticalOrReligiousUsage(metaDef.allowPoliticalOrReligiousUsage ?? false);
        this.setAllowAntisocialOrHateUsage(metaDef.allowAntisocialOrHateUsage ?? false);
        this.setCreditNotation(metaDef.creditNotation ?? 'required');
        this.setAllowRedistribution(metaDef.allowRedistribution ?? false);
        this.setModification(metaDef.modification ?? 'prohibited');
        this.setOtherLicenseUrl(metaDef.otherLicenseUrl ?? null);
        return this;
    }

    public write(context: WriterContext): VRMCVRM['meta'] {
        return {
            name: this.getAvatarName(),
            version: this.getVersion() ?? undefined,
            authors: this.getAuthors(),
            copyrightInformation: this.getCopyrightInformation() ?? undefined,
            contactInformation: this.getContactInformation() ?? undefined,
            references: this.getReferences() ?? undefined,
            thirdPartyLicenses: this.getThirdPartyLicenses() ?? undefined,
            thumbnailImage: this.getThumbnailImage() ? context.imageIndexMap.get(this.getThumbnailImage()!) : undefined,
            licenseUrl: this.getLicenseUrl(),
            avatarPermission: this.getAvatarPermission(),
            allowExcessivelyViolentUsage: this.getAllowExcessivelyViolentUsage(),
            allowExcessivelySexualUsage: this.getAllowExcessivelySexualUsage(),
            commercialUsage: this.getCommercialUsage(),
            allowPoliticalOrReligiousUsage: this.getAllowPoliticalOrReligiousUsage(),
            allowAntisocialOrHateUsage: this.getAllowAntisocialOrHateUsage(),
            creditNotation: this.getCreditNotation(),
            allowRedistribution: this.getAllowRedistribution(),
            modification: this.getModification(),
            otherLicenseUrl: this.getOtherLicenseUrl() ?? undefined,
        } satisfies VRMCVRM['meta'];
    }
}