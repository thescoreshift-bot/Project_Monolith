# Monolith — Full Trainer, Gym, Badge & Boss Roster

Per-region gyms: **8 gym trainers** + **8 gym leaders** (paired by badge), **8 unique badges** with perks, **1 region elite**, **1 region boss**.

---

## Region 1 — Verdant Circuit

**Theme:** Grass / Water / balanced · **Boss:** Verdant Apex (`region-boss-verdant`)  
**Route elite:** Elite Scout (`elite-scout`)

| Gym | Badge | Perk summary | Gym trainer | Gym leader |
|-----|-------|--------------|-------------|------------|
| 1 | Ember Badge | ATK +3, Fire +5% | Trainer Nova | Leader Pyra |
| 2 | Tide Badge | Water +5%, +5 HP after victory | Trainer Brook | Leader Marina |
| 3 | Bloom Badge | Grass +5%, Max HP +5 | Acolyte Fern | Leader Sylva |
| 4 | Volt Badge | Electric +5%, SPD +3 | Spark Rex | Leader Surge |
| 5 | Stone Badge | Ground +5%, DEF +3 | Boulder Hank | Leader Granite |
| 6 | Venom Badge | Grass +3%, SP.ATK +3 | Ivy Moss | Leader Toxin |
| 7 | Spirit Badge | Water +3%, SP.DEF +3 | Mist Lane | Leader Phantom |
| 8 | Apex Badge | All damage +5%, Max HP +5 | Ace Flint | Leader Apex |

---

## Region 2 — Ember Coast

**Theme:** Fire / Ground · **Boss:** Coastal Inferno (`region-boss-ember`)  
**Route elite:** Coast Hunter (`elite-coast-hunter`)

| Gym | Badge | Perk summary | Gym trainer | Gym leader |
|-----|-------|--------------|-------------|------------|
| 1 | Cinder Badge | Fire +6%, ATK +4 | Trainer Ashwick | Leader Magra |
| 2 | Magma Badge | Fire & Ground +4%, SP.ATK +4 | Trainer Slag | Leader Vulcano |
| 3 | Dune Badge | Ground +5%, DEF +4, Max HP +4 | Trainer Dray | Leader Sariah |
| 4 | Ash Badge | Fire +5%, SPD +4, +4 HP after victory | Trainer Smolder | Leader Cinderfall |
| 5 | Blaze Badge | Fire +7%, ATK & SP.ATK +3 | Trainer Kindle | Leader Inferna |
| 6 | Scorch Badge | Fire +3%, DEF +5 | Trainer Heatwave | Leader Brimstone |
| 7 | Furnace Badge | Fire +5%, SP.ATK +5 | Trainer Coal | Leader Kiln Vex |
| 8 | Inferno Badge | Fire & Ground +5%, all damage +4% | Trainer Pyrrha Ace | Leader Coast Sovereign |

---

## Region 3 — Storm Plateau

**Theme:** Electric / Ground · **Boss:** Plateau Tempest (`region-boss-storm`)  
**Route elite:** Storm Hunter (`elite-storm-hunter`)

| Gym | Badge | Perk summary | Gym trainer | Gym leader |
|-----|-------|--------------|-------------|------------|
| 1 | Gale Badge | Electric +5%, SPD +4 | Trainer Windcall | Leader Zephyr |
| 2 | Bolt Badge | Electric +6%, SP.ATK +4 | Trainer Jolt | Leader Voltara |
| 3 | Cliff Badge | Ground +5%, Electric +3%, DEF +4 | Trainer Ridge | Leader Stonearc |
| 4 | Surge Badge | Electric +5%, ATK +4, +6 HP after victory | Trainer Amp | Leader Striker |
| 5 | Ion Badge | Electric +4%, SP.DEF +4 | Trainer Static | Leader Ionius |
| 6 | Tempest Badge | Electric +5%, DEF & SP.DEF +3 | Trainer Galeforce | Leader Stormwall |
| 7 | Zenith Badge | Electric +6%, SPD & SP.ATK +3 | Trainer Peak | Leader Zenith Kane |
| 8 | Storm Crown Badge | Electric +5%, all damage +6%, SPD +4 | Trainer Storm Ace | Leader Tempest Crown |

---

## Region 4 — Obsidian Crown

**Theme:** Ground / Fire / elite pressure · **Boss:** Crown Warden (`region-boss-obsidian`)  
**Route elite:** Obsidian Hunter (`elite-obsidian-hunter`)

| Gym | Badge | Perk summary | Gym trainer | Gym leader |
|-----|-------|--------------|-------------|------------|
| 1 | Rift Badge | Ground +5%, ATK +5 | Trainer Fault | Leader Riftwalker |
| 2 | Obsidian Ember Badge | Fire +6%, SP.ATK +5 | Trainer Glass | Leader Obsidian Pyre |
| 3 | Ward Badge | Ground +6%, DEF +5, Max HP +6 | Trainer Bastion | Leader Wardian |
| 4 | Pulse Badge | Electric +5%, SP.ATK & SP.DEF +4 | Trainer Signal | Leader Pulse Kern |
| 5 | Shard Badge | Fire & Ground +4%, ATK +4, SPD +3 | Trainer Edge | Leader Shard Lord |
| 6 | Void Badge | Ground +4%, SP.DEF +5, +8 HP after victory | Trainer Haze | Leader Void Speaker |
| 7 | Throne Badge | Fire & Ground +5%, Max HP +8, DEF +4 | Trainer Court | Leader Throne Keeper |
| 8 | Crown Badge | Ground +5%, all damage +8%, ATK & DEF +4 | Trainer Crown Elite | Leader Monolith Rex |

---

## Wild & alpha encounters (all regions)

| ID | Name | Type | Kind |
|----|------|------|------|
| bristlebug | Bristlebug | Grass | normal |
| ashling | Ashling | Fire | normal |
| pebblemaw | Pebblemaw | Ground | normal |
| driftwisp | Driftwisp | Water | normal |
| voltimp | Voltimp | Electric | normal |
| alpha-bristlebug | Alpha Bristlebug | Grass | alpha |
| alpha-ashling | Alpha Ashling | Fire | alpha |
| alpha-pebblemaw | Alpha Pebblemaw | Ground | alpha |

---

## Badge ID reference (saves / maps)

**Verdant:** `ember-badge`, `tide-badge`, `bloom-badge`, `volt-badge`, `stone-badge`, `venom-badge`, `spirit-badge`, `apex-badge`

**Ember Coast:** `coast-cinder-badge` … `coast-inferno-badge`

**Storm Plateau:** `storm-gale-badge` … `storm-crown-badge`

**Obsidian Crown:** `obsidian-rift-badge` … `obsidian-crown-badge`

---

## Implementation notes

- Maps assign one **badge per row**; `gymLeader` and random `gymTrainer` nodes on that row share the same `badgeId`, so trainer/leader pairs match.
- Spawn logic: `regionGyms.ts` → `getTrainerIdForBadge` / `getLeaderIdForBadge`; templates in `gymRoster.ts`.
- Region 1 badge IDs unchanged for existing saves.
- Badge perks stack globally across all earned badges (party-wide).
