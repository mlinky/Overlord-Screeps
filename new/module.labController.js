/**
 * Created by Bob on 6/24/2017.
 */

const profiler = require('screeps-profiler');
let _ = require('lodash');

function labManager() {
    for (let key in Memory.ownedRooms) {
        if (Memory.ownedRooms[key].controller.level < 6) return;
        let room = Memory.ownedRooms[key];
        let reactionRoom = _.filter(Memory.ownedRooms, (r) => r.memory.reactionRoom)[0];
        if (!reactionRoom) room.memory.reactionRoom = true;
        if (room.memory.reactionRoom) manageReactions(room);
    }
}

module.exports.labManager = profiler.registerFN(labManager, 'labManager');

function manageReactions(room) {
    let storage = _.filter(room.structures, (s) => s.structureType === STRUCTURE_STORAGE)[0];
    let terminal = _.filter(room.structures, (s) => s.structureType === STRUCTURE_TERMINAL)[0];
    let activeLabs = _.filter(room.structures, (s) => s.structureType === STRUCTURE_LAB && (room.memory.reactions && room.memory.reactions[s.id]));
    for (let key in MAKE_THESE_BOOSTS) {
        let boost = MAKE_THESE_BOOSTS[key];
        if (room.memory.activeReaction) break;
        let componentOne = BOOST_COMPONENTS[boost][0];
        let componentTwo = BOOST_COMPONENTS[boost][1];
        if (((storage.store[componentOne] || 0 + terminal.store[componentOne] || 0) > 500) && ((storage.store[componentTwo] || 0 + terminal.store[componentTwo] || 0) > 500)) {
            let availableLabs = _.filter(room.structures, (s) => s.structureType === STRUCTURE_LAB && !Memory.structures[s.id].active && s.pos.findInRange(room.structures, 3, {filter: (l) => l.structureType === STRUCTURE_LAB && !Memory.structures[s.id].active}).length >= 2)[0];
            if (availableLabs) {
                log.a(room.name + ' queued ' + boost + ' for creation.');
                room.memory.activeReaction = boost;
                let hub = availableLabs.pos.findInRange(room.structures, 3, {filter: (s) => s.structureType === STRUCTURE_LAB && !Memory.structures[s.id].active});
                for (let labID in hub) {
                    let one = _.filter(hub, (h) => Memory.structures[h.id].itemNeeded === componentOne)[0];
                    let two = _.filter(hub, (h) => Memory.structures[h.id].itemNeeded === componentTwo)[0];
                    let out = _.filter(hub, (h) => Memory.structures[h.id].itemNeeded === boost)[0];
                    if (!one) {
                        Memory.structures[hub[labID].id] = {
                            itemNeeded: componentOne,
                            creating: boost,
                            active: true
                        };
                    } else if (!two) {
                        Memory.structures[hub[labID].id] = {
                            itemNeeded: componentTwo,
                            creating: boost,
                            active: true
                        };
                    } else if (!out) {
                        Memory.structures[hub[labID].id] = {
                            creating: boost,
                            active: true
                        };
                    }
                }
            }
        }
    }
}