/**
 * Created by Bob on 7/12/2017.
 */

let _ = require('lodash');
const profiler = require('screeps-profiler');

function role(creep) {
    creep.room.cacheRoomIntel();
    let sayings = ['Dont Mind Me', 'Beep Beep', 'Just Saying Hi', 'o/', ':D', ':)'];
    creep.say(_.sample(sayings), true);
    if (!creep.memory.destination) {
        let adjacent = Game.map.describeExits(creep.pos.roomName);
        let target = _.sample(adjacent);
        if (!Game.map.isRoomAvailable(target)) return creep.say("??");
        creep.memory.destination = target;
    }
    if (creep.memory.destinationReached !== true) {
        if (creep.pos.roomName === creep.memory.destination) {
            if (creep.room.controller && ((!creep.room.controller.sign || creep.room.controller.sign.username !== USERNAME) || Math.random() > 0.6) &&
                !creep.room.controller.owner && (!creep.room.controller.reservation || !_.includes(FRIENDLIES, creep.room.controller.reservation.username))) {
                let signs = EXPLORED_ROOM_SIGNS;
                if (Memory.roomCache[creep.room.name].claimValue) signs = ['Overlord AI Room Claim Value - ' + Memory.roomCache[creep.room.name].claimValue, 'Claim Value of ' + Memory.roomCache[creep.room.name].claimValue];
                if (Memory.roomCache[creep.room.name].needsCleaning) signs = ['Overlord AI Has Marked This Room For Cleaning'];
                if (Memory.roomCache[creep.room.name].potentialTarget) signs = ['Overlord AI Finds This Room Interesting, We Will Return'];
                switch (creep.signController(creep.room.controller, _.sample(signs))) {
                    case OK:
                        creep.memory.destinationReached = true;
                        break;
                    case ERR_NOT_IN_RANGE:
                        creep.shibMove(creep.room.controller, {offRoad: true});
                }
            } else if (!creep.moveToHostileConstructionSites()) {
                creep.memory.destinationReached = true;
            }
        } else {
            creep.shibMove(new RoomPosition(25, 25, creep.memory.destination), {
                allowHostile: true,
                offRoad: true,
                range: 23
            });
        }
    } else {
        creep.memory.destination = undefined;
        creep.memory.destinationReached = undefined;
    }
}

module.exports.role = profiler.registerFN(role, 'explorerRole');
