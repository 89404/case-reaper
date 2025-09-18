const cases = [
  {
    _id: 'fever',
    name: 'Fever Case',
    image: '/cases/fever.png',
    price: 1.01,
    skins: [
      { name: 'MP9 | Nexus', image: '/skins/mp9_nexus.png', price: 0.11, rarity: 'mil-spec' },
      { name: 'USP-S | PC-GRN', image: '/skins/usp_pcgrn.png', price: 0.07, rarity: 'mil-spec' },
      { name: 'Glock-18 | Shinobu', image: '/skins/glock_shinobu.png', price: 12.96, rarity: 'classified' },
      { name: 'AWP | Printstream', image: '/skins/awp_printstream.png', price: 783.09, rarity: 'covert' },
      { name: 'Gold Item', image: '/gold.png', price: 0, rarity: 'gold', goldItems: [
        { name: 'Nomad Knife | Fade', image: '/skins/nomad_fade.png', price: 471.33, rarity: 'knife' },
        { name: 'Sport Gloves | Pandora\'s Box', image: '/skins/gloves_pandora.png', price: 2500.00, rarity: 'glove' }
      ]}
    ]
  },
  {
    _id: 'snakebite',
    name: 'Snakebite Case',
    image: '/cases/snakebite.png',
    price: 0.65,
    skins: [
      { name: 'Nova | Rising Sun', image: '/skins/nova_risingsun.png', price: 0.93, rarity: 'restricted' },
      { name: 'UMP-45 | K.O. Factory', image: '/skins/ump_ko.png', price: 30.30, rarity: 'classified' },
      { name: 'Nomad Knife | Fade', image: '/skins/nomad_fade.png', price: 471.33, rarity: 'knife' },
      { name: 'Gold Item', image: '/gold.png', price: 0, rarity: 'gold', goldItems: [
        { name: 'Butterfly Knife | Tiger Tooth', image: '/skins/butterfly_tiger.png', price: 1200.00, rarity: 'knife' },
        { name: 'Driver Gloves | King Snake', image: '/skins/gloves_kingsnake.png', price: 800.00, rarity: 'glove' }
      ]}
    ]
  },
  {
    _id: 'test',
    name: 'Test Case',
    image: '/cases/test.png',
    price: 0.42,
    skins: [
      { name: 'FAMAS | Bad Trip', image: '/skins/famas_badtrip.png', price: 8.42, rarity: 'covert' },
      { name: 'Zeus x27 | Tosai', image: '/skins/zeus_tosai.png', price: 0.47, rarity: 'restricted' },
      { name: 'Nomad Knife | Slaughter', image: '/skins/nomad_slaughter.png', price: 1323.26, rarity: 'knife' },
      { name: 'Gold Item', image: '/gold.png', price: 0, rarity: 'gold', goldItems: [
        { name: 'Karambit | Doppler', image: '/skins/karambit_doppler.png', price: 3000.00, rarity: 'knife' },
        { name: 'Specialist Gloves | Crimson Kimono', image: '/skins/gloves_crimson.png', price: 4500.00, rarity: 'glove' }
      ]}
    ]
  }
]
export default cases