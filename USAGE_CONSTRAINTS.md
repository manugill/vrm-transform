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
- ❌ Missing bones in skin joint arrays for mesh deformation

After adding constraints:
- ✅ Natural wrist rotation
- ✅ Proper twist distribution along arms
- ✅ Better deformation for VR and animation
- ✅ Constraint bones properly integrated into mesh deformation system

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
- **Upper arm roll bones**: `J_Roll_L_UpperArm`, `J_Roll_R_UpperArm` (50% weight)
- **Elbow roll bones**: `J_Roll_L_Elbow`, `J_Roll_R_Elbow` (50% weight)
- **Lower arm roll bones**: `J_Roll_L_LowerArm`, `J_Roll_R_LowerArm` (50% weight)
- **Hand roll bones**: `J_Roll_L_Hand`, `J_Roll_R_Hand` (100% weight - critical for wrist fix)
- **Configuration**: X-axis rotation, varying weights for optimal distribution

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
├── J_Roll_L_UpperArm (new - roll constraint, 50% weight)
├── J_Aim_L_TopsUpperArm (new - aim constraint)
│   ├── J_Sec_L_TopsUpperArmInside (new)
│   └── J_Sec_L_TopsUpperArmOutside (new)
└── J_Bip_L_LowerArm (original)
    ├── J_Roll_L_Elbow (new - roll constraint, 50% weight)
    ├── J_Roll_L_LowerArm (new - roll constraint, 50% weight)
    └── J_Bip_L_Hand (original)
        └── J_Roll_L_Hand (new - roll constraint, 100% weight - CRITICAL)
```

### Constraint Settings
- **Roll axis**: X (standard for arms), Y (for elbow)
- **Roll weights**:
  - Upper arm, elbow, lower arm: 0.5 (50% of parent rotation)
  - Hand: 1.0 (100% - critical for wrist deformation fix)
- **Aim axis**: PositiveX (forward direction)
- **Aim weight**: 1.0 (full strength)

### Skin Integration
- **Critical**: All constraint bones are automatically added to skin joint arrays
- **Inverse bind matrices**: Identity matrices added for new constraint bones
- **Mesh deformation**: Constraint bones can now affect vertex weights and deformation

## Output Information

The tool provides detailed output showing:
```
📊 Original model info:
   Total nodes: 117
   Constraint nodes: 0
   Arm-related nodes: 4

🔧 Adding roll and aim constraints...
Added J_Roll_L_UpperArm to skin joints with identity matrix
Added J_Roll_L_Elbow to skin joints with identity matrix
Added J_Roll_L_Hand to skin joints with identity matrix
Added J_Roll_L_LowerArm to skin joints with identity matrix
[... and all other constraint bones]

📊 Model info after adding constraints:
   Total nodes: 135
   Constraint nodes: 8
   Arm-related nodes: 22
     🔗 J_Roll_L_UpperArm [0 children]
       → Roll: axis=X, weight=0.5, source=J_Bip_L_UpperArm
     🔗 J_Roll_L_Elbow [0 children]
       → Roll: axis=Y, weight=0.5, source=J_Bip_L_LowerArm
     🔗 J_Roll_L_Hand [0 children]
       → Roll: axis=X, weight=1.0, source=J_Bip_L_Hand
```

## Troubleshooting

### "Could not find required arm bones"
Your VRM doesn't have standard Vroid bone names. Check for:
- `J_Bip_L_UpperArm`
- `J_Bip_L_LowerArm`
- `J_Bip_L_Hand`
- `J_Bip_R_UpperArm`
- `J_Bip_R_LowerArm`
- `J_Bip_R_Hand`

### "Model already has constraints"
The model was already processed or has existing constraints. The tool will proceed anyway.

### Missing file errors
Ensure your VRM file and all its assets (textures, etc.) are in the correct location.

### Constraint bones added but no deformation
If constraint bones are created but don't affect the mesh:
- Check that bones were added to skin joints (look for "Added X to skin joints" messages)
- Verify the model has proper skin/mesh binding
- Ensure the VRM has mesh data that uses bone weights

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

- `src/functions/addConstraintsToVroidVrm.ts` - Main constraint addition logic with skin integration
- `src/processVrmWithConstraints.ts` - Command-line processing script
- `src/tests/addConstraintsToVroidVrm.test.ts` - Test and demonstration script

**Key Features:**
- ✅ Correct bone hierarchy matching VRM specification
- ✅ Proper constraint configuration (roll/aim axes, weights, sources)
- ✅ Automatic skin joint integration for mesh deformation
- ✅ Identity matrix generation for new constraint bones

Run `bun run test-constraints` to see the constraint addition in action!
