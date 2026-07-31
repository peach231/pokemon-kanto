// pokemon-kanto — move_anims.js
// Which animation each of the 165 moves plays.
//
// The engine already had four signature effects (bolt, quake, beam, leaf) and
// not one move referenced them, so every attack in the game rendered as the
// same generic type-coloured puff. This is the table that connects them, plus
// the vocabulary needed to cover the rest of the roster.
//
// The mapping is deliberately by LOOK rather than by type: Bubblebeam and
// Hydro Pump are both water, but one is a stream of bubbles and the other is a
// firehose, and a player can tell those apart at a glance. Where a move has no
// distinctive look, it falls back to its type's house style, which is what
// TYPE_ANIM at the bottom is for.

(function () {
  G.MOVE_ANIM = {
    // ---- electric ----
    thunderbolt: 'bolt', thunder: 'bolt', thundershock: 'spark', thunderpunch: 'punch',
    thunderwave: 'ring',

    // ---- fire ----
    ember: 'ember', flamethrower: 'flame', firespin: 'vortex', fireblast: 'flame',
    firepunch: 'punch',

    // ---- water ----
    watergun: 'jet', bubble: 'bubble', bubblebeam: 'bubble', hydropump: 'jet',
    surf: 'wave', waterfall: 'wave', clamp: 'bite', crabhammer: 'punch', withdraw: 'guard',

    // ---- ice ----
    icebeam: 'beam', blizzard: 'blizzard', icepunch: 'punch', aurorabeam: 'beam',
    haze: 'fog', mist: 'fog',

    // ---- grass ----
    vinewhip: 'lash', razorleaf: 'leaf', petaldance: 'leaf', solarbeam: 'beam',
    absorb: 'drain', megadrain: 'drain', leechseed: 'seed', spore: 'powder',
    sleeppowder: 'powder', stunspore: 'powder', poisonpowder: 'powder',

    // ---- ground / rock ----
    earthquake: 'quake', fissure: 'quake', dig: 'dig',
    boneclub: 'toss', bonemerang: 'toss', rockslide: 'rocks', rockthrow: 'rocks',
    sandattack: 'sand',

    // ---- flying ----
    gust: 'wind', whirlwind: 'wind', wingattack: 'slash', fly: 'fly',
    peck: 'jab', drillpeck: 'drill', skyattack: 'dive', mirrormove: 'ring',

    // ---- fighting ----
    karatechop: 'chop', doublekick: 'kick', jumpkick: 'kick', hijumpkick: 'kick',
    rollingkick: 'kick', megapunch: 'punch', megakick: 'kick', submission: 'slam',
    seismictoss: 'slam', lowkick: 'kick', counter: 'guard', strength: 'punch',

    // ---- poison ----
    poisonsting: 'sting', acid: 'splash', sludge: 'splash', smog: 'fog',
    toxic: 'drip', poisongas: 'fog', twineedle: 'sting', pinmissile: 'sting',

    // ---- psychic ----
    confusion: 'psy', psychic: 'psy', psybeam: 'beam', hypnosis: 'ring',
    dreameater: 'drain', teleport: 'blink', barrier: 'guard', lightscreen: 'guard',
    reflect: 'guard', amnesia: 'ring', agility: 'streak', kinesis: 'psy',
    psywave: 'psy', meditate: 'aura', rest: 'sleep',

    // ---- ghost ----
    lick: 'lash', nightshade: 'wisp', confuseray: 'wisp',

    // ---- bug ----
    stringshot: 'web', leechlife: 'drain',

    // ---- dragon ----
    dragonrage: 'flame',

    // ---- normal, and the odd ones ----
    tackle: 'slam', bodyslam: 'slam', takedown: 'slam', doubleedge: 'slam',
    headbutt: 'slam', hornattack: 'jab', furyattack: 'jab', horndrill: 'drill',
    scratch: 'slash', cut: 'slash', slash: 'slash', furyswipes: 'slash',
    bite: 'bite', hyperfang: 'bite', superfang: 'bite',
    wrap: 'coil', bind: 'coil', constrict: 'coil',
    quickattack: 'streak', swift: 'star', triattack: 'star',
    hyperbeam: 'hyper', selfdestruct: 'explode', explosion: 'explode', eggbomb: 'lob',
    payday: 'coin', sonicboom: 'ring',
    growl: 'ring', roar: 'ring', leer: 'glare', tailwhip: 'ring', screech: 'ring',
    supersonic: 'ring', sing: 'note', lovelykiss: 'note',
    growth: 'aura', swordsdance: 'aura', sharpen: 'aura', defensecurl: 'guard',
    harden: 'guard', doubleteam: 'blink', minimize: 'blink', focusenergy: 'aura',
    recover: 'heal', softboiled: 'heal', splash: 'flop', transform: 'blink',
    substitute: 'blink', metronome: 'ring', mimic: 'ring', conversion: 'ring',
    disable: 'ring', bide: 'aura', rage: 'aura', thrash: 'slam', skullbash: 'slam',
    razorwind: 'wind', flash: 'blink', smokescreen: 'fog', acidarmor: 'guard',
    spikecannon: 'sting', barrage: 'lob', dizzypunch: 'punch', cometpunch: 'punch',
    doubleslap: 'slap', slam: 'slam', stomp: 'slam',
  };

  // House style per type, for anything the table above does not name.
  G.TYPE_ANIM = {
    electric: 'spark', fire: 'ember', water: 'jet', ice: 'beam', grass: 'leaf',
    ground: 'quake', rock: 'rocks', flying: 'wind', fighting: 'punch',
    poison: 'splash', psychic: 'psy', ghost: 'wisp', bug: 'sting',
    dragon: 'flame', normal: 'slam'
  };

  // Every animation key the engine knows how to draw. tools/check.js fails if
  // the table above names one that is not in here — a typo would silently fall
  // back to the generic puff this file exists to replace.
  G.ANIM_KINDS = [
    'bolt', 'spark', 'quake', 'beam', 'leaf', 'ember', 'flame', 'vortex',
    'jet', 'bubble', 'wave', 'blizzard', 'fog', 'lash', 'drain', 'seed',
    'powder', 'dig', 'toss', 'rocks', 'sand', 'wind', 'fly', 'jab', 'drill',
    'dive', 'chop', 'kick', 'punch', 'slam', 'slap', 'guard', 'sting',
    'splash', 'drip', 'psy', 'blink', 'streak', 'aura', 'sleep', 'wisp',
    'web', 'star', 'hyper', 'explode', 'lob', 'coin', 'ring', 'glare',
    'note', 'heal', 'flop', 'bite', 'slash', 'coil'
  ];

  G.animFor = function (move) {
    if (!move) return 'slam';
    return G.MOVE_ANIM[move.id] || G.TYPE_ANIM[move.type] || 'slam';
  };
})();
