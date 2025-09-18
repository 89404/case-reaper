import User from '../models/User.js'
import Inventory from '../models/Inventory.js'
import CaseData from '../seed/cases.js'

const apiRoutes = (app) => {
  // Cases ophalen
  app.get('/api/cases', (req, res) => {
    res.json(CaseData.map(c => ({ ...c, skins: undefined })))
  })
  // Case openen
  app.get('/api/cases/open/:id', async (req, res) => {
    const csCase = CaseData.find(c => c._id === req.params.id)
    if (!csCase) return res.status(404).json({ error: 'Case niet gevonden' })
    const item = csCase.skins[Math.floor(Math.random() * csCase.skins.length)]
    if (req.user) {
      try {
        let inv = await Inventory.findOne({ userId: req.user._id })
        if (!inv) inv = await Inventory.create({ userId: req.user._id, items: [] })
        inv.items.push(item)
        await inv.save()
        await User.findByIdAndUpdate(req.user._id, { $inc: { totalValue: item.price, casesOpened: 1 } })
      } catch (error) {
        console.warn('Database error in case opening:', error.message)
        // Continue without saving to database
      }
    }
    res.json(item)
  })
  // Inventory ophalen
  app.get('/api/inventory', async (req, res) => {
    if (!req.user) return res.json([])
    try {
      const inv = await Inventory.findOne({ userId: req.user._id })
      res.json(inv ? inv.items : [])
    } catch (error) {
      console.warn('Database error in inventory:', error.message)
      res.json([]) // Return empty array when database is unavailable
    }
  })
  // Item toevoegen aan inventory
  app.post('/api/inventory/add', async (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Niet ingelogd' })
    const item = req.body
    if (!item || !item.name || !item.price) {
      return res.status(400).json({ error: 'Ongeldig item' })
    }
    try {
      let inv = await Inventory.findOne({ userId: req.user._id })
      if (!inv) inv = await Inventory.create({ userId: req.user._id, items: [] })
      inv.items.push(item)
      await inv.save()
      await User.findByIdAndUpdate(req.user._id, { $inc: { totalValue: item.price, casesOpened: 1 } })
      res.json({ success: true })
    } catch (error) {
      console.warn('Database error in inventory add:', error.message)
      res.json({ success: false, error: 'Database niet beschikbaar' })
    }
  })
  // Upgrade
  app.post('/api/upgrade/:itemId', async (req, res) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Niet ingelogd' })
    try {
      const inv = await Inventory.findOne({ userId: req.user._id })
      const item = inv.items.id(req.params.itemId)
      if (!item) return res.status(404).json({ success: false, message: 'Item niet gevonden' })
      if (Math.random() < 0.3) {
        // Succes: upgrade naar random duurder item
        const allSkins = CaseData.flatMap(c => c.skins)
        const better = allSkins.filter(s => s.price > item.price)
        if (!better.length) return res.json({ success: false, message: 'Geen betere items beschikbaar' })
        const upgrade = better[Math.floor(Math.random() * better.length)]
        item.name = upgrade.name
        item.image = upgrade.image
        item.price = upgrade.price
        await inv.save()
        await User.findByIdAndUpdate(req.user._id, { $inc: { totalValue: upgrade.price - item.price } })
        return res.json({ success: true, message: `Upgrade gelukt! Je hebt nu ${upgrade.name}` })
      } else {
        // Fail: verwijder item
        inv.items = inv.items.filter(i => i._id != req.params.itemId)
        await inv.save()
        return res.json({ success: false, message: 'Upgrade mislukt, item kwijt!' })
      }
    } catch (error) {
      console.warn('Database error in upgrade:', error.message)
      res.json({ success: false, message: 'Database niet beschikbaar' })
    }
  })
  // Leaderboard
  app.get('/api/leaderboard/value', async (req, res) => {
    try {
      const users = await User.find().sort({ totalValue: -1 }).limit(10)
      res.json(users)
    } catch (error) {
      console.warn('Database error in leaderboard/value:', error.message)
      res.json([]) // Return empty array when database is unavailable
    }
  })
  app.get('/api/leaderboard/cases', async (req, res) => {
    try {
      const users = await User.find().sort({ casesOpened: -1 }).limit(10)
      res.json(users)
    } catch (error) {
      console.warn('Database error in leaderboard/cases:', error.message)
      res.json([]) // Return empty array when database is unavailable
    }
  })
  app.get('/api/leaderboard/battles', async (req, res) => {
    try {
      const users = await User.find({ battlesPlayed: { $gt: 0 } })
        .sort({ battleWins: -1, battlesPlayed: 1 })
        .limit(10)
      res.json(users)
    } catch (error) {
      console.warn('Database error in leaderboard/battles:', error.message)
      res.json([]) // Return empty array when database is unavailable
    }
  })
  // Case contents ophalen
  app.get('/api/cases/:id/contents', (req, res) => {
    const id = req.params.id;
    if (caseContents[id]) {
      res.json(caseContents[id]);
    } else {
      res.status(404).json([]);
    }
  })

  // Voorbeeld data (vervang door echte database als je die hebt)
  const caseContents = {
    fever: [
      { _id: 'mp9_nexus', name: 'MP9 | Nexus', image: '/skins/mp9_nexus.png', price: 0.11, rarity: 'mil-spec' },
      { _id: 'usp_pcgrn', name: 'USP-S | PC-GRN', image: '/skins/usp_pcgrn.png', price: 0.07, rarity: 'mil-spec' },
      { _id: 'famas_badtrip', name: 'FAMAS | Bad Trip', image: '/skins/famas_badtrip.png', price: 8.42, rarity: 'covert' },
      { _id: 'glock_shinobu', name: 'Glock-18 | Shinobu', image: '/skins/glock_shinobu.png', price: 12.96, rarity: 'classified' },
      { _id: 'ak_searingrage', name: 'AK-47 | Searing Rage', image: '/skins/ak_searingrage.png', price: 43.59, rarity: 'classified' },
      { _id: 'awp_printstream', name: 'AWP | Printstream', image: '/skins/awp_printstream.png', price: 111.58, rarity: 'covert' },
      { _id: 'zeus_tosai', name: 'Zeus x27 | Tosai', image: '/skins/zeus_tosai.png', price: 0.47, rarity: 'restricted' },
      { _id: 'ump_ko', name: 'UMP-45 | K.O.', image: '/skins/ump_ko.png', price: 4.39, rarity: 'classified' },
      { _id: 'nova_risingsun', name: 'Nova | Rising Sun', image: '/skins/nova_risingsun.png', price: 0.93, rarity: 'restricted' },
      { _id: 'nomad_fade', name: '★ Nomad Knife | Fade', image: '/skins/nomad_fade.png', price: 1220.17, rarity: 'knife' },
      { _id: 'nomad_slaughter', name: '★ Nomad Knife | Slaughter', image: '/skins/nomad_slaughter.png', price: 337.00, rarity: 'knife' },
    ],
    snakebite: [
      { _id: 'ump_oscillator', name: 'UMP-45 | Oscillator', image: '/skins/ump_oscillator.png', price: 0.17, rarity: 'mil-spec' },
      { _id: 'sg553_heavymetal', name: 'SG553 | Heavy Metal', image: '/skins/sg553_heavymetal.png', price: 0.07, rarity: 'mil-spec' },
      { _id: 'nova_windblown', name: 'Nova | Windblown', image: '/skins/nova_windblown.png', price: 0.42, rarity: 'mil-spec' },
      { _id: 'r8_junkyard', name: 'R8 Revolver | Junk Yard', image: '/skins/r8_junkyard.png', price: 0.60, rarity: 'mil-spec' },
      { _id: 'cz75_circaetus', name: 'CZ75-Auto | Circaetus', image: '/skins/cz75_circaetus.png', price: 0.59, rarity: 'mil-spec' },
      { _id: 'glock_clearpolymer', name: 'Glock-18 | Clear Polymer', image: '/skins/glock_clearpolymer.png', price: 0.58, rarity: 'mil-spec' },
      { _id: 'mac10_buttonmasher', name: 'MAC-10 | Button Masher', image: '/skins/mac10_buttonmasher.png', price: 0.47, rarity: 'restricted' },
      { _id: 'p250_cybershell', name: 'P250 | Cyber Shell', image: '/skins/p250_cybershell.png', price: 1.76, rarity: 'restricted' },
      { _id: 'deagle_triggerdiscipline', name: 'Desert Eagle | Trigger Discipline', image: '/skins/deagle_triggerdiscipline.png', price: 3.44, rarity: 'restricted' },
      { _id: 'ak_slate', name: 'AK-47 | Slate', image: '/skins/ak_slate.png', price: 17.60, rarity: 'restricted' },
      { _id: 'xm1014_xoxo', name: 'XM1014 | XOXO', image: '/skins/xm1014_xoxo.png', price: 12.29, rarity: 'classified' },
      { _id: 'galil_chromaticaberration', name: 'Galil AR | Chromatic Aberration', image: '/skins/galil_chromaticaberration.png', price: 13.99, rarity: 'classified' },
      { _id: 'mp9_foodchain', name: 'MP9 | Food Chain', image: '/skins/mp9_foodchain.png', price: 13.00, rarity: 'classified' },
      { _id: 'usp_thetraitor', name: 'USP-S | The Traitor', image: '/skins/usp_thetraitor.png', price: 80.19, rarity: 'covert' },
      { _id: 'm4a4_inlivingcolor', name: 'M4A4 | In Living Color', image: '/skins/m4a4_inlivingcolor.png', price: 61.97, rarity: 'covert' },
      { _id: 'bfg_unhinged', name: '★ Broken Fang Gloves | Unhinged', image: '/skins/bfg_unhinged.png', price: 329.00, rarity: 'knife' }, 
      { _id: 'sg_slingshot', name: '★ Sport Gloves | Slingshot', image: '/skins/sg_slingshot.png', price: 1079.51, rarity: 'knife' },
      { _id: 'hw_caution', name: '★ Hand Wraps | CAUTION!', image: '/skins/hw_caution.png', price: 494.65, rarity: 'knife' },
      { _id: 'dg_snowleopard', name: '★ Driver Gloves | Snow Leopard', image: '/skins/dg_snowleopard.png', price: 707.65, rarity: 'knife' }, 

    ],
    test: [
      { _id: 'mp9_nexus', name: 'MP9 | Nexus', image: '/skins/mp9_nexus.png', price: 0.11, rarity: 'mil-spec' },
      { _id: 'usp_pcgrn', name: 'USP-S | PC-GRN', image: '/skins/usp_pcgrn.png', price: 0.07, rarity: 'mil-spec' },
      { _id: 'famas_badtrip', name: 'FAMAS | Bad Trip', image: '/skins/famas_badtrip.png', price: 8.42, rarity: 'covert' },
      { _id: 'glock_shinobu', name: 'Glock-18 | Shinobu', image: '/skins/glock_shinobu.png', price: 12.96, rarity: 'classified' },
      { _id: 'ak_searingrage', name: 'AK-47 | Searing Rage', image: '/skins/ak_searingrage.png', price: 43.59, rarity: 'classified' },
      { _id: 'awp_printstream', name: 'AWP | Printstream', image: '/skins/awp_printstream.png', price: 111.58, rarity: 'covert' },
      { _id: 'zeus_tosai', name: 'Zeus x27 | Tosai', image: '/skins/zeus_tosai.png', price: 0.47, rarity: 'restricted' },
      { _id: 'ump_ko', name: 'UMP-45 | K.O.', image: '/skins/ump_ko.png', price: 4.39, rarity: 'classified' },
      { _id: 'ak_aquamarine', name:'AK-47 | Aquamarine Revenge', image: '/skins/ak_aquamarine.png', price: 56.26, rarity:'covert' },
      { _id: 'ak_vulcan', name:'AK-47 | Vulcan', image: '/skins/ak_vulcan.png', price: 562.06, rarity:'covert' },
      { _id: 'ak_casehardened', name:'AK-47 | Case Hardened', image: '/skins/ak_casehardened.png', price: 152.06, rarity:'classified' },
      { _id: 'awp_dragonlore', name: 'AWP | Dragon Lore', image: '/skins/awp_dragonlore.png', price: 10000.00, rarity: 'covert' },
      { _id: 'nomad_fade', name: '★ Nomad Knife | Fade', image: '/skins/nomad_fade.png', price: 1220.17, rarity: 'knife' },
      { _id: 'nomad_slaughter', name: '★ Nomad Knife | Slaughter', image: '/skins/nomad_slaughter.png', price: 337.00, rarity: 'knife' },
      { _id: 'awp_chromecannon', name: 'AWP | Chrome Cannon', image: '/skins/awp_chromecannon.png', price: 420.69, rarity: 'covert' },
      { _id: 'bfg_unhinged', name: '★ Broken Fang Gloves | Unhinged', image: '/skins/bfg_unhinged.png', price: 329.00, rarity: 'knife' }, 
      { _id: 'sg_slingshot', name: '★ Sport Gloves | Slingshot', image: '/skins/sg_slingshot.png', price: 1079.51, rarity: 'knife' },
      { _id: 'hw_caution', name: '★ Hand Wraps | CAUTION!', image: '/skins/hw_caution.png', price: 494.65, rarity: 'knife' },
      { _id: 'dg_snowleopard', name: '★ Driver Gloves | Snow Leopard', image: '/skins/dg_snowleopard.png', price: 707.65, rarity: 'knife' },
    ]
  }

  // In alle caseContents arrays:
  // FAMAS | Bad Trip en AWP | Printstream moeten rarity: 'covert' hebben
  // (al gedaan in de laatste versie, maar check en forceer dit voor zekerheid)
  Object.values(caseContents).forEach(arr => {
    arr.forEach(skin => {
      if (skin.name === 'FAMAS | Bad Trip' || skin.name === 'AWP | Printstream') {
        skin.rarity = 'covert';
      }
    })
  })
}

export default apiRoutes