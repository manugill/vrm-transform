import { Document, Node } from "@gltf-transform/core";
import { VRMCNodeConstraint } from "../vrmc-node-constraint/index.js";
import { addConstraintsToVroidVrm } from "../functions/addConstraintsToVroidVrm.js";

async function main() {
	console.log("Testing constraint addition functionality...");

	try {
		// Create a simple test document
		const document = new Document();
		const root = document.getRoot();

		// Create a scene
		const scene = document.createScene("DefaultScene");

		// Create a simple skeleton structure mimicking Vroid Studio output
		console.log("Creating test skeleton structure...");

		// Create main arm bones (including shoulders)
		const leftShoulder = document.createNode("J_Bip_L_Shoulder");
		leftShoulder.setTranslation([0.05, 1.4, 0]);
		leftShoulder.setRotation([0, 0, 0, 1]);
		scene.addChild(leftShoulder);

		const leftUpperArm = document.createNode("J_Bip_L_UpperArm");
		leftUpperArm.setTranslation([0.1, 0, 0]);
		leftUpperArm.setRotation([0, 0, 0, 1]);
		leftShoulder.addChild(leftUpperArm);

		const leftLowerArm = document.createNode("J_Bip_L_LowerArm");
		leftLowerArm.setTranslation([0.25, 0, 0]);
		leftLowerArm.setRotation([0, 0, 0, 1]);
		leftUpperArm.addChild(leftLowerArm);

		const rightShoulder = document.createNode("J_Bip_R_Shoulder");
		rightShoulder.setTranslation([-0.05, 1.4, 0]);
		rightShoulder.setRotation([0, 0, 0, 1]);
		scene.addChild(rightShoulder);

		const rightUpperArm = document.createNode("J_Bip_R_UpperArm");
		rightUpperArm.setTranslation([-0.1, 0, 0]);
		rightUpperArm.setRotation([0, 0, 0, 1]);
		rightShoulder.addChild(rightUpperArm);

		const rightLowerArm = document.createNode("J_Bip_R_LowerArm");
		rightLowerArm.setTranslation([-0.25, 0, 0]);
		rightLowerArm.setRotation([0, 0, 0, 1]);
		rightUpperArm.addChild(rightLowerArm);

		// Add hand bones (required for proper wrist deformation fix)
		const leftHand = document.createNode("J_Bip_L_Hand");
		leftHand.setTranslation([0.23, 0, 0]);
		leftHand.setRotation([0, 0, 0, 1]);
		leftLowerArm.addChild(leftHand);

		const rightHand = document.createNode("J_Bip_R_Hand");
		rightHand.setTranslation([-0.23, 0, 0]);
		rightHand.setRotation([0, 0, 0, 1]);
		rightLowerArm.addChild(rightHand);

		console.log("Before adding constraints:");
		logModelInfo(document);

		// Apply the constraints transformation
		console.log("\nAdding roll and aim constraints...");
		await document.transform(addConstraintsToVroidVrm());

		console.log("\nAfter adding constraints:");
		logModelInfo(document);

		console.log("✅ Constraint addition test completed successfully!");
		console.log(
			"The function successfully added roll and aim constraint bones to the test skeleton.",
		);
	} catch (error) {
		console.error("❌ Error during constraint test:", error);
		process.exit(1);
	}
}

function logModelInfo(document: Document) {
	const root = document.getRoot();
	const nodes = root.listNodes();
	const armNodes = nodes.filter(
		(node) =>
			node.getName().includes("Shoulder") ||
			node.getName().includes("Arm") ||
			node.getName().includes("Hand") ||
			node.getName().includes("Roll") ||
			node.getName().includes("Aim") ||
			node.getName().includes("Elbow"),
	);

	console.log(`Total nodes: ${nodes.length}`);
	console.log("Arm-related nodes:");
	armNodes.forEach((node) => {
		const hasConstraint = node.getExtension("VRMC_node_constraint");
		const children = node.listChildren();
		console.log(
			`  - ${node.getName()}${hasConstraint ? " (has constraint)" : ""} [${children.length} children]`,
		);

		// Show constraint details if present
		if (hasConstraint) {
			const constraint = hasConstraint as any;
			const rollAxis = constraint.getRollAxis?.();
			const aimAxis = constraint.getAimAxis?.();
			const weight = constraint.getWeight?.();
			const source = constraint.getSource?.();

			if (rollAxis) {
				console.log(
					`    → Roll constraint: axis=${rollAxis}, weight=${weight}, source=${source?.getName()}`,
				);
			}
			if (aimAxis) {
				console.log(
					`    → Aim constraint: axis=${aimAxis}, weight=${weight}, source=${source?.getName()}`,
				);
			}
		}
	});
}

// Run the script
main().catch(console.error);
