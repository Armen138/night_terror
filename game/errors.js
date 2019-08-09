const errors = {
    _not_found: [
        "This item doesn't appear to be around here.",
        "You look around for a bit, but can't find that anywhere.",
        "You want WHAT?",
        "Are you sure you saw that here?"
    ],
    _not_in_inventory: [
        "You don't have any of those",
        "You're not carrying that.",
        "You checked all your pockets, it's not there."
    ],
    _inventory_full: [
        "You don't have space to carry more items!",
        "No pockets left to stuff that into.",
        "No can do, buckaroo. No space!",
        "You need more pockets!",
        "Your inventory is full. Drop stuff to make space!"
    ],
    _not_edible: [
        "You can't eat that.",
        "Pretty sure that won't taste good.",
        "That doesn't look healthy.",
        "Ew, that's nasty."
    ],
    _static_item: [
        "You can't take that.",
        "You try to move it, but it won't budge.",
        "Looks like it's stuck.",
        "But... how??",
        "That won't work.",
        "Hmm.... looks heavy, better leave that where it is."
    ],
    _cant_use: [
        "You can't use that here.",
        "There's nothing here to use that with",
        "You can't do that.",
        "No way, dude."
    ],
    _slot_used: [
        "You already have an item equipped for that slot",
        "You can't equip more items of that type",
        "That won't fit, try unequipping an item first."
    ],
    random_error(list) {
        let idx = Math.floor(Math.random() * list.length);
        return list[idx];
    },
    notfound() {
        return errors.random_error(errors._not_found);
    },
    inventoryfull() {
        return errors.random_error(errors._inventory_full);
    },
    notedible() {
        return errors.random_error(errors._not_edible);
    },
    notininventory() {
        return errors.random_error(errors._not_in_inventory);
    },
    staticitem() {
        return errors.random_error(errors._static_item);
    },
    cantuse() {
        return errors.random_error(errors._cant_use);
    },
    slotused() {
        return errors.random_error(errors._slot_used);
    }    
}

module.exports = errors;