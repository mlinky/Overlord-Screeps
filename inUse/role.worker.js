let pathFinder = require('module.pathFinder');
var roleWorker = {

    /** @param {Creep} creep **/
    run: function (creep) {
        if (rangeSource(creep) === 1) {
            creep.moveTo(Game.flags.bump);
            return null;
        }

        if (creep.carry.energy === 0) {
            creep.memory.working = null;
        }
        if (creep.carry.energy === creep.carryCapacity) {
            creep.memory.working = true;
        }

        if (creep.memory.working) {
            var repairNeeded = findRepair(creep);
            if (repairNeeded) {
                repairNeeded = Game.getObjectById(repairNeeded);
                if (creep.repair(repairNeeded) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(repairNeeded, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
        else {
            var container = findContainer(creep);
            container = Game.getObjectById(container);
            if (container) {
                if (creep.withdraw(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(container, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            }
            if (!container) {
                let goals = _.map(creep.room.find(FIND_DROPPED_ENERGY), function (source) {
                    return {pos: source.pos}
                });

                var energy = creep.pos.findClosestByRange(FIND_DROPPED_ENERGY);
                if (energy) {
                    if (creep.pickup(energy) === ERR_NOT_IN_RANGE) {
                        creep.move(creep.pos.getDirectionTo(pathFinder.run(creep, goals, false)));
                    }
                }
            }
        }
    }
};

module.exports = roleWorker;

function findContainer(creep) {

    var container = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 1000});
    if (container) {
        creep.memory.container = container.id;
        return container.id;
    }

    var container = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 500});
    if (container) {
        creep.memory.container = container.id;
        return container.id;
    }

    var container = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 100});
    if (container) {
        creep.memory.container = container.id;
        return container.id;
    }
    return null;
}

function findRepair(creep) {

    site = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s) => s.structureType === STRUCTURE_SPAWN && s.hits < s.hitsMax});
    if (site === null) {
        site = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s) => s.structureType === STRUCTURE_RAMPART && s.hits < 100});
    }
    if (site === null) {
        site = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s) => s.structureType === STRUCTURE_EXTENSION && s.hits < s.hitsMax});
    }
    if (site === null) {
        site = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s) => s.structureType !== STRUCTURE_WALL && s.structureType !== STRUCTURE_ROAD && s.structureType !== STRUCTURE_CONTAINER && s.structureType !== STRUCTURE_RAMPART && s.hits < s.hitsMax});
    }
    if (site === null) {
        site = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s) => s.structureType === STRUCTURE_CONTAINER && s.hits < 1000});
    }
    if (site === null) {
        site = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s) => s.structureType === STRUCTURE_ROAD && s.hits < s.hitsMax/2});
    }
    if (site === null) {
        site = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s) => s.structureType === STRUCTURE_WALL && s.hits < 1000});
    }
    if (site !== null && site !== undefined) {
        return site.id;
    }
}

function rangeSource(creep) {
    var source = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
    if (creep.pos.getRangeTo(source) === 1) {
        return 1;
    }
    return null;
}
