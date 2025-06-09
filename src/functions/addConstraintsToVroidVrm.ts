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
		const leftShoulder = findBoneByName(root, "J_Bip_L_Shoulder");
		const leftUpperArm = findBoneByName(root, "J_Bip_L_UpperArm");
		const leftLowerArm = findBoneByName(root, "J_Bip_L_LowerArm");
		const leftHand = findBoneByName(root, "J_Bip_L_Hand");
		const rightShoulder = findBoneByName(root, "J_Bip_R_Shoulder");
		const rightUpperArm = findBoneByName(root, "J_Bip_R_UpperArm");
		const rightLowerArm = findBoneByName(root, "J_Bip_R_LowerArm");
		const rightHand = findBoneByName(root, "J_Bip_R_Hand");

		if (!leftUpperArm || !leftLowerArm || !leftHand || !rightUpperArm || !rightLowerArm || !rightHand) {
			console.warn(
				"Could not find required arm bones. Make sure this is a VRM model from Vroid Studio.",
			);
			return;
		}

		// Handle models without shoulder bones (use upper arm as parent instead)
		if (!leftShoulder) {
			console.log("No shoulder bones found, using upper arm as parent for constraints");
			leftShoulder = leftUpperArm;
		}
		if (!rightShoulder) {
			rightShoulder = rightUpperArm;
		}

		// Add constraint bones for left arm
		addConstraintBones(
			document,
			leftShoulder,
			leftUpperArm,
			leftLowerArm,
			leftHand,
			"L",
			vrmcNodeConstraint,
		);

		// Add constraint bones for right arm
		addConstraintBones(
			document,
			rightShoulder,
			rightUpperArm,
			rightLowerArm,
			rightHand,
			"R",
			vrmcNodeConstraint,
		);

		// Add all new constraint bones to skin joints for mesh deformation
		addConstraintBonestoSkins(document);

		console.log("Successfully added roll constraints to VRM model");
	};
}

function findBoneByName(root: import("@gltf-transform/core").Root, name: string): Node | null {
	const nodes = root.listNodes();
	return nodes.find((node: Node) => node.getName() === name) || null;
}

