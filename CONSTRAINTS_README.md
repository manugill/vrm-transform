# VRM Constraint Addition Tool

This tool adds missing roll and aim constraints to VRM models exported from Vroid Studio, which significantly improves wrist deformation and prevents the "candy wrapper" effect when hands rotate.

## What This Tool Does

VRM files exported from Vroid Studio lack proper twist bones and constraints for the arms, causing poor deformation when the wrists rotate. This tool automatically adds:

- **Roll constraint bones** for upper and lower arms (50% twist transfer)
- **Aim constraint bones** for sleeve/clothing deformation  
- **Secondary bones** for detailed deformation control
- **Proper constraint setup** following VRM 1.0 specification

## Before and After

**Before**: Wrist rotation causes unrealistic "candy wrapper" deformation
**After**: Smooth, natural wrist rotation with proper twist distribution

## Usage

### Basic Usage

1. Place your VRM file in the `input/` directory
2. Run the constraint addition script:

```bash
bun run src/processVrmWithConstraints.ts your_model.vrm
```

3. Find the processed file in `output/` directory with `_with_constraints.vrm` suffix

### Example

```bash
# Process a Vroid Studio export
bun run src/processVrmWithConstraints.ts Vroid_Character.vrm

# Output will be: output/Vroid_Character_with_constraints.vrm
```

### Testing the Function

To test the constraint addition functionality without a real VRM file:

```bash
bun run src/addConstraintsToVroidVrm.ts
```

This creates a simple test skeleton and demonstrates the constraint addition.

## What Gets Added

### Roll Constraints

- `J_Roll_L_UpperArm` - Left upper arm twist bone
- `J_Roll_L_LowerArm` - Left lower arm twist bone  
- `J_Roll_R_UpperArm` - Right upper arm twist bone
- `J_Roll_R_LowerArm` - Right lower arm twist bone

Each roll constraint transfers 50% of the parent bone's rotation around the X axis.

### Aim Constraints

- `J_Aim_L_TopsUpperArm` - Left upper arm aim bone for sleeves
- `J_Aim_R_TopsUpperArm` - Right upper arm aim bone for sleeves

Aim constraints make sleeve bones point toward the lower arm for natural clothing deformation.

### Secondary Bones

- Inside and outside secondary bones for each arm
- End bones for detailed mesh deformation
- Proper hierarchy setup for optimal performance

## Technical Details

### VRM Specification Compliance

This tool follows the [VRMC_node_constraint 1.0 specification](https://github.com/vrm-c/vrm-specification/blob/master/specification/VRMC_node_constraint-1.0/README.md) for:

- Roll constraints with proper axis configuration
- Aim constraints with correct targeting
- Weight values optimized for natural deformation

### Bone Hierarchy

```
J_Bip_L_UpperArm
├── J_Roll_L_UpperArm (Roll Constraint → J_Bip_L_UpperArm)
├── J_Aim_L_TopsUpperArm (Aim Constraint → J_Bip_L_LowerArm)
│   ├── J_Sec_L_TopsUpperArmInside
│   │   └── J_Sec_L_TopsUpperArmInside_end
│   └── J_Sec_L_TopsUpperArmOutside
│       └── J_Sec_L_TopsUpperArmOutside_end
└── J_Bip_L_LowerArm
    └── J_Roll_L_LowerArm (Roll Constraint → J_Bip_L_LowerArm)
```

### Constraint Configuration

- **Roll Axis**: X (standard for arm bones)
- **Roll Weight**: 0.5 (50% twist transfer)
- **Aim Axis**: PositiveX (standard forward direction)
- **Aim Weight**: 1.0 (full aim strength)

## Integration with VRM Transform Pipeline

You can integrate this constraint addition into your existing VRM processing pipeline:

```typescript
import { addConstraintsToVroidVrm } from './functions/addConstraintsToVroidVrm.js';

await document.transform(
  addConstraintsToVroidVrm(),
  // ... other transforms
  dedup(),
  prune(),
);
```

## Compatibility

- **VRM Version**: 1.0
- **Unity**: Compatible with UniVRM v0.127.2+
- **Other VRM Runtimes**: Should work with any VRM 1.0 compliant runtime
- **File Format**: Outputs standard VRM files (.vrm)

## Troubleshooting

### "Could not find required arm bones"

This error means the model doesn't have the expected Vroid Studio bone structure. Make sure you're using a VRM file exported directly from Vroid Studio with standard bone names:

- `J_Bip_L_UpperArm`
- `J_Bip_L_LowerArm` 
- `J_Bip_R_UpperArm`
- `J_Bip_R_LowerArm`

### "Model already has constraints"

The tool detected existing constraints but will proceed anyway. This might happen if:

- The model was already processed
- The model came from a different source with constraints
- There are custom bones with similar names

### Missing Assets Error

If you get ENOENT errors about missing images or data files, make sure all referenced assets are in the same directory as the VRM file.

## Contributing

To modify or extend the constraint addition:

1. Edit `src/functions/addConstraintsToVroidVrm.ts`
2. Test with `bun run src/addConstraintsToVroidVrm.ts`
3. Process real VRM files with `bun run src/processVrmWithConstraints.ts`

### Adding New Constraint Types

You can extend the function to add other constraint types by following the VRM specification:

- Rotation constraints for sub-arms
- Additional roll bones for more detailed twisting
- Custom aim setups for specific clothing types

## References

- [VRM Specification](https://github.com/vrm-c/vrm-specification)
- [VRMC_node_constraint Documentation](https://github.com/vrm-c/vrm-specification/blob/master/specification/VRMC_node_constraint-1.0/README.md)
- [glTF Transform Documentation](https://gltf-transform.dev/)
- [Vroid Studio](https://vroid.com/studio)