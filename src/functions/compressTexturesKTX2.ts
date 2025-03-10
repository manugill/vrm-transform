import { FileUtils, type Document, type Transform } from "@gltf-transform/core";
import { createTransform, listTextureSlots } from "@gltf-transform/functions";

import BASIS from "basis_universal/basis_encoder.js";
import { KHRTextureBasisu } from "@gltf-transform/extensions";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let basisModule: any = null;
const basisReady = BASIS().then((module) => (basisModule = module));

const NAME = "compressTexturesKTX2";

/**
 * Uses the Basis_universal encoder WASM build, as it works in both Node.js and browser environments.
 */
export function compressTexturesKTX2(): Transform {
	return createTransform(NAME, async (document: Document): Promise<void> => {
		const root = document.getRoot();
		const logger = document.getLogger();

		// Ensure Basis_universal has been loaded and initialized
		await basisReady;
		const { BasisEncoder, initializeBasis } = basisModule;
		initializeBasis();

		// Prepare encoder
		const basisEncoder = new BasisEncoder();

		basisEncoder.setCreateKTX2File(true);
		basisEncoder.setKTX2UASTCSupercompression(true);
		// basisEncoder.setKTX2SRGBTransferFunc(true);

		let totalConverted = 0;
		root.listTextures().forEach((texture, textureIndex) => {
			const slots = listTextureSlots(texture);
			const textureLabel =
				texture.getURI() ||
				texture.getName() ||
				`${textureIndex + 1}/${root.listTextures().length}`;
			const prefix = `ktx:texture(${textureLabel})`;
			logger.debug(`${prefix}: Slots → [${slots.join(", ")}]`);

			const srcMimeType = texture.getMimeType();
			if (srcMimeType === "image/ktx2") {
				logger.debug(`${prefix}: Skipping, already KTX.`);
				return;
			} else if (srcMimeType !== "image/png" && srcMimeType !== "image/jpeg") {
				logger.warn(
					`${prefix}: Skipping, unsupported texture type "${texture.getMimeType()}".`,
				);
				return;
			}

			const srcImage = texture.getImage()!;
			const srcSize = texture.getSize();
			const srcBytes = srcImage ? srcImage.byteLength : null;

			if (!srcImage || !srcSize || !srcBytes) {
				logger.warn(`${prefix}: Skipping, unreadable texture.`);
				return;
			}

			// Create a destination buffer to hold the compressed .basis file data. If this buffer isn't large enough compression will fail.
			const ktx2FileData = new Uint8Array(srcSize[0] * srcSize[1] * 24);

			basisEncoder.setSliceSourceImage(0, srcImage, 0, 0, true);

			basisEncoder.setDebug(false);
			basisEncoder.setComputeStats(false);
			basisEncoder.setPerceptual(true);
			basisEncoder.setMipSRGB(true);
			basisEncoder.setQualityLevel(255);
			basisEncoder.setUASTC(true);
			basisEncoder.setRDOUASTC(false);
			basisEncoder.setRDOUASTCQualityScalar(1.0);
			basisEncoder.setHDR(false);
			basisEncoder.setUASTCHDRQualityLevel(0);
			basisEncoder.setMipGen(true);
			basisEncoder.setCompressionLevel(2);
			basisEncoder.setPackUASTCFlags(1);

			// Perform encoding
			const startTime = performance.now();
			const num_output_bytes = basisEncoder.encode(ktx2FileData);
			const elapsed = performance.now() - startTime;

			if (num_output_bytes === 0) {
				logger.error(
					`Failed to convert texture '${texture.getName()}' to KTX2`,
				);
			} else {
				logger.info(
					`Converted texture '${texture.getName()}' to ktx2 in ${elapsed} ms`,
				);
				const actualKTX2FileData = new Uint8Array(
					ktx2FileData.buffer,
					0,
					num_output_bytes,
				);

				// Update texture data
				texture.setImage(actualKTX2FileData);
				texture.setMimeType("image/ktx2");
				if (texture.getURI()) {
					texture.setURI(
						FileUtils.basename(texture.getURI()) + ".ktx2",
					);
				}

				totalConverted++;
			}
		});

		// Add extensions if any of the images ended up being KTX2
		if (totalConverted > 0) {
			document.createExtension(KHRTextureBasisu).setRequired(true);
		}

		// Cleanup
		basisEncoder.delete();
	});
}
