# Adding Roll and Aim Constraints to VRM Models

This tool adds missing roll and aim constraints to VRM models exported from Vroid Studio to fix wrist deformation issues.

## Quick Start

1. **Place your VRM file** in the `input/` directory
2. **Run the constraint tool**:
   ```bash
   bun run add-constraints your-model.vrm
   ```
3. **Get your improved model** from `output/your-model_with_constraints.vrm`

## Problem This Solves

VRM files from Vroid Studio lack twist bones and constraints, causing:
- ❌ Wrist "candy wrapper" deformation when hands rotate
- ❌ Unrealistic arm twisting
- ❌ Poor deformation in VR applications

After adding constraints:
- ✅ Natural wrist rotation
- ✅ Proper twist distribution along arms
- ✅ Better deformation for VR and animation

## Usage Examples

### Basic Usage
```bash
# Add constraints to a Vroid model
bun run add-constraints MyCharacter.vrm

# Output: output/MyCharacter_with_constraints.vrm
```

### Test the Functionality
```bash
# Test with a simple skeleton (no VRM file needed)
bun run test-constraints
```

### Advanced Usage
```bash
# Direct script usage with full path
bun run src/processVrmWithConstraints.ts path/to/model.vrm
```

## What Gets Added

### Roll Constraints (Twist Bones)
- **Upper arm roll bones**: `J_Roll_L_UpperArm`, `J_Roll_R_UpperArm`
- **Lower arm roll bones**: `J_Roll_L_LowerArm`, `J_Roll_R_LowerArm`
- **Configuration**: 50% twist transfer, X-axis rotation

### Aim Constraints (Sleeve Bones)
- **Aim bones**: `J_Aim_L_TopsUpperArm`, `J_Aim_R_TopsUpperArm`
- **Purpose**: Better sleeve/clothing deformation
- **Configuration**: Points toward lower arm

### Secondary Bones
- Inside/outside detail bones for fine deformation
- End bones for proper termination
- Proper hierarchy for performance

## Technical Details

### Bone Structure Added
```
J_Bip_L_UpperArm (original)
├── J_Roll_L_UpperArm (new - roll constraint)
├── J_Aim_L_TopsUpperArm (new - aim constraint)
│   ├── J_Sec_L_TopsUpperArmInside (new)
│   └── J_Sec_L_TopsUpperArmOutside (new)
└── J_Bip_L_LowerArm (original)
    └── J_Roll_L_LowerArm (new - roll constraint)
```

### Constraint Settings
- **Roll axis**: X (standard for arms)
- **Roll weight**: 0.5 (50% of parent rotation)
- **Aim axis**: PositiveX (forward direction)
- **Aim weight**: 1.0 (full strength)

## Output Information

The tool provides detailed output showing:
```
📊 Original model info:
   Total nodes: 117
   Constraint nodes: 0
   Arm-related nodes: 4

🔧 Adding roll and aim constraints...

📊 Model info after adding constraints:
   Total nodes: 131
   Constraint nodes: 6
   Arm-related nodes: 18
     🔗 J_Roll_L_UpperArm [0 children]
       → Roll: axis=X, weight=0.5, source=J_Bip_L_UpperArm
```

## Troubleshooting

### "Could not find required arm bones"
Your VRM doesn't have standard Vroid bone names. Check for:
- `J_Bip_L_UpperArm`
- `J_Bip_L_LowerArm`
- `J_Bip_R_UpperArm`
- `J_Bip_R_LowerArm`

### "Model already has constraints"
The model was already processed or has existing constraints. The tool will proceed anyway.

### Missing file errors
Ensure your VRM file and all its assets (textures, etc.) are in the correct location.

## Integration

You can use the constraint function in your own scripts:

```typescript
import { addConstraintsToVroidVrm } from './functions/addConstraintsToVroidVrm.js';

await document.transform(
  addConstraintsToVroidVrm(),
  // other transforms...
);
```

## Compatibility

- ✅ VRM 1.0 specification compliant
- ✅ UniVRM v0.127.2+ compatible
- ✅ Standard VRM runtimes
- ✅ Unity, Unreal, web viewers

## Files Created

- `src/functions/addConstraintsToVroidVrm.ts` - Main constraint addition logic
- `src/processVrmWithConstraints.ts` - Command-line processing script
- `src/addConstraintsToVroidVrm.ts` - Test and demonstration script

Run `bun run test-constraints` to see the constraint addition in action!