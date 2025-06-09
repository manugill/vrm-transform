/* eslint-disable @stylistic/keyword-spacing */
/* eslint-disable @stylistic/quotes */
/* eslint-disable @stylistic/indent */
import { Document, Node } from "@gltf-transform/core";
import { VRMCNodeConstraint } from "../vrmc-node-constraint/index.js";

/**
 * Adds roll and aim constraints to VRM models exported from Vroid Studio.
 * VRM files from Vroid Studio lack twist bones and constraints, causing poor wrist deformation.
 * This function adds the missing roll constraint bones and sets up proper constraints.
 */
export function addConstraintsToVroidVrm() {
	return (document: Document): void => {
		const root = document.getRoot();
		const vrmcNodeConstraint = document.createExtension(VRMCNodeConstraint);

		// Find the main arm bones
		const leftUpperArm = findBoneByName(root, "J_Bip_L_UpperArm");
		const leftLowerArm = findBoneByName(root, "J_Bip_L_LowerArm");
		const rightUpperArm = findBoneByName(root, "J_Bip_R_UpperArm");
		const rightLowerArm = findBoneByName(root, "J_Bip_R_LowerArm");

		if (!leftUpperArm || !leftLowerArm || !rightUpperArm || !rightLowerArm) {
			console.warn(
				"Could not find required arm bones. Make sure this is a VRM model from Vroid Studio.",
			);
			return;
		}

		// Add roll constraint bones for left arm
		addRollConstraintBones(
			document,
			leftUpperArm,
			leftLowerArm,
			"L",
			vrmcNodeConstraint,
		);

		// Add roll constraint bones for right arm
		addRollConstraintBones(
			document,
			rightUpperArm,
			rightLowerArm,
			"R",
			vrmcNodeConstraint,
		);

		console.log("Successfully added roll constraints to VRM model");
	};
}

function findBoneByName(root: import("@gltf-transform/core").Root, name: string): Node | null {
	const nodes = root.listNodes();
	return nodes.find((node: Node) => node.getName() === name) || null;
}

function addRollConstraintBones(
	document: Document,
	upperArm: Node,
	lowerArm: Node,
	side: "L" | "R",
	vrmcNodeConstraint: VRMCNodeConstraint,
): void {
	// Create roll constraint bone for upper arm
	const rollUpperArm = document.createNode(`J_Roll_${side}_UpperArm`);

	// Position the roll bone at the same location as the upper arm but with no rotation
	const upperArmTranslation = upperArm.getTranslation();
	rollUpperArm.setTranslation([
		upperArmTranslation[0] * 0.5, // Position it halfway along the upper arm
		upperArmTranslation[1],
		upperArmTranslation[2],
	]);
	rollUpperArm.setRotation([0, 0, 0, 1]); // Identity rotation

	// Create roll constraint bone for lower arm
	const rollLowerArm = document.createNode(`J_Roll_${side}_LowerArm`);

	// Position the roll bone at the same location as the lower arm
	const lowerArmTranslation = lowerArm.getTranslation();
	rollLowerArm.setTranslation([
		lowerArmTranslation[0] * 0.5, // Position it halfway along the lower arm
		lowerArmTranslation[1],
		lowerArmTranslation[2],
	]);
	rollLowerArm.setRotation([0, 0, 0, 1]); // Identity rotation

	// Add roll bones to the hierarchy
	// Upper arm roll bone should be a child of upper arm
	upperArm.addChild(rollUpperArm);

	// Lower arm roll bone should be a child of lower arm
	lowerArm.addChild(rollLowerArm);

	// Create roll constraints
	const upperArmRollConstraint = vrmcNodeConstraint.createNodeConstraint();
	upperArmRollConstraint.setSpecVersion("1.0");
	upperArmRollConstraint.setSource(upperArm);
	upperArmRollConstraint.setRollAxis("X"); // Arms typically twist around X axis
	upperArmRollConstraint.setWeight(0.5); // 50% of the rotation
	rollUpperArm.setExtension(VRMCNodeConstraint.EXTENSION_NAME, upperArmRollConstraint);

	const lowerArmRollConstraint = vrmcNodeConstraint.createNodeConstraint();
	lowerArmRollConstraint.setSpecVersion("1.0");
	lowerArmRollConstraint.setSource(lowerArm);
	lowerArmRollConstraint.setRollAxis("X"); // Arms typically twist around X axis
	lowerArmRollConstraint.setWeight(0.5); // 50% of the rotation
	rollLowerArm.setExtension(VRMCNodeConstraint.EXTENSION_NAME, lowerArmRollConstraint);

	// Optional: Add aim constraint bones for better deformation (sleeves)
	addAimConstraintBones(document, upperArm, lowerArm, side, vrmcNodeConstraint);
}

function addAimConstraintBones(
	document: Document,
	upperArm: Node,
	lowerArm: Node,
	side: "L" | "R",
	vrmcNodeConstraint: VRMCNodeConstraint,
): void {
	// Create aim constraint bone for upper arm (for sleeve/clothing deformation)
	const aimUpperArm = document.createNode(`J_Aim_${side}_TopsUpperArm`);

	// Position the aim bone at the upper arm location
	const upperArmTranslation = upperArm.getTranslation();
	aimUpperArm.setTranslation([
		upperArmTranslation[0] * 0.3, // Position it closer to the shoulder
		upperArmTranslation[1],
		upperArmTranslation[2],
	]);
	aimUpperArm.setRotation([0, 0, 0, 1]);

	// Add aim bone to hierarchy (as child of upper arm)
	upperArm.addChild(aimUpperArm);

	// Create aim constraint
	const aimConstraint = vrmcNodeConstraint.createNodeConstraint();
	aimConstraint.setSpecVersion("1.0");
	aimConstraint.setSource(lowerArm); // Aim towards the lower arm
	aimConstraint.setAimAxis("PositiveX"); // Aim along positive X axis
	aimConstraint.setWeight(1.0); // Full weight for aim constraint
	aimUpperArm.setExtension(VRMCNodeConstraint.EXTENSION_NAME, aimConstraint);

	// Create secondary bones for more detailed deformation (optional)
	createSecondaryBones(document, aimUpperArm, side);
}

function createSecondaryBones(document: Document, aimBone: Node, side: "L" | "R"): void {
	// Create inside secondary bone
	const secInside = document.createNode(`J_Sec_${side}_TopsUpperArmInside`);
	secInside.setTranslation([0.02, 0, 0.01]); // Small offset
	secInside.setRotation([0, 0, 0, 1]);
	aimBone.addChild(secInside);

	// Create end bone for inside
	const secInsideEnd = document.createNode(`J_Sec_${side}_TopsUpperArmInside_end`);
	secInsideEnd.setTranslation([0.05, 0, 0]); // End position
	secInsideEnd.setRotation([0, 0, 0, 1]);
	secInside.addChild(secInsideEnd);

	// Create outside secondary bone
	const secOutside = document.createNode(`J_Sec_${side}_TopsUpperArmOutside`);
	secOutside.setTranslation([0.02, 0, -0.01]); // Small offset on other side
	secOutside.setRotation([0, 0, 0, 1]);
	aimBone.addChild(secOutside);

	// Create end bone for outside
	const secOutsideEnd = document.createNode(`J_Sec_${side}_TopsUpperArmOutside_end`);
	secOutsideEnd.setTranslation([0.05, 0, 0]); // End position
	secOutsideEnd.setRotation([0, 0, 0, 1]);
	secOutside.addChild(secOutsideEnd);
}
