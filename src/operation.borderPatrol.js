Creep.prototype.borderPatrol = function () {
    let sentence = [ICONS.respond, 'Border', 'Patrol'];
    let word = Game.time % sentence.length;
    this.say(sentence[word], true);
    // Set squad leader
    let squadLeader = _.filter(Game.creeps, (c) => c.memory && c.memory.overlord === this.memory.overlord && c.memory.operation === 'borderPatrol' && c.memory.squadLeader);
    if (!squadLeader.length) this.memory.squadLeader = true;
    // Handle squad leader
    if (this.memory.squadLeader) {
        let squadMember = _.filter(Game.creeps, (c) => c.memory && c.memory.overlord === this.memory.overlord && c.memory.operation === 'borderPatrol' && !c.memory.squadLeader);
        if (!squadMember.length || (this.pos.getRangeTo(squadMember[0]) > 1 && !this.borderCheck())) return this.attackInRange();
        if (this.hits === this.hitsMax && squadMember[0].hits < squadMember[0].hitsMax) {
            this.heal(squadMember[0]);
        } else if (this.hits < this.hitsMax) {
            this.heal(this);
        }
        if (!this.handleMilitaryCreep(false, false)) {
            if (this.memory.responseTarget && this.room.name !== this.memory.responseTarget) return this.shibMove(new RoomPosition(25, 25, this.memory.responseTarget), {range: 22});
            // If on target, be available to respond
            this.memory.awaitingOrders = this.room.name === this.memory.responseTarget;
            if (!this.memory.onTarget) this.memory.onTarget = Game.time;
            // Idle in target rooms for 20 ticks
            if (this.memory.onTarget + 20 <= Game.time) {
                let remotes = Game.rooms[this.memory.overlord].memory.remoteRooms;
                this.memory.responseTarget = _.sample(remotes);
                this.memory.onTarget = undefined;
                return this.say(this.memory.responseTarget);
            }
            if (this.pos.getRangeTo(new RoomPosition(25, 25, this.memory.responseTarget)) > 18) return this.shibMove(new RoomPosition(25, 25, this.memory.responseTarget), {range: 17});
            this.idleFor(5);
        }
    } else {
        this.shibMove(squadLeader[0], {range: 0});
        if (this.hits === this.hitsMax && squadLeader[0].hits < squadLeader[0].hitsMax) {
            this.heal(squadLeader[0]);
        } else if (this.hits < this.hitsMax) {
            this.heal(this);
        }
        this.attackInRange();
        // If squad leader is idle you idle
        if (squadLeader[0].memory.idle) this.idleFor(squadLeader[0].memory.idle - Game.time);
    }
};