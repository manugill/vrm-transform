# vrm-transform

This repository contains a collection of extensions and transform functions for [glTF-Transform](https://github.com/donmccurdy/glTF-Transform) aimed at supporting [VRM](https://vrm.dev/) 1.0 files. This allows `.vrm` files to be processed using glTF-Transform without removing or breaking the avatar, as well as optimized using functions built specifically for `.vrm` files.

> [!NOTE]
> The project is WIP.

# Support matrix

| Extension | Supported | Notes |
|-----------|:---------:|-------|
| VRMC_vrm-1.0 | ✅ | `lookAt` and `firstPerson` aren't supported yet |
| VRMC_materials_mtoon-1.0 | ✅ | |
| VRMC_materials_hdr_emissiveMap-1.0 | ❌ | |
| VRMC_node_constraint-1.0 | ✅ | |
| VRMC_springBone-1.0 | ✅ | |
| VRMC_springBone_extended_collider-1.0 | ❌ | |
| VRMC_vrm_animation-1.0 | ❌ | Support for `.vrma` files is not the focus |
| VRM (0.0) | ❌ | This project does not support VRM 0.0 files, convert them to VRM 1.0 beforehand |

# Functions

The following table shows the functions that are implemented and their intended purpose.
Most of these aim to optimize the .vrm file, either by reducing the file size, or improving runtime performance.

| FunctionName | Description | File size | Runtime (GPU) | Runtime (CPU) |
|--------------|-------------|:---------:|:-------------:|:-------------:|
| `combineSkins` | Ensures that the VRM file only uses one Skin across all (skinned) meshes | | | ✅ |
| `pruneMorphTargets` | Determines which morphTargets are used in expressions and removes those that aren't being used | ✅ | ✅ | |
| `pruneSpringBones` | Determines which springbones, joints and colliders are unused and removes them |  | | ✅ |
| `pruneVrmVertexAttributes` | Special function replicating the attribute pruning of `prune` taking into account VRM requirements | ✅ | | |
| `optimizeThumbnail` | Ensures the embedded thumbnail is JPEG and does not exceed the 1024x1024 recommended dimensions | ✅ | | |

# Limitations

* Not all VMR implementations support interleaved vertex attributes. Make sure to use the `SEPARATE` layout for better compatibility:
  ```js
  io.setVertexLayout(VertexLayout.SEPARATE);
  ```
* The built-in `prune` function will assume that the `NORMAL` attribute is not needed for meshes shaded using the MToon material. This is caused by the presence of the `KHR_materials_unlit` extension. To avoid this enabled the `keepAttributes` property and use the purpose-built `pruneVrmVertexAttributes`:
  ```js
  prunteVrmVertexAttributes(),
  prune({
    keepAttributes: true
  }),
  ```
* Optimizing the thumbnail image requires an encoder, see [glTF-Transform](https://gltf-transform.dev/modules/functions/functions/compressTexture) documentation for more details.

The output can always be validated using the [VRM 1.0 validator](https://vrm-validator.fern.solutions/).