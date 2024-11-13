import { Node, type Document, type Transform } from '@gltf-transform/core';
import { createTransform } from '@gltf-transform/functions';
import { VRMC_SPRINGBONE } from '../constants';
import type { Springbones } from '../vrmc-springbone';
import { ColliderGroup } from '../vrmc-springbone/collider-group';
import type { Collider } from '../vrmc-springbone/collider';

const NAME = 'pruneSpringbones';

const EPSILON = Number.EPSILON;

/**
 * Checks all springbones and removes any joints that serve no (visual) purpose.
 * In case all joints of a bone can be removed, the bone itself will be removed.
 */
export function pruneSpringbones(): Transform {
  return createTransform(NAME, async (document: Document): Promise<void> => {
    const logger = document.getLogger();
    const root = document.getRoot();

    const stats = {
      joints: 0,
      springbones: 0,
      colliders: 0,
      colliderGroups: 0,
    };

    const springbones = root.getExtension<Springbones>(VRMC_SPRINGBONE);
    if(!springbones) {
      logger.warn('No spring bones to prune in pruneSpringbones');
      return;
    }

    // Remove degenerate colliders
    // FIXME: Take fallback colliders into account when using `VRMC_springBone_extended_collider`
    for(const collider of springbones.listColliders()) {
      if(collider.getRadius() <= EPSILON) {
        springbones.removeCollider(collider);
        collider.dispose();
        stats.colliders++;
      }
    }

    // List all bones that can deform a skinned mesh.
    const bones = new Set<Node>();
    root.listSkins().forEach(skin => {
      skin.listJoints().forEach(joint => {
        bones.add(joint);
      });
    });

    // Determine which joints can be removed
    const usedColliderGroups = new Set<ColliderGroup>();
    for(const spring of springbones.listSprings()) {
      // Iterate over joints in reverse order.
      const joints = spring.listJoints();
      for(let i = joints.length - 1; i > 0; i--) {
        const joint = joints[i];
        const jointNode = joint.getNode();
        // Note: Only remove joint if parent node is not relevant.
        //       This is needed as rotation of a joint is based on its child.
        const parentJointNode = joints[i - 1].getNode();
        if(!jointNode || !parentJointNode || !isNodeRelevant(parentJointNode, bones)) {
          // Joint effects node that is not relevant, safe to remove
          spring.removeJoint(joint);
          joint.dispose();
          stats.joints++;
          joints.length--;
        } else {
          break;
        }
      }

      // Remove final joint if reduced to a single joint.
      if(joints.length === 1) {
        spring.removeJoint(joints[0]);
        joints[0].dispose();
        stats.joints++;
        springbones.removeSpring(spring);
        spring.dispose();
        stats.springbones++;
      } else {
        // Mark all collider groups as used
        spring.listColliderGroups().forEach(group => usedColliderGroups.add(group));
      }
    }

    // Determine which collider groups go unused
    const usedColliders = new Set<Collider>();
    for(const colliderGroup of springbones.listColliderGroups()) {
      if(!usedColliderGroups.has(colliderGroup)) {
        springbones.removeColliderGroup(colliderGroup);
        colliderGroup.dispose();
        stats.colliderGroups++;
      } else {
        colliderGroup.listColliders().forEach(collider => usedColliders.add(collider));
      }
    }

    // Determine which colliders go unused
    for(const collider of springbones.listColliders()) {
      if(!usedColliders.has(collider)) {
        springbones.removeCollider(collider);
        collider.dispose();
        stats.colliders++;
      }
    }

    // Report result
    logger.info(`pruneSpringbones: Removed ${stats.joints} joint(s), ${stats.springbones} springbone(s), ${stats.colliders} collider(s), ${stats.colliderGroups} colliderGroup(s)`);
  });
}

function isNodeRelevant(node: Node, bones: Set<Node>): boolean {
  // Node holds a mesh
  if(node.getMesh()) {
    return true;
  }

  // Node is a bone (that's used in a skeleton).
  if(bones.has(node)) {
    return true;
  }

  // Nodes has descendants that are relevant.
  return node.listChildren().some(child => isNodeRelevant(child, bones));
}