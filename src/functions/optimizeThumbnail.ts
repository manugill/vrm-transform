import { type Document, type Transform } from '@gltf-transform/core';
import { createTransform, textureCompress } from '@gltf-transform/functions';
import { VRMC_VRM } from '../constants';
import type { Vrm } from '../vrmc-vrm';

const NAME = 'optimizeThumbnail';

/**
 * Ensures the thumbnail is a JPG and does not exceed 1024 in either dimension.
 * In case it does, it is resized into the proper dimensions
 */
export function optimizeThumbnail(options: {encoder?: unknown}): Transform {
  return createTransform(NAME, async (document: Document): Promise<void> => {
    const root = document.getRoot();

    const vrm = root.getExtension<Vrm>(VRMC_VRM);
    if(!vrm || !vrm.getMeta()?.getThumbnailImage()) {
      return;
    }

    await document.transform(
      textureCompress({
        encoder: options.encoder,
        targetFormat: 'jpeg',
        slots: /^thumbnailImage$/,
        resize: [1024, 1024]
      })
    );
  });
}