function addConstraintBones(
	document: Document,
	shoulder: Node,
	upperArm: Node,
	lowerArm: Node,
	hand: Node,
	side: "L" | "R",
	vrmcNodeConstraint: VRMCNodeConstraint,
): void {
	// Only create shoulder aim constraint if we have a real shoulder bone
	let aimParent = shoulder;
	if (shoulder !== upperArm) {
		const aimShoulder = document.createNode(`J_Aim_${side}_Shoulder`);
		aimShoulder.setTranslation([0, 0, 0]);
		aimShoulder.setRotation([0, 0, 0, 1]);
		shoulder.addChild(aimShoulder);

		// Create aim constraint for shoulder
		const shoulderAimConstraint = vrmcNodeConstraint.createNodeConstraint();
		shoulderAimConstraint.setSpecVersion("1.0");
		shoulderAimConstraint.setSource(upperArm);
		shoulderAimConstraint.setAimAxis("PositiveX");
		shoulderAimConstraint.setWeight(1.0);
		aimShoulder.setExtension(VRMCNodeConstraint.EXTENSION_NAME, shoulderAimConstraint);
		
		aimParent = aimShoulder;
	}

	// Create roll constraint bone for upper arm (as child of aim shoulder or upper arm)
	const rollUpperArm = document.createNode(`J_Roll_${side}_UpperArm`);
	const upperArmTranslation = upperArm.getTranslation();
	rollUpperArm.setTranslation([
		upperArmTranslation[0] * 1.4, // Position further along the upper arm
		upperArmTranslation[1],
		upperArmTranslation[2],
	]);
	rollUpperArm.setRotation([0, 0, 0, 1]);
	aimParent.addChild(rollUpperArm);

	// Create roll constraint for upper arm
	const upperArmRollConstraint = vrmcNodeConstraint.createNodeConstraint();
	upperArmRollConstraint.setSpecVersion("1.0");
	upperArmRollConstraint.setSource(upperArm);
	upperArmRollConstraint.setRollAxis("X");
	upperArmRollConstraint.setWeight(0.5);
	rollUpperArm.setExtension(VRMCNodeConstraint.EXTENSION_NAME, upperArmRollConstraint);

	// Create elbow roll constraint bone (as child of upper arm, sibling of lower arm)
	const rollElbow = document.createNode(`J_Roll_${side}_Elbow`);
	const lowerArmTranslation = lowerArm.getTranslation();
	rollElbow.setTranslation([
		lowerArmTranslation[0] + 0.00001, // Position exactly at elbow joint
		lowerArmTranslation[1],
		lowerArmTranslation[2],
	]);
	rollElbow.setRotation([0, 0, 0, 1]);
	upperArm.addChild(rollElbow);

	// Create elbow roll constraint - sources lower arm with Y axis
	const elbowRollConstraint = vrmcNodeConstraint.createNodeConstraint();
	elbowRollConstraint.setSpecVersion("1.0");
	elbowRollConstraint.setSource(lowerArm);
	elbowRollConstraint.setRollAxis("Y");
	elbowRollConstraint.setWeight(0.5);
	rollElbow.setExtension(VRMCNodeConstraint.EXTENSION_NAME, elbowRollConstraint);

	// Create hand roll constraint bone (as child of lower arm)
	const rollHand = document.createNode(`J_Roll_${side}_Hand`);
	const handTranslation = hand.getTranslation();
	rollHand.setTranslation([
		handTranslation[0] - 0.005, // Position slightly before hand joint
		handTranslation[1],
		handTranslation[2],
	]);
	rollHand.setRotation([0, 0, 0, 1]);
	lowerArm.addChild(rollHand);

	// Create hand roll constraint - follows hand rotation with full weight
	const handRollConstraint = vrmcNodeConstraint.createNodeConstraint();
	handRollConstraint.setSpecVersion("1.0");
	handRollConstraint.setSource(hand);
	handRollConstraint.setRollAxis("X");
	handRollConstraint.setWeight(1.0);
	rollHand.setExtension(VRMCNodeConstraint.EXTENSION_NAME, handRollConstraint);

	// Create lower arm roll constraint bone (as child of lower arm)
	const rollLowerArm = document.createNode(`J_Roll_${side}_LowerArm`);
	rollLowerArm.setTranslation([
		handTranslation[0] * 0.5, // Position halfway to hand
		handTranslation[1],
		handTranslation[2],
	]);
	rollLowerArm.setRotation([0, 0, 0, 1]);
	lowerArm.addChild(rollLowerArm);

	// Create lower arm roll constraint - follows hand rotation with half weight
	const lowerArmRollConstraint = vrmcNodeConstraint.createNodeConstraint();
	lowerArmRollConstraint.setSpecVersion("1.0");
	lowerArmRollConstraint.setSource(hand);
	lowerArmRollConstraint.setRollAxis("X");
	lowerArmRollConstraint.setWeight(0.5);
	rollLowerArm.setExtension(VRMCNodeConstraint.EXTENSION_NAME, lowerArmRollConstraint);

	// Optional: Add additional aim constraint bones for sleeve deformation
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

function addConstraintBonestoSkins(document: Document): void {
	const root = document.getRoot();
	const skins = root.listSkins();
	
	if (skins.length === 0) {
		console.warn("No skins found in the model");
		return;
	}

	// Find only the specific constraint bones we need for deformation
	const constraintBones = root.listNodes().filter(node => {
		const name = node.getName();
		return name === 'J_Roll_L_UpperArm' || 
		       name === 'J_Roll_R_UpperArm' ||
		       name === 'J_Roll_L_Elbow' ||
		       name === 'J_Roll_R_Elbow' ||
		       name === 'J_Roll_L_Hand' ||
		       name === 'J_Roll_R_Hand' ||
		       name === 'J_Roll_L_LowerArm' ||
		       name === 'J_Roll_R_LowerArm' ||
		       name === 'J_Aim_L_Shoulder' ||
		       name === 'J_Aim_R_Shoulder';
	});

	if (constraintBones.length === 0) {
		console.warn("No constraint bones found to add to skins");
		return;
	}

	// Only process the first skin that contains arm bones (avoid duplicates)
	let processedSkin = false;
	
	for (const skin of skins) {
		if (processedSkin) break;
		
		const existingJoints = skin.listJoints();
		
		// Check if this skin contains arm bones (indicates it's the main character skin)
		const hasArmBones = existingJoints.some(joint => 
			joint.getName().includes('UpperArm') || 
			joint.getName().includes('LowerArm') || 
			joint.getName().includes('Hand')
		);

		if (hasArmBones) {
			const inverseBindMatrices = skin.getInverseBindMatrices();
			if (!inverseBindMatrices) {
				console.warn("Skin has no inverse bind matrices");
				continue;
			}

			// Get current matrices and expand the array
			const currentMatrices = inverseBindMatrices.getArray();
			if (!currentMatrices) {
				console.warn("Could not get inverse bind matrices array");
				continue;
			}

			// Count bones that need to be added (not already in skin)
			const bonesToAdd = constraintBones.filter(bone => !existingJoints.includes(bone));
			
			if (bonesToAdd.length === 0) {
				console.log("All constraint bones already in skin");
				processedSkin = true;
				continue;
			}

			const matricesPerJoint = 16; // 4x4 matrix = 16 floats
			const newMatrices = new Float32Array(currentMatrices.length + (bonesToAdd.length * matricesPerJoint));
			newMatrices.set(currentMatrices);

			// Add each constraint bone to this skin with identity matrix
			let matrixIndex = currentMatrices.length;
			for (const bone of bonesToAdd) {
				skin.addJoint(bone);
				
				// Add identity matrix for the new joint (identity = no transformation)
				const identityMatrix = [
					1, 0, 0, 0,
					0, 1, 0, 0,
					0, 0, 1, 0,
					0, 0, 0, 1
				];
				
				for (let i = 0; i < 16; i++) {
					newMatrices[matrixIndex + i] = identityMatrix[i];
				}
				matrixIndex += 16;
				
				console.log(`Added ${bone.getName()} to skin joints with identity matrix`);
			}

			// Update the inverse bind matrices
			inverseBindMatrices.setArray(newMatrices);
			processedSkin = true;
		}
	}
}
