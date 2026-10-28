
const MODULE = "marvel5e-powersets-starter";
Hooks.once("ready", async () => {
  if (!game.user.isGM) return;
  const powersets = await (await fetch(`modules/${MODULE}/data/powersets.json`)).json();
  const flag = game.settings.get(MODULE, "installed");
  if (flag) return;
  let created = 0;
  for (const [category, names] of Object.entries(powersets)) {
    const label = `Marvel 5E • ${category}`;
    let pack = game.packs.find(p => p.metadata.label === label && p.metadata.type === "Item");
    if (!pack) pack = await CompendiumCollection.createCompendium({label, type:"Item", package:"world", name:`m5e-${category.toLowerCase()}`});
    if (pack.locked) await pack.configure({locked:false});
    const existing = new Set((await pack.getIndex()).map(x=>x.name));
    const documents = names.filter(n=>!existing.has(n)).map(name=>({
      name, type:"feat", img:"icons/magic/symbols/rune-sigil-violet.webp",
      system:{description:{value:`<p><strong>Powerset :</strong> ${name}</p><p><strong>Catégorie :</strong> ${category}</p><p>Fiche de référence du powerset. Pour les règles, niveaux et pouvoirs, consulter le manuel Marvel: 5E. Ce catalogue ne reproduit pas les descriptions du livre.</p>`}},
      flags:{[MODULE]:{category, source:"Marvel: 5E Player's Handbook — GM Binder"}}
    }));
    if (documents.length) await Item.createDocuments(documents,{pack:pack.collection});
    created += documents.length;
  }
  await game.settings.set(MODULE,"installed",true);
  ui.notifications.info(`Marvel 5E : ${created} fiches de powersets installées dans cinq compendiums de monde.`);
});
Hooks.once("init",()=>game.settings.register(MODULE,"installed",{name:"Catalogue initialisé",scope:"world",config:false,type:Boolean,default:false}));
