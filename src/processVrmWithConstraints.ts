import { NodeIO, Document, VertexLayout } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import * as fs from "fs";
import { VRMCVrm } from "./vrmc-vrm/index.js";
import { VRMCNodeConstraint } from "./vrmc-node-constraint/index.js";
import { VRMCSpringBone } from "./vrmc-springbone/index.js";
import { VRMCMaterialsMToon } from "./vrmc-materials-mtoon/index.js";
import { addConstraintsToVroidVrm } from "./functions/addConstraintsToVroidVrm.js";
import { MeshoptDecoder, MeshoptEncoder } from "meshoptimizer";

/**
 * Process VRM files by adding roll and aim constraints for better wrist deformation.
 * This script is specifically designed for VRM files exported from Vroid Studio,
 * which lack the necessary twist bones and constraints.
 */
async function main() {
	const inputFile = process.argv[2];

	if (!inputFile) {
		console.log("Usage: bun run src/processVrmWithConstraints.ts <input-vrm-file>");
		console.log(
			"Example: bun run src/processVrmWithConstraints.ts Vroid_VRM1_Model.vrm",
		);
		console.log("");
		console.log(
			"This script adds roll and aim constraints to VRM models exported from Vroid Studio.",
		);
		console.log(
			"The constraints improve wrist deformation by adding twist bones that follow hand rotation.",
		);
		process.exit(1);
	}

	const inputPath = `input/${inputFile}`;
	const outputFile = inputFile.replace(/\.(vrm|vrmgltf)$/i, "_with_constraints.vrm");
	const outputPath = `output/${outputFile}`;

	// Configure I/O with all VRM extensions
	const io = new NodeIO()
		.registerExtensions([
			...ALL_EXTENSIONS,
			VRMCVrm,
			VRMCMaterialsMToon,
			VRMCNodeConstraint,
			VRMCSpringBone,
		])
		.registerDependencies({
			"meshopt.decoder": MeshoptDecoder,
			"meshopt.encoder": MeshoptEncoder,
		});

	try {
		console.log(`🔍 Reading VRM file: ${inputPath}`);

		if (!fs.existsSync(inputPath)) {
			console.error(`❌ Input file not found: ${inputPath}`);
			console.log("Please place your VRM file in the input/ directory.");
			process.exit(1);
		}

		const document = await io.read(inputPath);

		console.log("📊 Original model info:");
		logModelInfo(document);

		// Check if the model already has constraints
		const hasExistingConstraints = checkForExistingConstraints(document);
		if (hasExistingConstraints) {
			console.log(
				"⚠️  This model already appears to have constraints. Proceeding anyway...",
			);
		}

		// Apply the constraints transformation
		console.log("\n🔧 Adding roll and aim constraints...");
		await document.transform(addConstraintsToVroidVrm());

		console.log("\n📊 Model info after adding constraints:");
		logModelInfo(document);

		// Use SEPARATE vertex layout for better compatibility (required for UniVRM >v0.127.2)
		io.setVertexLayout(VertexLayout.SEPARATE);

		// Ensure output directory exists
		if (!fs.existsSync("output")) {
			fs.mkdirSync("output");
		}

		console.log(`\n💾 Writing modified VRM file: ${outputPath}`);
		const glb = await io.writeBinary(document);
		fs.writeFileSync(outputPath, glb);

		console.log("✅ Successfully added constraints to VRM model!");
		console.log(`📁 Output saved to: ${outputPath}`);
		console.log("");
		console.log("🎯 What was added:");
		console.log("   • Roll constraint bones for upper arms (50% twist transfer)");
		console.log("   • Roll constraint bones for lower arms (50% twist transfer)");
		console.log("   • Aim constraint bones for sleeve/clothing deformation");
		console.log("   • Secondary bones for detailed deformation");
		console.log("");
		console.log(
			"💡 These constraints will improve wrist deformation when the hands rotate,",
		);
		console.log(
			"   preventing the 'candy wrapper' effect common in Vroid Studio exports.",
		);
	} catch (error) {
		console.error("❌ Error processing VRM file:", error);

		if (error instanceof Error) {
			if (error.message.includes("ENOENT")) {
				console.log("\n💡 Troubleshooting:");
				console.log(
					"   • Make sure the input file exists in the input/ directory",
				);
				console.log(
					"   • Check that all referenced assets (textures, etc.) are available",
				);
			} else if (error.message.includes("VRMC_node_constraint")) {
				console.log("\n💡 This might be a constraint-related issue:");
				console.log("   • The model might already have constraints");
				console.log("   • Try using a clean Vroid Studio export");
			}
		}

		process.exit(1);
	}
}

function logModelInfo(document: Document) {
	const root = document.getRoot();
	const nodes = root.listNodes();
	const armNodes = nodes.filter(
		(node) =>
			node.getName().includes("Arm") ||
			node.getName().includes("Roll") ||
			node.getName().includes("Aim") ||
			node.getName().includes("Sec_"),
	);

	const constraintNodes = nodes.filter((node) => node.getExtension("VRMC_node_constraint"));

	console.log(`   Total nodes: ${nodes.length}`);
	console.log(`   Constraint nodes: ${constraintNodes.length}`);
	console.log(`   Arm-related nodes: ${armNodes.length}`);

	if (armNodes.length > 0) {
		console.log("   Arm bone structure:");
		armNodes.forEach((node) => {
			const hasConstraint = node.getExtension("VRMC_node_constraint");
			const children = node.listChildren();
			const indent = hasConstraint ? "     🔗" : "     •";
			console.log(`${indent} ${node.getName()} [${children.length} children]`);

			// Show constraint details if present
			if (hasConstraint) {
				const constraint = hasConstraint as any;
				const rollAxis = constraint.getRollAxis?.();
				const aimAxis = constraint.getAimAxis?.();
				const weight = constraint.getWeight?.();
				const source = constraint.getSource?.();

				if (rollAxis) {
					console.log(
						`       → Roll: axis=${rollAxis}, weight=${weight}, source=${source?.getName()}`,
					);
				}
				if (aimAxis) {
					console.log(
						`       → Aim: axis=${aimAxis}, weight=${weight}, source=${source?.getName()}`,
					);
				}
			}
		});
	}
}

function checkForExistingConstraints(document: Document): boolean {
	const root = document.getRoot();
	const nodes = root.listNodes();

	// Check for existing constraint nodes
	const hasConstraintExtensions = nodes.some((node) =>
		node.getExtension("VRMC_node_constraint"),
	);

	// Check for roll/aim bone names
	const hasConstraintBones = nodes.some((node) => {
		const name = node.getName();
		return name.includes("Roll_") || name.includes("Aim_") || name.includes("Twist_");
	});

	return hasConstraintExtensions || hasConstraintBones;
}

// Run the script
main().catch(console.error);
